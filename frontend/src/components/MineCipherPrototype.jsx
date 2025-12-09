import { useCallback, useEffect, useMemo, useState } from 'react';
import englishWords from 'wordlist-english/english-words-70.json';

const fallbackWordBank = {
  5: [
    'APPLE',
    'BRAVO',
    'DELTA',
    'FROST',
    'GAMMA',
    'HONEY',
    'IRONY',
    'JAZZY',
    'KNIFE',
    'ORBIT',
    'LEMON',
    'MANGO',
    'NINJA',
    'OPERA',
    'PIXEL',
    'QUEST',
    'RIVER',
    'SOLAR',
    'SWEET',
    'TABLE',
    'TIDES',
    'UNITY',
    'VIVID',
    'WISER',
    'XENON',
    'YIELD',
    'ZESTY',
  ],
  6: [
    'ORCHID',
    'FATHER',
    'PLANET',
    'SILVER',
    'RHYTHM',
    'FLOWER',
    'CIRCLE',
    'MYSTIC',
    'SPRING',
    'CRIMES',
  ],
  7: [
    'LIBERTY',
    'VOYAGER',
    'MYSTERY',
    'CRYSTAL',
    'HELIXES',
    'WEATHER',
    'JOURNEY',
  ],
};

const TILE_SIZE = 40;
const TILE_GAP = 4;

const englishWordBank = (() => {
  const bank = {};
  const dictionary = Array.isArray(englishWords) ? englishWords : [];
  dictionary.forEach((word) => {
    const normalized = word.toUpperCase();
    if (!/^[A-Z]+$/.test(normalized)) return;
    const length = normalized.length;
    if (!bank[length]) {
      bank[length] = [];
    }
    bank[length].push(normalized);
  });
  return bank;
})();

const tileOptions = ['safe', 'safe', 'safe', 'safe', 'safe', 'mine'];

const cipherTransformers = {
  'Affine Cipher': (text) => {
    const a = 5;
    const b = 8;
    return text
      .split('')
      .map((char) => String.fromCharCode(((a * (char.charCodeAt(0) - 65) + b) % 26) + 65))
      .join('');
  },
  'Atbash Cipher': (text) =>
    text
      .split('')
      .map((char) => String.fromCharCode(90 - (char.charCodeAt(0) - 65)))
      .join(''),
  'Caesar Cipher': (text) => shiftText(text, 3),
  'Rail Fence Cipher': (text) => shiftText(text, 7),
  'ROT13 Cipher': (text) => shiftText(text, 13),
  'Vigenère Cipher': (text) => vigenereEncode(text, 'MINE'),
};

const getRandomFrom = (items) => items[Math.floor(Math.random() * items.length)];

const pickRandomWord = (length) => {
  const expandedBank = englishWordBank[length];
  if (expandedBank && expandedBank.length) {
    return getRandomFrom(expandedBank);
  }
  const bank = fallbackWordBank[length] ?? fallbackWordBank[5];
  return getRandomFrom(bank);
};

function shiftText(text, shift) {
  return text
    .split('')
    .map((char) => {
      if (!/[A-Z]/.test(char)) return char;
      return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
    })
    .join('');
}

function vigenereEncode(text, key) {
  const normalizedKey = key.toUpperCase();
  let keyIndex = 0;
  return text
    .split('')
    .map((char) => {
      if (!/[A-Z]/.test(char)) return char;
      const start = 65;
      const shift = normalizedKey[keyIndex % normalizedKey.length].charCodeAt(0) - start;
      keyIndex += 1;
      return String.fromCharCode(((char.charCodeAt(0) - start + shift) % 26) + start);
    })
    .join('');
}

function getNeighborIndices(index, rows, cols) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        neighbors.push(nextRow * cols + nextCol);
      }
    }
  }
  return neighbors;
}

function randomSample(array, size) {
  const copy = [...array];
  const result = [];
  while (copy.length && result.length < size) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function generateBoard(rows, cols) {
  const cells = [];
  for (let index = 0; index < rows * cols; index += 1) {
    const type = getRandomFrom(tileOptions);
    cells.push({
      index,
      type: type === 'mine' ? 'mine' : 'safe',
      number: 0,
      cipher: null,
    });
  }

  cells.forEach((cell) => {
    if (cell.type === 'mine') {
      const neighbors = getNeighborIndices(cell.index, rows, cols);
      neighbors.forEach((neighbor) => {
        if (cells[neighbor].type !== 'mine') {
          cells[neighbor].number += 1;
        }
      });
    }
  });

  const safePositions = cells.filter((cell) => cell.type === 'safe').map((cell) => cell.index);
  return { cells, safeCount: safePositions.length, safePositions };
}

function getHorizontalPlacement(cells, rows, cols, length) {
  const row = Math.floor(rows / 2);
  const validIndices = [];
  for (let col = 0; col < cols && validIndices.length < length; col += 1) {
    const index = row * cols + col;
    if (cells[index]?.type === 'safe') {
      validIndices.push(index);
    }
  }
  if (validIndices.length >= length) {
    return validIndices.slice(0, length);
  }
  return null;
}

function assignCipherLetters(cells, safePositions, targetWord, cipherWord, { rows, cols, difficultyName } = {}) {
  let selectedSquares;
  if (difficultyName === 'Hard') {
    const aligned = getHorizontalPlacement(cells, rows, cols, targetWord.length);
    selectedSquares = aligned ?? randomSample(safePositions, Math.min(targetWord.length, safePositions.length));
  } else {
    selectedSquares = randomSample(safePositions, Math.min(targetWord.length, safePositions.length));
  }
  const nextCells = cells.map((cell) => ({ ...cell }));
  selectedSquares.forEach((cellIndex, letterIndex) => {
    nextCells[cellIndex].cipher = {
      letter: cipherWord[letterIndex],
      plaintext: targetWord[letterIndex],
      letterIndex,
    };
  });
  return nextCells;
}

const MineCipherPrototype = ({ minecipherInfo }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCipher, setSelectedCipher] = useState('');
  const [boardData, setBoardData] = useState(null);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [flaggedCells, setFlaggedCells] = useState(new Set());
  const [statusMessage, setStatusMessage] = useState('');
  const [remainingGuesses, setRemainingGuesses] = useState(minecipherInfo?.max_guesses ?? 5);
  const [guessInput, setGuessInput] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [targetWord, setTargetWord] = useState('');
  const [cipherWord, setCipherWord] = useState('');
  const [revealedCipherLetters, setRevealedCipherLetters] = useState([]);
  const [gameState, setGameState] = useState('playing');

  useEffect(() => {
    if (!minecipherInfo) return;
    const difficultyNames = minecipherInfo.difficulties.map((diff) => diff.name);
    setSelectedDifficulty((prev) => {
      if (prev && difficultyNames.includes(prev)) {
        return prev;
      }
      if (difficultyNames.includes('Medium')) {
        return 'Medium';
      }
      return difficultyNames[0] ?? '';
    });
  }, [minecipherInfo]);

  useEffect(() => {
    if (!minecipherInfo) return;
    if (!selectedCipher) {
      setSelectedCipher(minecipherInfo.ciphers[0]?.name ?? '');
    } else if (!minecipherInfo.ciphers.some((cipher) => cipher.name === selectedCipher)) {
      setSelectedCipher(minecipherInfo.ciphers[0]?.name ?? '');
    }
  }, [minecipherInfo, selectedCipher]);

  const initializeGame = useCallback(() => {
    if (!minecipherInfo || !selectedDifficulty || !selectedCipher) return;
    const difficulty = minecipherInfo.difficulties.find((diff) => diff.name === selectedDifficulty) ?? minecipherInfo.difficulties[0];
    if (!difficulty) return;
    const rows = difficulty.rows ?? 10;
    const cols = difficulty.cols ?? 25;
    const wordLength = difficulty.word_length ?? 5;
    const board = generateBoard(rows, cols);
    const word = pickRandomWord(wordLength);
    const transformer = cipherTransformers[selectedCipher] ?? ((text) => shiftText(text, 3));
    const ciphered = transformer(word);
    const cellsWithCipher = assignCipherLetters(board.cells, board.safePositions, word, ciphered, {
      rows,
      cols,
      difficultyName: difficulty.name,
    });

    setBoardData({ rows, cols, cells: cellsWithCipher, safeCount: board.safeCount });
    setRemainingGuesses(minecipherInfo.max_guesses);
    setStatusMessage('Reveal safe tiles to collect cipher letters.');
    setGuessHistory([]);
    setGuessInput('');
    setTargetWord(word);
    setCipherWord(ciphered);
    setRevealedCipherLetters(Array(word.length).fill(''));
    setRevealedCells(new Set());
    setFlaggedCells(new Set());
    setGameState('playing');
  }, [minecipherInfo, selectedCipher, selectedDifficulty]);

  useEffect(() => {
    if (minecipherInfo && selectedDifficulty && selectedCipher) {
      initializeGame();
    }
  }, [minecipherInfo, selectedDifficulty, selectedCipher, initializeGame]);

  const cipherDetails = useMemo(() => {
    return minecipherInfo?.ciphers.find((cipher) => cipher.name === selectedCipher);
  }, [minecipherInfo, selectedCipher]);

  const safeRevealedCount = useMemo(() => {
    if (!boardData) return 0;
    let count = 0;
    revealedCells.forEach((index) => {
      if (boardData.cells[index]?.type === 'safe') {
        count += 1;
      }
    });
    return count;
  }, [boardData, revealedCells]);

  const revealCipherLetter = (cell) => {
    if (!cell?.cipher) return;
    setRevealedCipherLetters((prev) => {
      const next = [...prev];
      next[cell.cipher.letterIndex] = cell.cipher.letter;
      return next;
    });
  };

  const revealAllMines = () => {
    if (!boardData) return;
    setRevealedCells((prev) => {
      const next = new Set(prev);
      boardData.cells.forEach((cell) => {
        if (cell.type === 'mine') {
          next.add(cell.index);
        }
      });
      return next;
    });
  };

  const handleTileClick = (index) => {
    if (!boardData || gameState !== 'playing') return;
    if (flaggedCells.has(index)) return;
    const cell = boardData.cells[index];
    if (!cell) return;
    if (cell.type === 'mine') {
      setStatusMessage(`You hit a mine! The correct word was ${targetWord}.`);
      setGameState('lost');
      revealAllMines();
      return;
    }

    const stack = [index];
    const nextRevealed = new Set(revealedCells);
    const cipherCells = [];

    while (stack.length) {
      const current = stack.pop();
      if (nextRevealed.has(current)) continue;
      nextRevealed.add(current);
      const currentCell = boardData.cells[current];
      if (currentCell?.cipher) {
        cipherCells.push(currentCell);
      }
      if (currentCell && currentCell.number === 0) {
        const neighbors = getNeighborIndices(current, boardData.rows, boardData.cols);
        neighbors.forEach((neighbor) => {
          if (!nextRevealed.has(neighbor) && boardData.cells[neighbor].type !== 'mine') {
            stack.push(neighbor);
          }
        });
      }
    }

    cipherCells.forEach((cipherCell) => revealCipherLetter(cipherCell));
    setRevealedCells(nextRevealed);

    const nextSafeRevealed = Array.from(nextRevealed).filter((idx) => boardData.cells[idx]?.type === 'safe').length;
    if (nextSafeRevealed >= boardData.safeCount) {
      setStatusMessage('All safe tiles revealed. Now decode the cipher and submit the final word.');
    }
  };

  const handleFlagToggle = (event, index) => {
    event.preventDefault();
    if (gameState !== 'playing') return;
    setFlaggedCells((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleGuessSubmit = () => {
    if (!targetWord || !guessInput.trim()) return;
    const normalizedGuess = guessInput.trim().toUpperCase();
    if (gameState !== 'playing') {
      setGuessInput('');
      return;
    }

    setGuessHistory((prev) => [normalizedGuess, ...prev].slice(0, 5));
    setGuessInput('');

    if (normalizedGuess === targetWord) {
      setStatusMessage('Correct! The cipher is decoded. Well done.');
      setGameState('won');
      return;
    }

    setRemainingGuesses((prev) => {
      const nextGuesses = prev - 1;
      if (nextGuesses <= 0) {
        setStatusMessage(`Out of guesses! Final word unveiled: ${targetWord}.`);
        setGameState('lost');
        revealAllMines();
      } else {
        setStatusMessage(`Incorrect guess. ${nextGuesses} tries remaining.`);
      }
      return nextGuesses;
    });
  };

  if (!minecipherInfo) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Loading MineCipher prototype...
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">MineCipher board</h3>
            <p className="text-sm text-slate-500">Click tiles to expose letters, flag mines with right-click, then decode the cipher.</p>
          </div>
          <button
            type="button"
            onClick={initializeGame}
            className="rounded-full border border-[#0036c3] bg-[#0036c3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0029a0]"
          >
            Reset board
          </button>
        </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex w-fit items-center gap-2 rounded-[999px] border border-slate-200 bg-white/90 px-2 py-1 shadow-sm">
                {minecipherInfo.difficulties.map((diff) => (
                  <button
                    key={diff.name}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.name)}
                    className={`rounded-full px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] transition ${
                      selectedDifficulty === diff.name
                        ? 'border border-[#0036c3] bg-[#0036c3] text-white'
                        : 'border border-[#8fb5ff] bg-white text-[#0036c3]'
                    }`}
                  >
                    {diff.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="overflow-x-auto">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${boardData?.cols ?? 1}, minmax(0, ${TILE_SIZE}px))`,
                  gridAutoRows: `${TILE_SIZE}px`,
                  minWidth: `${(boardData?.cols ?? 1) * (TILE_SIZE + TILE_GAP) - TILE_GAP}px`,
                }}
              >
                {boardData?.cells.map((cell) => {
                  const isRevealed = revealedCells.has(cell.index) || gameState === 'lost';
                  const isFlagged = flaggedCells.has(cell.index);
                  const showMine = isRevealed && cell.type === 'mine';
                  let content = '';
                  if (showMine) {
                    content = '💣';
                  } else if (isFlagged) {
                    content = '🚩';
                  } else if (isRevealed) {
                    content = cell.cipher?.letter || (cell.number > 0 ? cell.number : '');
                  }
                  const tileStateClass = isRevealed
                    ? showMine
                      ? 'border-slate-200 bg-white text-slate-900'
                      : 'border-[#8795ba] bg-[#8795ba] text-white'
                    : isFlagged
                      ? 'border-slate-500 bg-slate-700 text-white'
                      : 'border-[#ced3e1] bg-[#ced3e1] text-[#0036c3]';
                  return (
                    <button
                      key={cell.index}
                      type="button"
                      onClick={() => handleTileClick(cell.index)}
                      onContextMenu={(event) => handleFlagToggle(event, cell.index)}
                      style={{ width: TILE_SIZE, height: TILE_SIZE }}
                      className={`flex items-center justify-center rounded-lg border text-sm font-semibold transition ${tileStateClass} ${showMine ? 'text-rose-500' : ''}`}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Safe tiles revealed: {safeRevealedCount} / {boardData?.safeCount ?? 0}
              </span>
              <span>Remaining guesses: {remainingGuesses}</span>
              <span>Game state: {gameState}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Cipher</span>
              <select
                value={selectedCipher}
                onChange={(event) => setSelectedCipher(event.target.value)}
                className="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-sm"
              >
                {minecipherInfo.ciphers.map((cipher) => (
                  <option key={cipher.name} value={cipher.name}>
                    {cipher.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-3 text-sm text-slate-600">{cipherDetails?.example}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0036c3] to-[#00229c] p-4">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Status</p>
            <p className="mt-2 text-lg font-semibold text-white">{statusMessage}</p>
            <p className="mt-1 text-xs text-slate-300">Target word length: {targetWord.length || '?'}</p>
            <p className="mt-1 text-xs text-slate-300">Encoder note: tiles reveal letters in jumbled order unless you pick Vigenère.</p>
            {gameState === 'lost' && targetWord && (
              <p className="mt-2 text-sm font-semibold text-amber-100">Final word: {targetWord}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Cipher letters</p>
            <div className="mt-2 flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {revealedCipherLetters.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-900"
                >
                  {letter || '•'}
                </span>
              ))}
            </div>
          </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Guess</label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={guessInput}
                maxLength={targetWord.length || undefined}
                onChange={(event) => setGuessInput(event.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm uppercase text-slate-900"
                placeholder="Type your guess"
              />
              <button
                type="button"
                onClick={handleGuessSubmit}
                  className="rounded-lg bg-[#0036c3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#0029a0]"
              >
                Submit
              </button>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {guessHistory.length === 0 && <li>Guesses appear here.</li>}
              {guessHistory.map((guess, index) => (
                <li key={`${guess}-${index}`} className="text-slate-700">
                  {guess}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </section>
  );
};

export default MineCipherPrototype;
