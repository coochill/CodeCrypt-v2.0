from app import app
from werkzeug.serving import run_simple

if __name__ == '__main__':
    print('[run_direct] Starting via run_simple on http://127.0.0.1:5000')
    run_simple('127.0.0.1', 5000, app, use_reloader=False)
