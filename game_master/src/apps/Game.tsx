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

interface Review {
  id: number;
  userId: number;
  gameId: number;
  rating: number;
  comment: string;
  username: string;
}

const Game: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<{ rating: number; comment: string }>({ rating: 0, comment: '' });
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

          const reviewsResponse = await axios.get(`http://localhost:3000/reviews/${id}`);
          setReviews(reviewsResponse.data);
        } else {
          setError('ID de jeu invalide');
        }
      } catch (error) {
        setError('Échec de la récupération des détails du jeu');
        console.error('Une erreur s\'est produite lors de la récupération des détails du jeu !', error);
      }
    };

    fetchGame();
  }, [id]);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/cart/add', { userId: parseInt(userId, 10), gameId: game?.id });
      if (response.data.success) {
        setMessage('Jeu ajouté au panier avec succès');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec de l\'ajout du jeu au panier');
      console.error('Une erreur s\'est produite lors de l\'ajout du jeu au panier !', error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/reviews', {
        userId: parseInt(userId, 10),
        gameId: game?.id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      if (response.data.success) {
        setMessage('Avis soumis avec succès');
        setNewReview({ rating: 0, comment: '' });

        const reviewsResponse = await axios.get(`http://localhost:3000/reviews/${id}`);
        setReviews(reviewsResponse.data);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec de l\'envoi de l\'avis');
      console.error('Une erreur s\'est produite lors de l\'envoi de l\'avis !', error);
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
          <div className="md:w-1/2 pr-3">
            {game.videoUrl ? (
              <video
                src={game.videoUrl}
                aria-label={`Video of ${game.name}`}
                controls
                className="w-full h-full object-cover rounded-2xl"
              >
              Votre navigateur ne prend pas en charge la balise vidéo.              
              </video>
            ) : (
              <img src={game.image || ''} alt={`Image of ${game.name}`} className="w-full h-full object-cover rounded-2xl" />
            )}
          </div>
          <div className="md:w-1/2 flex flex-col bg-yellow-60 rounded-2xl items-center p-3">
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
              <span className="text-gray-400">| Téléchargement Digital</span>
            </div>
            <div className="text-xs text-gray-500 mb-12">
              <p><strong>Développer:</strong> vincent le meur</p>
              <p><strong>Publier:</strong> DeVinchyCode</p>
              <p><strong>Date de sortie:</strong> 28 April 2024</p>
              <p><strong>Genres:</strong> Jeux solo</p>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-yellow-60 p-5 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Avis</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400">Aucun avis pour le moment.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="bg-gray-800 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold">{review.username}</h4>
                    <span className="text-yellow-500">{Array(review.rating).fill('★').join('')}</span>
                  </div>
                  <p>{review.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Ajouter un avis</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Note:</label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow text-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Commentaire:</label>
              <textarea
                name="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow text-blue"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow text-black px-4 py-2 rounded-md hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow"
            >
              Soumettre un avis
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Game;
  