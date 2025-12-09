import { useEffect, useState } from 'react';
import { FaBomb, FaGamepad, FaQuestionCircle, FaTrophy } from 'react-icons/fa';
import MineCipherPrototype from '../components/MineCipherPrototype';

const heroCards = [
  {
    title: 'Win Condition',
    body: 'Solve the jumbled cipher hidden inside the Minesweeper board while avoiding the mines.',
    icon: <FaTrophy className="text-3xl text-blue-600" />,
  },
  {
    title: 'Lose Condition',
    body: 'Trigger a mine or use five incorrect guesses and the board resets before you try again.',
    icon: <FaBomb className="text-3xl text-red-600" />,
  },
];

const heroSteps = [
  'Click safe tiles to expose letters and numbers.',
  'Use number hints to avoid mines like in traditional Minesweeper.',
  'Collect cipher letters to reconstruct the encrypted word.',
  'Submit your guess within five tries before the board resets.',
  'Change difficulty to scale the board size and word length.',
];

const Game = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [minecipherInfo, setMinecipherInfo] = useState(null);
  const [minecipherLoading, setMinecipherLoading] = useState(true);
  const [minecipherError, setMinecipherError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const fetchGameStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/game/status', {
          headers,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to fetch');
        setData(json);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const fetchMinecipherInfo = async () => {
      setMinecipherLoading(true);
      setMinecipherError('');
      try {
        const res = await fetch('http://localhost:5000/api/game/minecipher', {
          headers,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load MineCipher info');
        setMinecipherInfo(json.minecipher);
      } catch (err) {
        setMinecipherError(err.message || 'Unknown error');
      } finally {
        setMinecipherLoading(false);
      }
    };

    fetchGameStatus();
    fetchMinecipherInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="space-y-6 md:w-1/2">
              <p className="text-xs font-semibold uppercase tracking-[0.6em] text-blue-500">MineCipher</p>
              <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">MineCipher</h1>
              <p className="text-lg text-slate-600">
                Solve the jumbled cipher hidden inside a Minesweeper board without triggering a mine. Numbers become hints,
                cipher letters appear as you reveal tiles, and you only have five guesses to crack the final word.
              </p>
            </div>
            <div className="space-y-6 md:w-1/2">
              <div className="grid gap-4 sm:grid-cols-2">
                {heroCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {card.icon}
                      <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.body}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">How to play</p>
                <ul className="mt-3 space-y-2 text-slate-600">
                  {heroSteps.map((step) => (
                    <li key={step} className="flex items-start gap-2">
                      <FaGamepad className="mt-1 text-slate-400" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {minecipherInfo && <MineCipherPrototype minecipherInfo={minecipherInfo} />}
      </div>
    </div>
  );
};

export default Game;
