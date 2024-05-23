import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface User {
  id: number;
  username: string;
  email: string;
  birthdate: string;
  balance: number;
  is_admin: boolean;
}

interface Order {
  id: number;
  date: string;
  statut: string;
  total: number;
  invoice: string;
}

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${userId}`);
        setUser(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
        setBirthdate(response.data.birthdate);
      } catch (error) {
        setError('Échec de la récupération des données utilisateur');
        console.error('Erreur lors de la récupération des données utilisateur!', error);
      }
    };

    const fetchUserOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        setError('Échec de la récupération des commandes');
        console.error('Erreur lors de la récupération des commandes!', error);
      }
    };

    fetchUserData();
    fetchUserOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleAddBalance = async (amount: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/user/balance', { userId: parseInt(userId, 10), amount });
      if (response.data.success) {
        setUser(prevUser => prevUser ? { ...prevUser, balance: prevUser.balance + amount } : prevUser);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec de la mise à jour du solde');
      console.error('Erreur lors de la mise à jour du solde!', error);
    }
  };

  const handleUpdateUser = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non trouvé');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/user/${userId}`, {
        username,
        email,
        birthdate
      });
      if (response.data.success) {
        setMessage('Informations mises à jour avec succès');
        setUser(prevUser => prevUser ? { ...prevUser, username, email, birthdate } : prevUser);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec de la mise à jour des informations utilisateur');
      console.error('Erreur lors de la mise à jour des informations utilisateur!', error);
    }
  };

  if (error) {
    return (
      <div className="bg-color-dark min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-color-dark min-h-screen flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="">
      <Header />
      <div className="container mx-auto m-4 mt-32 text-white flex flex-col items-center">
        <div className="bg-yellow-60 container mx-auto m-4 rounded-2xl p-5 max-w-[500px]">
          <h2 className="text-3xl font-bold mb-4">Mon Compte</h2>
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium">Nom d'utilisateur:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 p-2 block w-full rounded-md bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-blue text-center"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 block w-full rounded-md bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-blue text-center"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="birthdate" className="block text-sm font-medium">Date de naissance:</label>
              <input
                type="date"
                id="birthdate"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="mt-1 p-2 block w-full rounded-md bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-blue text-center"
              />
            </div>
            <button
              onClick={handleUpdateUser}
              className="bg-yellow text-black px-4 py-2 rounded-3xl hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow"
            >
              Mettre à jour
            </button>
          </div>
        </div>
        <div className="bg-yellow-60 container mx-auto m-4 rounded-2xl p-6 max-w-[500px]">
          {message && <p className="text-green-500">{message}</p>}
          {user.is_admin && (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Accès page Admin</h2>
              <a href="/admin" className="bg-yellow text-black px-4 py-2 rounded-3xl hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow">
                Page Admin
              </a>
            </div>
          )}
        </div>
        <div className="bg-yellow-60 container mx-auto m-4 rounded-2xl p-6 max-w-[500px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Solde: €{user.balance.toFixed(2)}</h2>
            <h2 className="text-xl font-semibold">Ajouter au solde</h2>
            <button onClick={() => handleAddBalance(10)} className="bg-yellow text-black px-4 py-2 rounded-3xl hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow">Ajouter 10€</button>
          </div>
        </div>
        <div className="bg-yellow-60 container mx-auto m-4 rounded-2xl p-6 max-w-[500px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Historique d'achat</h2>
            {orders.length === 0 ? (
              <p>Pas d'achats récents</p>
            ) : (
              <ul>
                {orders.map(order => (
                  <li key={order.id} className="mb-2">
                    <p><strong>Commande #{order.id}</strong></p>
                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p>Statut: {order.statut}</p>
                    <p>Total: €{order.total.toFixed(2)}</p>
                    <a href={`http://localhost:3000/factures/${order.invoice}`} target="_blank" rel="noopener noreferrer" className="bg-yellow text-black px-4 py-1 rounded-3xl hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow">Voir la facture</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-yellow text-black px-4 py-2 rounded-3xl hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow">
          Déconnexion
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
