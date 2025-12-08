import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const Game = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/game/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to fetch');
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGameStatus();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Game Page</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {data && (
        <div className="text-center">
          <p>{data.message}</p>
          <p>User: {data.user.username}</p>
          <p>Game status: {data.game.status}</p>
        </div>
      )}
    </div>
  );
};

export default Game;
