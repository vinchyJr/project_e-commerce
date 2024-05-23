import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface Stats {
  totalMembers: number;
  totalSales: number;
  newSales: number;
  totalRevenue: number;
  revenueLast7Days: number;
}

interface Game {
  id: number;
  name: string;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGameId, setFeaturedGameId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/users');
        setUsers(response.data);
      } catch (error) {
        setError('Échec de la récupération des utilisateurs');
        console.error('Erreur lors de la récupération des utilisateurs!', error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/stats');
        setStats(response.data.stats);
      } catch (error) {
        setError('Échec de la récupération des statistiques');
        console.error('Erreur lors de la récupération des statistiques!', error);
      }
    };

    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:3000/games?platform=all');
        setGames(response.data);
      } catch (error) {
        setError('Échec de la récupération des jeux');
        console.error('Erreur lors de la récupération des jeux!', error);
      }
    };

    const fetchFeaturedGame = async () => {
      try {
        const response = await axios.get('http://localhost:3000/featured-game');
        setFeaturedGameId(response.data.id);
      } catch (error) {
        setError('Échec de la récupération du jeu en avant');
        console.error('Erreur lors de la récupération du jeu en avant!', error);
      }
    };

    fetchUsers();
    fetchStats();
    fetchGames();
    fetchFeaturedGame();
  }, []);

  const handleBanUser = async (userId: number) => {
    try {
      const response = await axios.post('http://localhost:3000/admin/users/ban', { userId });
      if (response.data.success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec du bannissement de l\'utilisateur');
      console.error('Erreur lors du bannissement de l\'utilisateur!', error);
    }
  };

  const handleChangeFeaturedGame = async (event: React.FormEvent) => {
    event.preventDefault();
    if (featuredGameId === null) return;

    console.log('Updating featured game with ID:', featuredGameId);

    try {
      const response = await axios.put('http://localhost:3000/admin/featured-game', { gameId: featuredGameId });
      console.log('Response:', response.data);
      if (!response.data.success) {
        setError(response.data.error);
      } else {
        alert('Jeu en avant mis à jour avec succès');
      }
    } catch (error) {
      setError('Échec de la mise à jour du jeu en avant');
      console.error('Erreur lors de la mise à jour du jeu en avant!', error);
    }
  };

  if (error) {
    return (
      <div className="bg-color-dark min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="">
      <Header />
      <div className="container mx-auto mt-32 mb-32 p-4 text-white">
        <h2 className="text-3xl font-bold mb-4">Page Admin</h2>
        {stats && (
          <div className="bg-yellow-60 p-5 rounded-2xl mb-8">
            <h3 className="text-2xl font-bold mb-4">Tableau de Bord</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lg font-semibold">Nombre de membres:</p>
                <p className="text-xl">{stats.totalMembers}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lg font-semibold">Nombre de ventes:</p>
                <p className="text-xl">{stats.totalSales}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lg font-semibold">Nouvelles ventes sur les 7 derniers jours:</p>
                <p className="text-xl">{stats.newSales}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lg font-semibold">Revenus totaux du site:</p>
                <p className="text-xl">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lg font-semibold">Revenus du site sur les 7 derniers jours:</p>
                <p className="text-xl">€{stats.revenueLast7Days.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-yellow-60 p-5 rounded-2xl mb-8">
          <h3 className="text-2xl font-bold mb-4">Changer le jeu en avant</h3>
          <form onSubmit={handleChangeFeaturedGame}>
            <div className="mb-4">
              <label htmlFor="featuredGame" className="block text-lg mb-2">Sélectionnez un jeu:</label>
              <select
                id="featuredGame"
                className="w-full p-2 rounded-lg bg-gray-800 text-blue"
                value={featuredGameId || ''}
                onChange={(e) => setFeaturedGameId(Number(e.target.value))}
              >
                <option value="">Sélectionnez un jeu</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-yellow text-black px-4 py-2 rounded-3xl hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow"
            >
              Mettre à jour le jeu en avant
            </button>
          </form>
        </div>
        <div className="bg-yellow-60 p-5 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Liste des utilisateurs</h3>
          {users.length === 0 ? (
            <p>Pas d'utilisateurs</p>
          ) : (
            <ul>
              {users.map(user => (
                <li key={user.id} className="mb-2 flex justify-between items-center">
                  <div>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Admin:</strong> {user.is_admin ? 'Oui' : 'Non'}</p>
                  </div>
                  <button
                    onClick={() => handleBanUser(user.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                    Bannir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-yellow-60 container mx-auto mt-8 rounded-2xl p-6 max-w-[500px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Ajouter un nouveau jeu</h2>
              <a href="/addgame" className="bg-yellow text-black px-4 py-2 rounded-3xl hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow">
                Ajouter un jeu 
              </a>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
