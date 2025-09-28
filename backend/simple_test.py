from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'CodeCrypt Backend API is running'
    }), 200

if __name__ == '__main__':
    print("Starting simple Flask test server...")
    app.run(host='0.0.0.0', port=5000, debug=True)