# CodeCrypt Flask Backend

A Flask API backend for the CodeCrypt cryptography application.

## Features

- **User Authentication**: JWT-based authentication system
- **Cipher Operations**: Support for 10+ classical cipher algorithms
- **History Tracking**: Store and manage cipher operation history
- **RESTful API**: Clean REST endpoints for frontend integration
- **Database**: SQLAlchemy with SQLite (easily configurable for other DBs)

## Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   copy .env.example .env  # Windows
   # or
   cp .env.example .env    # Linux/Mac
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Cipher Operations
- `POST /api/cipher/encode` - Encode text
- `POST /api/cipher/decode` - Decode text
- `GET /api/cipher/history` - Get operation history
- `DELETE /api/cipher/history/<id>` - Delete history item
- `DELETE /api/cipher/history/clear` - Clear all history
- `GET /api/cipher/types` - Get available cipher types

### Health Check
- `GET /api/health` - Health check endpoint
- `GET /api` - API information

## Supported Ciphers

1. **Caesar Cipher** - Character shift encryption
2. **Atbash Cipher** - Alphabet reversal
3. **ROT13** - Fixed 13-character shift
4. **Binary Encoding** - Text to binary conversion
5. **Hexadecimal** - Text to hex conversion
6. **Base64** - Base64 encoding/decoding
7. **Morse Code** - Morse code conversion
8. **Vigenère Cipher** - Polyalphabetic substitution
9. **Rail Fence Cipher** - Transposition cipher
10. **Affine Cipher** - Mathematical substitution

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Hashed password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Cipher History Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `cipher_type` - Type of cipher used
- `operation` - 'encode' or 'decode'
- `input_text` - Original text
- `output_text` - Processed text
- `key_used` - Key used (if applicable)
- `timestamp` - Operation timestamp

## Environment Variables

Create a `.env` file with the following variables:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///codecrypt.db
FLASK_ENV=development
FLASK_APP=app.py
PORT=5000
```

## Development

- The application runs on `http://localhost:5000`
- Database is automatically created on first run
- Default admin user: `admin@codecrypt.com` / `admin123`
- CORS is configured for React frontend on ports 3000 and 3001

## Production Deployment

1. Set `FLASK_ENV=production`
2. Use strong secret keys
3. Configure proper database (PostgreSQL recommended)
4. Set up proper CORS origins
5. Use a production WSGI server like Gunicorn

## Error Handling

The API returns consistent JSON error responses:
```json
{
  "message": "Error description",
  "error": "Detailed error (in development)"
}
```

## Authentication

Uses JWT tokens for authentication. Include token in headers:
```
Authorization: Bearer <your-jwt-token>
```

## Testing

You can test the API using tools like:
- Postman
- curl
- Python requests
- Your React frontend

Example curl request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```