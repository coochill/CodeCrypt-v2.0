import { cipherAlgorithms } from '../utils/cipherAlgorithms'

const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    // Fall back to client-side processing if backend is unavailable
    throw error;
  }
};

export const cipherService = {
  async encodeText(cipherType, text, key = null) {
    const recordHistory = (result, recordKey) => {
      this.saveToHistory(cipherType, 'encode', text, result, recordKey);
    };

    try {
      const token = localStorage.getItem('token');
      const processedKey = cipherAlgorithms[cipherType]?.keyType === 'number' && key !== null
        ? Number(key)
        : key;

      if (token) {
        try {
          const response = await apiCall('/cipher/encode', {
            method: 'POST',
            body: JSON.stringify({ 
              text, 
              cipher_type: cipherType, 
              key: processedKey 
            }),
          });
          recordHistory(response.result, processedKey);
          return { result: response.result };
        } catch (apiError) {
          console.warn('Backend API failed, falling back to client-side:', apiError);
        }
      }

      const algorithm = cipherAlgorithms[cipherType];
      if (!algorithm) {
        throw new Error(`Cipher type "${cipherType}" not supported`);
      }
      
      const result = algorithm.encode(text, processedKey);
      
      recordHistory(result, processedKey);
      
      return { result };
    } catch (error) {
      throw new Error(error.message || 'Encoding failed');
    }
  },

  async decodeText(cipherType, text, key = null) {
    const recordHistory = (result, recordKey) => {
      this.saveToHistory(cipherType, 'decode', text, result, recordKey);
    };

    try {
      const token = localStorage.getItem('token');
      const processedKey = cipherAlgorithms[cipherType]?.keyType === 'number' && key !== null
        ? Number(key)
        : key;

      if (token) {
        try {
          const response = await apiCall('/cipher/decode', {
            method: 'POST',
            body: JSON.stringify({ 
              text, 
              cipher_type: cipherType, 
              key: processedKey 
            }),
          });
          recordHistory(response.result, processedKey);
          return { result: response.result };
        } catch (apiError) {
          console.warn('Backend API failed, falling back to client-side:', apiError);
        }
      }

      const algorithm = cipherAlgorithms[cipherType];
      if (!algorithm) {
        throw new Error(`Cipher type "${cipherType}" not supported`);
      }
      
      const result = algorithm.decode(text, processedKey);
      
      recordHistory(result, processedKey);
      
      return { result };
    } catch (error) {
      throw new Error(error.message || `Decoding failed`);
    }
  },

  saveToHistory(cipherType, operation, inputText, outputText, key) {
    // Save to localStorage for offline functionality
    try {
      const history = JSON.parse(localStorage.getItem('cipherHistory') || '[]');
      const entry = {
        id: Date.now(),
        cipher_type: cipherType,
        operation,
        input_text: inputText,
        output_text: outputText,
        key,
        timestamp: new Date().toISOString()
      };
      history.unshift(entry);
      
      // Keep only last 50 entries
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem('cipherHistory', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save to history:', e);
    }
  },

  async getHistory(page = 1, limit = 10) {
    try {
      // Try to get history from backend first
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await apiCall(`/cipher/history?page=${page}&limit=${limit}`);
          return response;
        } catch (apiError) {
          console.warn('Backend history API failed, using local history:', apiError);
        }
      }

      // Fallback to local history
      const history = JSON.parse(localStorage.getItem('cipherHistory') || '[]');
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return {
        history: history.slice(start, end),
        total: history.length,
        page,
        limit
      };
    } catch (e) {
      return { history: [], total: 0, page, limit };
    }
  },

  async deleteHistoryItem(id) {
    try {
      // Try backend first
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await apiCall(`/cipher/history/${id}`, { method: 'DELETE' });
          return { success: true };
        } catch (apiError) {
          console.warn('Backend delete API failed, using local storage:', apiError);
        }
      }

      // Fallback to local storage
      const history = JSON.parse(localStorage.getItem('cipherHistory') || '[]');
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem('cipherHistory', JSON.stringify(filtered));
      return { success: true };
    } catch (e) {
      throw new Error('Failed to delete history item');
    }
  },

  // Get available cipher types from backend
  async getCipherTypes() {
    try {
      const response = await apiCall('/cipher/types');
      return response;
    } catch (error) {
      // Return client-side cipher types as fallback
      const types = {};
      Object.keys(cipherAlgorithms).forEach(key => {
        types[key] = {
          requires_key: cipherAlgorithms[key].requiresKey || false
        };
      });
      return types;
    }
  }
}

export const favoritesService = {
  async list() {
    return apiCall('/favorites');
  },
  async add(cipherType) {
    return apiCall('/favorites', { method: 'POST', body: JSON.stringify({ cipher_type: cipherType }) });
  },
  async remove(cipherType) {
    return apiCall(`/favorites/${cipherType}`, { method: 'DELETE' });
  }
}

// Cipher definitions matching the original Flask app
export const CIPHERS = {
  affine: {
    name: 'Affine Cipher',
    description: 'A substitution cipher using a linear mathematical transformation',
    requiresKey: true,
    keyType: 'text',
    keyLabel: 'Key (a,b)',
    keyPlaceholder: 'Enter key like 5,8',
    example: 'Linear mathematical transformation'
  },
  atbash: {
    name: 'Atbash Cipher', 
    description: 'An ancient cipher that substitutes each letter with its opposite.',
    requiresKey: false,
    example: 'HELLO → SVOOL'
  },
  base64: {
    name: 'Base64 Encoding',
    description: 'Encode binary data into ASCII string format using Base64.',
    requiresKey: false,
    example: 'HELLO → SEVMTE8='
  },
  binary: {
    name: 'Binary Encoding',
    description: 'Convert text into binary code representation.',
    requiresKey: false,
    example: 'H → 01001000'
  },
  caesar: {
    name: 'Caesar Cipher',
    description: 'Encrypt text by shifting characters a certain number of positions.',
    requiresKey: true,
    keyType: 'number', 
    keyLabel: 'Shift Amount',
    keyPlaceholder: 'Enter shift (e.g., 3)',
    example: 'HELLO → KHOOR (shift of 3)'
  },
  hex: {
    name: 'Hexadecimal Encoding',
    description: 'Encode text into hexadecimal format.',
    requiresKey: false,
    example: 'HELLO → 48454C4C4F'
  },
  morse: {
    name: 'Morse Code',
    description: 'Convert text into Morse code signals.',
    requiresKey: false,
    example: 'SOS → ... --- ...'
  },
  rail_fence: {
    name: 'Rail Fence Cipher',
    description: 'A transposition cipher that arranges characters in a zig-zag pattern.',
    requiresKey: true,
    keyType: 'number',
    keyLabel: 'Number of Rails',
    keyPlaceholder: 'Enter rails (e.g., 3)', 
    example: 'Zig-zag pattern encryption'
  },
  rot13: {
    name: 'ROT13 Cipher', 
    description: 'A simple cipher that shifts letters by 13 places in the alphabet.',
    requiresKey: false,
    example: 'HELLO → URYYB'
  },
  vigenere: {
    name: 'Vigenere Cipher',
    description: 'A method of encrypting alphabetic text by using a simple form of polyalphabetic substitution.',
    requiresKey: true,
    keyType: 'text',
    keyLabel: 'Keyword',
    keyPlaceholder: 'Enter keyword (e.g., SECRET)',
    example: 'Polyalphabetic substitution'
  }
}
