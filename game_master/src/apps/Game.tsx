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
}

const Game: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            description: response.data.description || 'No description available'  // Default description
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

  const handleAddToCart = () => {
    console.log(`Game ${id} added to cart`);
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
          <div className="md:w-1/2 p-2 flex flex-col bg-yellow-60 rounded-2xl  items-center">
            <h2 className="text-3xl font-bold  p-10">{game.name}</h2>
            <div className="text-xl mb-4 flex items-center">
              <span className="line-through text-gray-500 mr-2">€{(parseFloat(game.price) * 1.33).toFixed(2)}</span>  {/* Assuming a discount */}
              <span>€{parseFloat(game.price).toFixed(2)}</span>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
            >
              Add to Cart
            </button>
            <div className="text-sm mb-4">
              <span className="text-green-500 mr-2">In stock</span>
              <span className="text-gray-400">| Digital download</span>
            </div>
            <p className="text-sm mb-4">{game.description}</p>
            <div className="text-xs text-gray-500">
              <p><strong>Developer:</strong> Example Developer</p>
              <p><strong>Publisher:</strong> Example Publisher</p>
              <p><strong>Release date:</strong> 28 April 2024</p>
              <p><strong>Genres:</strong> Single-player, Simulation, Strategy, Early Access</p>
              <p><strong>All Steam reviews:</strong> Very positive (34589)</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Game;
