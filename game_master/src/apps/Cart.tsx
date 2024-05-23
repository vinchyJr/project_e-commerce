import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

interface User {
  balance: number;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<Game[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/cart/${userId}`);
        setCart(response.data);
      } catch (error) {
        setError('Échec de la récupération des articles du panier');
        console.error('Une erreur s\'est produite lors de la récupération des articles du panier !', error);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${userId}`);
        setUser(response.data);
      } catch (error) {
        setError('Échec de la récupération des informations utilisateur');
        console.error('Une erreur s\'est produite lors de la récupération des informations utilisateur !', error);
      }
    };

    fetchCart();
    fetchUser();
  }, []);

  const handleRemoveFromCart = async (gameId: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/cart/remove', {
        userId: parseInt(userId),
        gameId: gameId
      });
      if (response.data.success) {
        const updatedCart = cart.filter(game => game.id !== gameId);
        setCart(updatedCart);
      } else {
        setError('Échec de la suppression du jeu du panier');
      }
    } catch (error) {
      setError('Échec de la suppression du jeu du panier');
      console.error('Une erreur s\'est produite lors de la suppression du jeu du panier !', error);
    }
  };

  const handlePurchase = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/purchase', {
        userId: parseInt(userId)
      });
      if (response.data.success) {
        setCart([]);
        alert('Achat terminé avec succès !');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec de la finalisation de l\'achat');
      console.error('Une erreur s\'est produite lors de la finalisation de l\'achat !', error);
    }
  };

  const totalAmount = cart.reduce((total, game) => total + parseFloat(game.price), 0).toFixed(2);

  return (
    <div className="bg-color-dark min-h-screen">
      <Header />
      <div className="container mx-auto p-4 pt-32 text-white">
        {error ? (
          <div className="flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {user && (
              <div className="text-center mb-6 bg-yellow-60 p-5 m-auto rounded-xl max-w-80 ">
                <h2 className="text-xl font-semibold">Solde: €{user.balance.toFixed(2)}</h2>
              </div>
            )}
            {cart.length === 0 ? (
              <div className="flex items-center justify-center">
                <p className="text-white">Votre panier est vide</p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-6 text-center">Votre Panier</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {cart.map(game => (
                    <div key={game.id} className="bg-yellow-60 p-4 rounded-2xl flex flex-col items-center">
                      {game.image && (
                        <img src={`data:image/jpeg;base64,${game.image}`} alt={`Image of ${game.name}`} className="w-full h-64 object-cover rounded-2xl mb-4" />
                      )}
                      <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
                      <p className="text-xl mb-2">€{parseFloat(game.price).toFixed(2)}</p>
                      <button
                        onClick={() => handleRemoveFromCart(game.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Supprimer du panier
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-2xl font-bold">Total: €{totalAmount}</p>
                  <button
                    onClick={handlePurchase}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mt-4"
                  >
                    Payer
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
