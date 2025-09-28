"""diagnose_server.py
Quick internal diagnostic for the CodeCrypt backend without requiring the network layer.

Usage:
  python diagnose_server.py [--reuse-user]

If --reuse-user is passed, it will skip registration if the test user already exists.
"""
from __future__ import annotations
import sys, json, random, string
from datetime import datetime

# Ensure backend path present if script run from repo root
from pathlib import Path
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

summary = {"ts": datetime.utcnow().isoformat() + 'Z'}

try:
    from app import app, db, User
except Exception as e:
    summary["import_app_error"] = repr(e)
    print(json.dumps(summary, indent=2))
    sys.exit(1)

client = app.test_client()

# Helper

def record(name, func):
    try:
        r = func()
        summary[name] = {"status": r.status_code}
        try:
            summary[name]["json"] = r.get_json()
        except Exception:
            summary[name]["body"] = r.data.decode(errors='ignore')
    except Exception as e:
        summary[name] = {"error": repr(e)}

# 1. Health
record("health", lambda: client.get('/api/health'))

# 2. Register + Login flow
TEST_EMAIL = f"diag_{''.join(random.choices(string.ascii_lowercase, k=6))}@example.com"
TEST_USER = TEST_EMAIL.split('@')[0]
TEST_PASS = 'secret123'

reuse = '--reuse-user' in sys.argv
existing = None
with app.app_context():
    existing = User.query.filter(User.email.like('diag_%@example.com')).first()

if reuse and existing:
    summary["register"] = {"skipped": True, "existing_user_id": existing.id}
else:
    record("register", lambda: client.post('/api/auth/register', json={
        "username": TEST_USER,
        "email": TEST_EMAIL,
        "password": TEST_PASS
    }))

# Determine which email to login with
login_email = TEST_EMAIL if not (reuse and existing) else existing.email
record("login", lambda: client.post('/api/auth/login', json={
    "email": login_email,
    "password": TEST_PASS
}))

# If login succeeded, try /me
login_json = summary.get('login', {}).get('json') or {}
token = login_json.get('token')
if token:
    record("me", lambda: client.get('/api/auth/me', headers={
        'Authorization': f'Bearer {token}'
    }))
else:
    summary['me'] = {"skipped": True, "reason": "no token"}

print(json.dumps(summary, indent=2))
