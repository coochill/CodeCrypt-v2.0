# CodeCrypt - React Frontend

A modern React application for cryptography tools, featuring classical cipher encoding and decoding capabilities.

## Features

- **Multiple Cipher Types**: Caesar, Atbash, ROT13, Morse Code, Binary, Hexadecimal, Base64, Vigenère, Playfair, and Rail Fence ciphers
- **User Authentication**: Login and registration system with profile management
- **Responsive Design**: Built with TailwindCSS for a modern, mobile-friendly interface
- **Real-time Processing**: Instant encoding and decoding of text
- **History Tracking**: Save and manage your cipher operations (for authenticated users)
- **Interactive UI**: Clean, intuitive interface with helpful examples and explanations
- **Favorites**: Mark ciphers you use most often and manage them from a dedicated Favorites page

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codecrypt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Header.jsx      # Navigation header
├── context/            # React contexts
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Home.jsx        # Landing page with cipher selection
│   ├── Login.jsx       # User login
│   ├── Register.jsx    # User registration
│   ├── CipherPage.jsx  # Main cipher tool interface
│   └── Profile.jsx     # User profile and history
├── services/           # API services
│   ├── authService.js  # Authentication API calls
│   └── cipherService.js # Cipher operations and definitions
├── utils/              # Utility functions
├── App.jsx             # Main app component
├── main.jsx            # React entry point
└── index.css           # Global styles with TailwindCSS
```

## Supported Ciphers

### Substitution Ciphers
- **Caesar Cipher** - Letter shifting with customizable shift amount
- **Atbash Cipher** - Alphabet reversal (A=Z, B=Y, etc.)
- **ROT13** - Caesar cipher with fixed shift of 13

### Encoding Methods
- **Morse Code** - Dots and dashes representation
- **Binary Code** - Binary representation of text
- **Hexadecimal** - Base-16 encoding
- **Base64** - Base64 encoding

### Advanced Ciphers
- **Vigenère Cipher** - Polyalphabetic substitution with keyword
- **Playfair Cipher** - Digraph substitution using 5×5 grid
- **Rail Fence Cipher** - Transposition cipher with zigzag pattern

## API Integration

The frontend communicates with a Flask backend API. Key endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info
- `POST /api/cipher/encode` - Encode text
- `POST /api/cipher/decode` - Decode text
- `GET /api/cipher/history` - Get user's cipher history
- `GET /api/favorites` - List user favorites
- `POST /api/favorites` - Add a favorite `{ cipher_type }`
- `DELETE /api/favorites/<cipher_type>` - Remove a favorite

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api

If not set, the app falls back to `http://localhost:5000/api` by default.

## Favorites System

Favorites are stored server-side (requires authentication). When not logged in, the Favorites page prompts the user to log in and shows no data. To add a new cipher to favorites:
1. Log in
2. Go to Favorites page
3. Use the "Add New Favorite" section to add any unsupported cipher

## Adding a New Cipher Type
1. Backend: implement encode/decode in `utils/ciphers.py` and add to `CIPHER_FUNCTIONS`.
2. Frontend: add configuration to `CIPHERS` in `cipherService.js`.
3. (Optional) Extend icon mapping in `Home.jsx` & `Sidebar.jsx`.
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Backend Requirements

This frontend requires the CodeCrypt Flask backend API to be running. The backend provides:

- User authentication and session management
- Cipher encoding/decoding algorithms
- History tracking and storage
- User profile management

Make sure to start the Flask backend server before using this frontend application.
