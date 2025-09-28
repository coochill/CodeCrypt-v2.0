from __future__ import annotations
import sys
from app import app

def main():
    try:
        from waitress import serve
    except Exception as e:
        print('waitress not installed:', e)
        sys.exit(2)

    print('[WAITRESS] Serving app on http://127.0.0.1:5000')
    serve(app, host='127.0.0.1', port=5000)

if __name__ == '__main__':
    main()
