import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import Footer from '../components/Footer';

interface Jeu {
  id: number;
  name: string;
  price: string;
  image: string | null;
  videoUrl?: string | null;
}

const Pc: React.FC = () => {
  const [jeuxPc, setJeuxPc] = useState<Jeu[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:3000/games');
        const games = await Promise.all(
          response.data.map(async (game: { id: number }) => {
            const gameDetails = await axios.get(`http://localhost:3000/game/${game.id}`);
            return {
              id: game.id,
              name: gameDetails.data.name,
              price: gameDetails.data.price,
              image: gameDetails.data.image ? `data:image/jpeg;base64,${gameDetails.data.image}` : null,
              videoUrl: gameDetails.data.video ? `data:video/mp4;base64,${gameDetails.data.video}` : null
            };
          })
        );
        setJeuxPc(games);
      } catch (error) {
        setError('Failed to fetch games');
        console.error('There was an error fetching the games!', error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="bg-color-dark">
      <Header />
      <div className="container mx-auto p-4 pt-32">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">PC Games</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          {jeuxPc.map((jeu) => (
            <GameCard key={jeu.id} jeu={{
              id: jeu.id,
              nom: jeu.name,
              price: `€${parseFloat(jeu.price).toFixed(2)}`,
              image: jeu.image,
              videoUrl: jeu.videoUrl
            }} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pc;
