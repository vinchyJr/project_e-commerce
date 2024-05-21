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

const Xbox: React.FC = () => {
  const [jeuxXbox, setJeuxXbox] = useState<Jeu[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:3000/games?platform=xbox');
        const games = response.data.map((game: any) => ({
          id: game.id,
          name: game.name,
          price: game.price,
          image: game.image ? `data:image/jpeg;base64,${game.image}` : null,
          videoUrl: game.video ? `data:video/mp4;base64,${game.video}` : null
        }));
        setJeuxXbox(games);
      } catch (error) {
        setError('Aucun jeu dans Xbox');
        console.error('Une erreur s est produite lors de la récupération des jeux', error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="bg-color-dark">
      <Header />
      <div className="container mx-auto p-4 pt-32">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Xbox Games</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          {jeuxXbox.map((jeu) => (
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

export default Xbox;
