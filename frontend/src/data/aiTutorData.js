// src/data/aiTutorData.js

export const toolsFaq = [
  {
    id: "affine",
    name: "Affine Cipher",
    questions: [
      {
        id: "what",
        label: "What is the Affine Cipher?",
        answer:
          "The Affine cipher is a substitution cipher that turns each letter into a number (0–25), multiplies it by a value a, adds a value b, then converts it back to a letter modulo 26. The values a and b are the key, and a must be chosen so it has no common factor with 26."
      },
      {
        id: "how",
        label: "How does Affine Cipher work in CodeCrypt?",
        answer:
          "In CodeCrypt you type a message and choose numeric keys a and b. Each letter is converted to a number, transformed using (a·x + b) mod 26, then turned back into letters to form the encrypted text."
      }
    ]
  },
  {
    id: "atbash",
    name: "Atbash Cipher",
    questions: [
      {
        id: "how",
        label: "How does the Atbash Cipher work?",
        answer:
          "Atbash is a simple substitution cipher where the alphabet is reversed. A becomes Z, B becomes Y, C becomes X, and so on. The same operation is used to encrypt and decrypt, so running it twice returns the original text."
      }
    ]
  },
  {
    id: "base64",
    name: "Base64 Encoding",
    questions: [
      {
        id: "how",
        label: "How does Base64 encoding work?",
        answer:
          "Base64 is an encoding, not encryption. It takes the raw bytes of your text, groups them into 6-bit chunks, and maps each chunk to a character in a 64-symbol alphabet (A–Z, a–z, 0–9, +, /). It is used to safely transmit binary data as text."
      }
    ]
  },
  {
    id: "binary",
    name: "Binary Encoding",
    questions: [
      {
        id: "how",
        label: "How does Binary Encoding work?",
        answer:
          "Binary encoding converts each character into its numeric code (usually ASCII or Unicode) and then represents that number in base-2. For example, the letter A (65 in decimal) becomes 01000001 in binary."
      }
    ]
  },
  {
    id: "caesar",
    name: "Caesar Cipher",
    questions: [
      {
        id: "what",
        label: "What is the Caesar Cipher?",
        answer:
          "The Caesar cipher is a substitution cipher that shifts each letter forward by a fixed number of positions in the alphabet. For example, with a shift of 3, A → D, B → E, and so on."
      },
      {
        id: "how",
        label: "How does Caesar Cipher work in CodeCrypt?",
        answer:
          "In CodeCrypt you choose a numeric shift key. For each letter, the app shifts it forward by that many positions modulo 26. To decrypt, you use the same shift in the opposite direction."
      }
    ]
  },
  {
    id: "hex",
    name: "Hexadecimal Encoding",
    questions: [
      {
        id: "how",
        label: "How does Hexadecimal Encoding work?",
        answer:
          "Hex encoding converts each byte of your text into a pair of hexadecimal digits (base-16 using 0–9 and A–F). It’s often used to display binary data in a compact, readable form."
      }
    ]
  },
  {
    id: "morse",
    name: "Morse Code",
    questions: [
      {
        id: "how",
        label: "How does Morse Code work?",
        answer:
          "Morse code represents letters and numbers using short and long signals called dots and dashes. For example, A is ·- and B is -···. In CodeCrypt, characters are looked up in a table and converted to their dot-dash sequences."
      }
    ]
  },
  {
    id: "railfence",
    name: "Rail Fence Cipher",
    questions: [
      {
        id: "how",
        label: "How does the Rail Fence Cipher work?",
        answer:
          "The Rail Fence cipher is a transposition cipher. Your message is written in a zig-zag pattern on a number of rails, then read row by row. This keeps the same letters but changes their order to hide the original message."
      }
    ]
  },
  {
    id: "rot13",
    name: "ROT13 Cipher",
    questions: [
      {
        id: "how",
        label: "How does ROT13 work?",
        answer:
          "ROT13 is a special case of the Caesar cipher with a fixed shift of 13. Each letter is replaced by the letter 13 positions later in the alphabet, wrapping around after Z. Applying ROT13 twice returns the original message."
      }
    ]
  },
  {
    id: "vigenere",
    name: "Vigenere Cipher",
    questions: [
      {
        id: "how",
        label: "How does the Vigenère Cipher work?",
        answer:
          "The Vigenère cipher uses a keyword to control a series of Caesar shifts. Each letter of the key chooses how far to shift the matching letter in the message. The key is repeated across the text, creating a pattern of different shifts."
      }
    ]
  },
  {
    id: "favorites",
    name: "Favorites Feature",
    questions: [
      {
        id: "how",
        label: "What does the Favorites feature do?",
        answer:
          "The Favorites section in CodeCrypt lets you quickly access the ciphers and encoders you use most often. You can mark tools as favorites so they’re easier to find later."
      }
    ]
  },
  {
    id: "history",
    name: "History Feature",
    questions: [
      {
        id: "how",
        label: "What does the History feature do?",
        answer:
          "History records your recent conversions. It helps you revisit messages you’ve already encoded or decoded without re-typing everything from scratch."
      }
    ]
  }
];
