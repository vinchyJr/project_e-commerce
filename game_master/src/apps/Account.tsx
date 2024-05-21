import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
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
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not found');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${userId}`);
        setUser(response.data);
      } catch (error) {
        setError('Failed to fetch user data');
        console.error('There was an error fetching the user data!', error);
      }
    };

    const fetchUserOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        setError('Failed to fetch orders');
        console.error('There was an error fetching the orders!', error);
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
      setError('User not found');
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
      setError('Failed to update balance');
      console.error('There was an error updating the balance!', error);
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
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="">
      <Header />
      <div className="bg-yellow-60 container mx-auto m-4 mt-32 text-white flex flex-col items-center rounded-2xl p-5">
        <h2 className="text-3xl font-bold mb-4">Mon Compte</h2>
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold">Informations personnelles</h2>
          <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Solde:</strong> €{user.balance.toFixed(2)}</p>
        </div>
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold">Ajouter au solde</h2>
          <button onClick={() => handleAddBalance(10)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Ajouter 10€</button>
        </div>
        <div className="mb-4 text-center">
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
                  <a href={`http://localhost:3000/invoices/${order.invoice}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">Voir la facture</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
          Déconnexion
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
