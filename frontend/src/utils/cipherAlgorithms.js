// Client-side cipher implementations
export const cipherAlgorithms = {
  caesar: {
    encode: (text, shift) => {
      shift = parseInt(shift) % 26;
      return text.replace(/[a-zA-Z]/g, char => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + shift) % 26) + start);
      });
    },
    decode: (text, shift) => {
      shift = parseInt(shift) % 26;
      return text.replace(/[a-zA-Z]/g, char => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start - shift + 26) % 26) + start);
      });
    }
  },

  atbash: {
    encode: (text) => {
      return text.replace(/[a-zA-Z]/g, char => {
        if (char <= 'Z') {
          return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
        } else {
          return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
        }
      });
    },
    decode: (text) => {
      // Atbash is symmetric
      return cipherAlgorithms.atbash.encode(text);
    }
  },

  rot13: {
    encode: (text) => {
      return cipherAlgorithms.caesar.encode(text, 13);
    },
    decode: (text) => {
      return cipherAlgorithms.caesar.decode(text, 13);
    }
  },

  binary: {
    encode: (text) => {
      return text.split('').map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
      ).join(' ');
    },
    decode: (text) => {
      try {
        return text.split(' ').map(binary => 
          String.fromCharCode(parseInt(binary, 2))
        ).join('');
      } catch (e) {
        throw new Error('Invalid binary format');
      }
    }
  },

  hex: {
    encode: (text) => {
      return text.split('').map(char => 
        char.charCodeAt(0).toString(16).toUpperCase()
      ).join('');
    },
    decode: (text) => {
      try {
        let result = '';
        for (let i = 0; i < text.length; i += 2) {
          result += String.fromCharCode(parseInt(text.substr(i, 2), 16));
        }
        return result;
      } catch (e) {
        throw new Error('Invalid hexadecimal format');
      }
    }
  },

  base64: {
    encode: (text) => {
      try {
        return btoa(text);
      } catch (e) {
        throw new Error('Failed to encode to Base64');
      }
    },
    decode: (text) => {
      try {
        return atob(text);
      } catch (e) {
        throw new Error('Invalid Base64 format');
      }
    }
  },

  morse: {
    encode: (text) => {
      const morseMap = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
        '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.', ' ': '/'
      };
      return text.toUpperCase().split('').map(char => morseMap[char] || char).join(' ');
    },
    decode: (text) => {
      const morseMap = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
        '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
        '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
        '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
        '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
        '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
        '---..': '8', '----.': '9', '/': ' '
      };
      return text.split(' ').map(morse => morseMap[morse] || morse).join('');
    }
  },

  vigenere: {
    encode: (text, key) => {
      if (!key) throw new Error('Vigenere cipher requires a key');
      key = key.toUpperCase();
      let result = '';
      let keyIndex = 0;
      
      for (let char of text) {
        if (char.match(/[a-zA-Z]/)) {
          const start = char <= 'Z' ? 65 : 97;
          const shift = key.charCodeAt(keyIndex % key.length) - 65;
          result += String.fromCharCode(((char.charCodeAt(0) - start + shift) % 26) + start);
          keyIndex++;
        } else {
          result += char;
        }
      }
      return result;
    },
    decode: (text, key) => {
      if (!key) throw new Error('Vigenere cipher requires a key');
      key = key.toUpperCase();
      let result = '';
      let keyIndex = 0;
      
      for (let char of text) {
        if (char.match(/[a-zA-Z]/)) {
          const start = char <= 'Z' ? 65 : 97;
          const shift = key.charCodeAt(keyIndex % key.length) - 65;
          result += String.fromCharCode(((char.charCodeAt(0) - start - shift + 26) % 26) + start);
          keyIndex++;
        } else {
          result += char;
        }
      }
      return result;
    }
  },

  rail_fence: {
    encode: (text, rails) => {
      rails = parseInt(rails);
      if (rails <= 1) return text;
      
      const fence = Array(rails).fill().map(() => []);
      let rail = 0;
      let direction = 1;
      
      for (let char of text) {
        fence[rail].push(char);
        rail += direction;
        if (rail === rails - 1 || rail === 0) {
          direction = -direction;
        }
      }
      
      return fence.map(row => row.join('')).join('');
    },
    decode: (text, rails) => {
      rails = parseInt(rails);
      if (rails <= 1) return text;
      
      // Calculate positions
      const positions = [];
      let rail = 0;
      let direction = 1;
      
      for (let i = 0; i < text.length; i++) {
        positions.push(rail);
        rail += direction;
        if (rail === rails - 1 || rail === 0) {
          direction = -direction;
        }
      }
      
      // Fill rails
      const fence = Array(rails).fill().map(() => []);
      let index = 0;
      
      for (let r = 0; r < rails; r++) {
        for (let i = 0; i < positions.length; i++) {
          if (positions[i] === r) {
            fence[r].push(text[index++]);
          } else {
            fence[r].push(null);
          }
        }
      }
      
      // Read zigzag
      let result = '';
      rail = 0;
      direction = 1;
      const railIndexes = Array(rails).fill(0);
      
      for (let i = 0; i < text.length; i++) {
        result += fence[rail][railIndexes[rail]++];
        rail += direction;
        if (rail === rails - 1 || rail === 0) {
          direction = -direction;
        }
      }
      
      return result;
    }
  },

  affine: {
    encode: (text, key) => {
      // Simple affine implementation - expecting key format "a,b"
      const [a, b] = key.split(',').map(x => parseInt(x.trim()));
      if (!a || isNaN(b)) throw new Error('Affine cipher requires key format "a,b"');
      
      return text.replace(/[a-zA-Z]/g, char => {
        const start = char <= 'Z' ? 65 : 97;
        const x = char.charCodeAt(0) - start;
        return String.fromCharCode(((a * x + b) % 26) + start);
      });
    },
    decode: (text, key) => {
      const [a, b] = key.split(',').map(x => parseInt(x.trim()));
      if (!a || isNaN(b)) throw new Error('Affine cipher requires key format "a,b"');
      
      // Find multiplicative inverse of a modulo 26
      let aInv = 0;
      for (let i = 1; i < 26; i++) {
        if ((a * i) % 26 === 1) {
          aInv = i;
          break;
        }
      }
      if (aInv === 0) throw new Error('Invalid key: a must be coprime to 26');
      
      return text.replace(/[a-zA-Z]/g, char => {
        const start = char <= 'Z' ? 65 : 97;
        const y = char.charCodeAt(0) - start;
        return String.fromCharCode(((aInv * (y - b + 26)) % 26) + start);
      });
    }
  }
};
