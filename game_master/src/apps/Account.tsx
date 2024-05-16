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
  total: number;
}

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/user');
        setUser(response.data);
      } catch (error) {
        setError('Failed to fetch user data');
        console.error('There was an error fetching the user data!', error);
      }
    };

    // Fetch user orders
    const fetchUserOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3000/orders');
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
    navigate('/login');
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
    <div className="bg-color-dark min-h-screen">
      <Header />
      <div className="container mx-auto p-4 pt-32 text-white">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold mb-4">Mon Compte</h1>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
            <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Solde:</strong> €{user.balance.toFixed(2)}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Historique d'achat</h2>
            {orders.length === 0 ? (
              <p>Pas d'achats récents</p>
            ) : (
              <ul>
                {orders.map(order => (
                  <li key={order.id} className="mb-2">
                    <p><strong>Commande #{order.id}</strong></p>
                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p>Total: €{order.total.toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Déconnexion
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
