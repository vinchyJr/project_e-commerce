import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';

interface Jeu {
  id: number;
  name: string;
  price: string;
  image: string | null;
  videoUrl?: string | null;
  dateAdded?: string;
}

const Accueil: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [jeux, setJeux] = useState<Jeu[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jeuEnAvant, setJeuEnAvant] = useState<Jeu | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:3000/games?platform=all');
        const games = response.data.map((game: any) => ({
          id: game.id,
          name: game.name,
          price: game.price,
          image: game.image ? `data:image/jpeg;base64,${game.image}` : null,
          videoUrl: game.video ? `data:video/mp4;base64,${game.video}` : null,
          dateAdded: game.date_added
        }));

        const sortedGames = games.sort((a: Jeu, b: Jeu) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));

        setJeux(sortedGames.slice(0, 9));
      } catch (error) {
        setError('Échec de la récupération des jeux');
        console.error('Une erreur s\'est produite lors de la récupération des jeux !', error);
      }
    };

    const fetchFeaturedGame = async () => {
      try {
        const response = await axios.get('http://localhost:3000/featured-game');
        const gameId = response.data.id;

        const gameResponse = await axios.get(`http://localhost:3000/game/${gameId}`);
        const game = gameResponse.data;
        setJeuEnAvant({
          id: gameId,
          name: game.name,
          price: game.price,
          image: game.image ? `data:image/jpeg;base64,${game.image}` : null,
          videoUrl: game.video ? `data:video/mp4;base64,${game.video}` : null,
          dateAdded: game.date_added
        });
      } catch (error) {
        setError('Échec de la récupération du jeu en avant');
        console.error('Une erreur s\'est produite lors de la récupération du jeu en avant !', error);
      }
    };

    fetchGames();
    fetchFeaturedGame();

    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  if (error) {
    return (
      <div className="bg-color-dark min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-color-dark z-0">
      <Header />
      <div className="relative min-h-screen bg-color-dark text-white overflow-hidden">
        <div className="relative w-full" style={{ height: '60vh', marginTop: '0' }}>
          {jeuEnAvant && (
            <div className="relative h-full" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              <Link to={`/game/${jeuEnAvant.id}`}>
                {jeuEnAvant.videoUrl ? (
                  <video
                    src={jeuEnAvant.videoUrl}
                    aria-label={`Video of ${jeuEnAvant.name}`}
                    autoPlay
                    muted
                    loop
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full object-cover"
                  ></video>
                ) : (
                  <img
                    src={jeuEnAvant.image || ''}
                    alt={`Image of ${jeuEnAvant.name}`}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full object-cover"
                  />
                )}
              </Link>
              <div className="absolute left-32 top-1/2 transform -translate-y-1/2 p-4"
                style={{ backgroundColor: `rgba(253, 207, 118, ${isHovering ? '1' : '0.1'})`, borderRadius: '30px' }}>
                <Link to={`/game/${jeuEnAvant.id}`} className="block text-5xl font-bold mb-2 hover:text-blue-300">{jeuEnAvant.name}</Link>
                <Link to={`/game/${jeuEnAvant.id}`} className="block text-3xl hover:text-blue-300">{jeuEnAvant.price} €</Link>
              </div>
              {isAdmin && (
                <div className="absolute bottom-0 right-0 p-2 bg-yellow">
                  <Link to="/admin" className="text-red-500 hover:text-red-700">
                    Changer les jeux mis en avant
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="container mx-auto p-4 text-white">
          <h2 className="text-3xl font-bold text-center m-6">Ajouts Récents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jeux.map((jeu) => (
              <GameCard key={jeu.id} jeu={jeu} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Accueil;
