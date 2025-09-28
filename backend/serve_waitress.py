"""Alt server runner using waitress to avoid dev server early exit.
Usage: python serve_waitress.py
"""
import os
from waitress import serve

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[waitress] Serving on http://127.0.0.1:{port}")
    # waitress binds IPv4 localhost by default; specify host explicitly
    serve(app, host='127.0.0.1', port=port)
