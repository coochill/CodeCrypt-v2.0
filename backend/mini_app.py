"""Framework minimal Flask smoke separate from main app to see if early exit caused by configuration.
Run: python mini_app.py
"""
from flask import Flask
app = Flask(__name__)

@app.get('/ping')
def ping():
    return {'pong': True}

if __name__ == '__main__':
    print('[mini_app] starting')
    app.run(port=5055, use_reloader=False)
    print('[mini_app] app.run returned')
