"""Diagnostics script to identify why the dev server exits.

Runs a sequence:
 1. Print Python & library versions
 2. Test raw socket bind to port 5000
 3. Run a minimal Flask app via app.run (dev server)
 4. Run same minimal app via waitress (if installed)
 5. Optionally run the full application with waitress

Usage:
  python diagnostics_runner.py
  python diagnostics_runner.py --full --waitress
"""
from __future__ import annotations
import sys, time, socket, importlib, contextlib

PORT = 5000

def print_versions():
    print('[VERSIONS] Python', sys.version)
    for mod in ['flask','werkzeug','sqlalchemy','flask_sqlalchemy','flask_jwt_extended']:
        try:
            m = importlib.import_module(mod)
            print(f'[VERSIONS] {mod} {getattr(m, "__version__", "?")}')
        except Exception as e:
            print(f'[VERSIONS] {mod} import failed: {e}')

def test_raw_socket():
    print('[SOCKET] Attempting raw bind to port', PORT)
    s = socket.socket()
    try:
        s.bind(('127.0.0.1', PORT))
        print('[SOCKET] Bind OK, closing socket (port free for server).')
    except OSError as e:
        print('[SOCKET] Bind FAILED:', e)
    finally:
        s.close()

def run_minimal_flask(dev=True, waitress=False):
    from flask import Flask
    app = Flask('mini')
    @app.get('/ping')
    def ping():
        return {'pong': True}
    if waitress:
        try:
            import waitress
            print('[MINI] Starting waitress on :5000')
            waitress.serve(app, host='127.0.0.1', port=PORT)
        except Exception as e:
            print('[MINI] Waitress failed:', e)
    else:
        print('[MINI] Starting app.run threaded=False reloader=False')
        app.run('127.0.0.1', PORT, debug=False, use_reloader=False, threaded=False)

def probe_http():
    import urllib.request, json
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{PORT}/ping', timeout=2) as r:
            print('[PROBE] /ping', r.status, r.read())
    except Exception as e:
        print('[PROBE] Failed:', e)

def main():
    full = '--full' in sys.argv
    use_waitress = '--waitress' in sys.argv
    print_versions()
    test_raw_socket()
    if not full:
        # Minimal test
        try:
            run_minimal_flask(waitress=use_waitress)
        except Exception as e:
            print('[MINI] Exception:', e)
        return
    # Full application path
    print('[FULL] Importing full app')
    from app import app
    if use_waitress:
        try:
            import waitress
            print('[FULL] Starting full app with waitress')
            waitress.serve(app, host='127.0.0.1', port=PORT)
        except Exception as e:
            print('[FULL] Waitress failed:', e)
    else:
        print('[FULL] Starting full app via app.run')
        app.run('127.0.0.1', PORT, debug=False, use_reloader=False, threaded=False)

if __name__ == '__main__':
    main()
