import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Game {
  id: number;
  name: string;
  price: string;
  image: string | null;
  videoUrl?: string | null;
  description?: string;
  quantity: number;
}

const Game: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        if (id) {
          const response = await axios.get(`http://localhost:3000/game/${id}`);
          const gameData = {
            id: parseInt(id, 10),
            name: response.data.name,
            price: response.data.price,
            image: response.data.image ? `data:image/jpeg;base64,${response.data.image}` : null,
            videoUrl: response.data.video ? `data:video/mp4;base64,${response.data.video}` : null,
            description: response.data.description || 'No description available',
            quantity: response.data.quantity
          };
          setGame(gameData);
        } else {
          setError('Invalid game ID');
        }
      } catch (error) {
        setError('Failed to fetch game details');
        console.error('There was an error fetching the game details!', error);
      }
    };

    fetchGame();
  }, [id]);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not found');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/cart/add', { userId: parseInt(userId, 10), gameId: game?.id });
      if (response.data.success) {
        setMessage('Game added to cart successfully');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Failed to add game to cart');
      console.error('There was an error adding the game to the cart!', error);
    }
  };

  if (error) {
    return (
      <div className="bg-color-dark min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-color-dark min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="">
      <Header />
      <div className="container mx-auto p-4 pt-32 text-white mt-32 mb-32">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 p-4">
            {game.videoUrl ? (
              <video
                src={game.videoUrl}
                aria-label={`Video of ${game.name}`}
                controls
                className="w-full h-full object-cover rounded-2xl"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={game.image || ''} alt={`Image of ${game.name}`} className="w-full h-full object-cover rounded-2xl" />
            )}
          </div>
          <div className="md:w-1/2 flex flex-col bg-yellow-60 rounded-2xl  items-center p-5">
            <h2 className="text-3xl font-bold  p-10">{game.name}</h2>
            <div className="text-xl mb-4 flex items-center">
              <span className="line-through text-gray-500 mr-2">€{(parseFloat(game.price) * 1.33).toFixed(2)}</span>
              <span>€{parseFloat(game.price).toFixed(2)}</span>
            </div>
            <button
              onClick={handleAddToCart}
              className={`w-full bg-yellow text-black px-4 py-2 max-w-sm rounded-md ${game.quantity > 0 ? 'hover:bg-white' : 'opacity-50 cursor-not-allowed'} focus:outline-none focus:ring-2 border focus:ring-yellow mb-4`}
              disabled={game.quantity <= 0}
            >
              {game.quantity > 0 ? 'Ajouter au Panier' : 'Hors Stock'}
            </button>
            {message && <p className="text-green-500">{message}</p>}
            <div className="text-sm mb-4">
              <span className={game.quantity > 0 ? 'text-green-500' : 'text-red-500'} mr-2>
                {game.quantity > 0 ? 'In stock' : 'Out of stock'}
              </span>
              <span className="text-gray-400">| Digital download</span>
            </div>
            <div className="text-xs text-gray-500 mb-12">
              <p><strong>Développer:</strong> vincent le meur</p>
              <p><strong>Publier:</strong> DeVinchyCode</p>
              <p><strong>Release date:</strong> 28 April 2024</p>
              <p><strong>Genres:</strong> Jeux solo</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Game;
