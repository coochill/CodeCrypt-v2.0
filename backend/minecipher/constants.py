"""Shared MineCipher metadata for both the Tk app and the API."""

DIFFICULTY_PRESETS = {
    "Easy": (6, 15),
    "Medium": (10, 25),
    "Hard": (14, 35),
}

DIFFICULTY_WORD_LENGTH = {
    "Easy": 5,
    "Medium": 6,
    "Hard": 7,
}

MINECIPHER_CIPHERS = {
    "Affine Cipher": {
        "example": "Affine uses coefficients a=5, b=8. Message HELLO becomes MJQQT; decoding applies a⁻¹=21 and subtracts b to recover HELLO.",
    },
    "Atbash Cipher": {
        "example": "Atbash mirrors A↔Z, B↔Y etc. Example: HELLO → SVOOL by swapping each letter across the alphabet.",
    },
    "Caesar Cipher": {
        "example": "Caesar shifts by +3. HELLO becomes KHOOR; decoding shifts letters by -3 to get the original word.",
    },
    "Rail Fence Cipher": {
        "example": "Rail Fence with depth 3 writes HELLO as HOELL when read row-wise; decoding re-interleaves the rows to reconstruct HELLO.",
    },
    "ROT13 Cipher": {
        "example": "ROT13 rotates each letter by 13 places. HELLO → URYYB; applying ROT13 again returns the original.",
    },
    "Vigenère Cipher": {
        "example": "Vigenère with key MINE shifts letters by key letters. Using key MINE, HELLO → TMYPA; decode by reversing each shift with the key.",
    },
}

MINECIPHER_INFO_CARDS = {
    "win": "Reveal non-mine tiles, decode the cipher letters, then submit the final word without triggering a mine.",
    "lose": "Hit a mine or use up five incorrect final-word guesses and the board will explode.",
    "how": "Click safe tiles to glimpse cipher letters. Use the hints to crack the transformed word, then submit your guess.",
}

MAX_GUESSES = 5
LAUNCH_COMMAND = "python backend/minecipher/minecipher_app.py"
OVERVIEW = "Solve the jumbled cipher hidden in the Minesweeper board."
