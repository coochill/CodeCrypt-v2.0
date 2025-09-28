"""
Cipher algorithm implementations for the Flask backend
"""

class CipherAlgorithms:
    """Collection of cipher algorithms"""
    
    @staticmethod
    def caesar_encode(text, shift):
        """Caesar cipher encoding"""
        shift = int(shift) % 26
        result = ""
        for char in text:
            if char.isalpha():
                start = ord('A') if char.isupper() else ord('a')
                result += chr((ord(char) - start + shift) % 26 + start)
            else:
                result += char
        return result
    
    @staticmethod
    def caesar_decode(text, shift):
        """Caesar cipher decoding"""
        return CipherAlgorithms.caesar_encode(text, -int(shift))
    
    @staticmethod
    def atbash_encode(text):
        """Atbash cipher encoding/decoding (symmetric)"""
        result = ""
        for char in text:
            if char.isalpha():
                if char.isupper():
                    result += chr(ord('Z') - (ord(char) - ord('A')))
                else:
                    result += chr(ord('z') - (ord(char) - ord('a')))
            else:
                result += char
        return result
    
    @staticmethod
    def atbash_decode(text):
        """Atbash is symmetric"""
        return CipherAlgorithms.atbash_encode(text)
    
    @staticmethod
    def rot13_encode(text):
        """ROT13 encoding"""
        return CipherAlgorithms.caesar_encode(text, 13)
    
    @staticmethod
    def rot13_decode(text):
        """ROT13 decoding"""
        return CipherAlgorithms.caesar_decode(text, 13)
    
    @staticmethod
    def binary_encode(text):
        """Binary encoding"""
        return ' '.join(format(ord(char), '08b') for char in text)
    
    @staticmethod
    def binary_decode(text):
        """Binary decoding"""
        try:
            binary_strings = text.split()
            return ''.join(chr(int(binary, 2)) for binary in binary_strings)
        except ValueError:
            raise ValueError("Invalid binary format")
    
    @staticmethod
    def hex_encode(text):
        """Hexadecimal encoding"""
        return ''.join(format(ord(char), '02X') for char in text)
    
    @staticmethod
    def hex_decode(text):
        """Hexadecimal decoding"""
        try:
            return ''.join(chr(int(text[i:i+2], 16)) for i in range(0, len(text), 2))
        except ValueError:
            raise ValueError("Invalid hexadecimal format")
    
    @staticmethod
    def base64_encode(text):
        """Base64 encoding"""
        import base64
        return base64.b64encode(text.encode()).decode()
    
    @staticmethod
    def base64_decode(text):
        """Base64 decoding"""
        import base64
        try:
            return base64.b64decode(text).decode()
        except Exception:
            raise ValueError("Invalid Base64 format")
    
    @staticmethod
    def morse_encode(text):
        """Morse code encoding"""
        morse_dict = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', ' ': '/'
        }
        return ' '.join(morse_dict.get(char.upper(), char) for char in text)
    
    @staticmethod
    def morse_decode(text):
        """Morse code decoding"""
        morse_dict = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
            '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
            '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
            '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
            '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
            '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
            '---..': '8', '----.': '9', '/': ' '
        }
        return ''.join(morse_dict.get(morse, morse) for morse in text.split())
    
    @staticmethod
    def vigenere_encode(text, key):
        """Vigenère cipher encoding"""
        if not key:
            raise ValueError("Vigenère cipher requires a key")
        
        key = key.upper()
        result = ""
        key_index = 0
        
        for char in text:
            if char.isalpha():
                start = ord('A') if char.isupper() else ord('a')
                shift = ord(key[key_index % len(key)]) - ord('A')
                result += chr((ord(char) - start + shift) % 26 + start)
                key_index += 1
            else:
                result += char
        
        return result
    
    @staticmethod
    def vigenere_decode(text, key):
        """Vigenère cipher decoding"""
        if not key:
            raise ValueError("Vigenère cipher requires a key")
        
        key = key.upper()
        result = ""
        key_index = 0
        
        for char in text:
            if char.isalpha():
                start = ord('A') if char.isupper() else ord('a')
                shift = ord(key[key_index % len(key)]) - ord('A')
                result += chr((ord(char) - start - shift + 26) % 26 + start)
                key_index += 1
            else:
                result += char
        
        return result
    
    @staticmethod
    def rail_fence_encode(text, rails):
        """Rail fence cipher encoding"""
        rails = int(rails)
        if rails <= 1:
            return text
        
        fence = [[] for _ in range(rails)]
        rail = 0
        direction = 1
        
        for char in text:
            fence[rail].append(char)
            rail += direction
            if rail == rails - 1 or rail == 0:
                direction = -direction
        
        return ''.join([''.join(row) for row in fence])
    
    @staticmethod
    def rail_fence_decode(text, rails):
        """Rail fence cipher decoding"""
        rails = int(rails)
        if rails <= 1:
            return text
        
        # Calculate positions
        positions = []
        rail = 0
        direction = 1
        
        for i in range(len(text)):
            positions.append(rail)
            rail += direction
            if rail == rails - 1 or rail == 0:
                direction = -direction
        
        # Fill rails
        fence = [[] for _ in range(rails)]
        index = 0
        
        for r in range(rails):
            for i in range(len(positions)):
                if positions[i] == r:
                    fence[r].append(text[index])
                    index += 1
                else:
                    fence[r].append(None)
        
        # Read zigzag
        result = ""
        rail = 0
        direction = 1
        rail_indexes = [0] * rails
        
        for i in range(len(text)):
            result += fence[rail][rail_indexes[rail]]
            rail_indexes[rail] += 1
            rail += direction
            if rail == rails - 1 or rail == 0:
                direction = -direction
        
        return result
    
    @staticmethod
    def affine_encode(text, key):
        """Affine cipher encoding"""
        try:
            a, b = map(int, key.split(','))
        except ValueError:
            raise ValueError("Affine cipher requires key format 'a,b'")
        
        result = ""
        for char in text:
            if char.isalpha():
                start = ord('A') if char.isupper() else ord('a')
                x = ord(char) - start
                result += chr((a * x + b) % 26 + start)
            else:
                result += char
        
        return result
    
    @staticmethod
    def affine_decode(text, key):
        """Affine cipher decoding"""
        try:
            a, b = map(int, key.split(','))
        except ValueError:
            raise ValueError("Affine cipher requires key format 'a,b'")
        
        # Find multiplicative inverse of a modulo 26
        a_inv = None
        for i in range(1, 26):
            if (a * i) % 26 == 1:
                a_inv = i
                break
        
        if a_inv is None:
            raise ValueError("Invalid key: 'a' must be coprime to 26")
        
        result = ""
        for char in text:
            if char.isalpha():
                start = ord('A') if char.isupper() else ord('a')
                y = ord(char) - start
                result += chr((a_inv * (y - b + 26)) % 26 + start)
            else:
                result += char
        
        return result


# Dictionary mapping cipher types to their functions
CIPHER_FUNCTIONS = {
    'caesar': {
        'encode': CipherAlgorithms.caesar_encode,
        'decode': CipherAlgorithms.caesar_decode,
        'requires_key': True
    },
    'atbash': {
        'encode': CipherAlgorithms.atbash_encode,
        'decode': CipherAlgorithms.atbash_decode,
        'requires_key': False
    },
    'rot13': {
        'encode': CipherAlgorithms.rot13_encode,
        'decode': CipherAlgorithms.rot13_decode,
        'requires_key': False
    },
    'binary': {
        'encode': CipherAlgorithms.binary_encode,
        'decode': CipherAlgorithms.binary_decode,
        'requires_key': False
    },
    'hex': {
        'encode': CipherAlgorithms.hex_encode,
        'decode': CipherAlgorithms.hex_decode,
        'requires_key': False
    },
    'base64': {
        'encode': CipherAlgorithms.base64_encode,
        'decode': CipherAlgorithms.base64_decode,
        'requires_key': False
    },
    'morse': {
        'encode': CipherAlgorithms.morse_encode,
        'decode': CipherAlgorithms.morse_decode,
        'requires_key': False
    },
    'vigenere': {
        'encode': CipherAlgorithms.vigenere_encode,
        'decode': CipherAlgorithms.vigenere_decode,
        'requires_key': True
    },
    'rail_fence': {
        'encode': CipherAlgorithms.rail_fence_encode,
        'decode': CipherAlgorithms.rail_fence_decode,
        'requires_key': True
    },
    'affine': {
        'encode': CipherAlgorithms.affine_encode,
        'decode': CipherAlgorithms.affine_decode,
        'requires_key': True
    }
}