import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Game {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

const ManageGames: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/game/${id}`);
        setGame(response.data);
        setFormData({
          name: response.data.name,
          price: response.data.price,
          quantity: response.data.quantity,
        });
      } catch (error) {
        setError('Échec de la récupération des détails du jeu');
        console.error('Une erreur s\'est produite lors de la récupération des détails du jeu !', error);
      }
    };

    fetchGame();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/game/${id}`, formData);
      if (response.data.success) {
        setSuccess('Jeu mis à jour avec succès');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec de la mise à jour du jeu');
      console.error('Une erreur s\'est produite lors de la mise à jour du jeu !', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:3000/game/${id}`);
      if (response.data.success) {
        navigate(-1); // Redirect to the previous page
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Échec de la suppression du jeu');
      console.error('Une erreur s\'est produite lors de la suppression du jeu !', error);
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
    <div>
      <Header />
      <div className="container bg-yellow-60 rounded-3xl mx-auto p-10 text-white mt-60 mb-56 max-w-[620px]">
        <h2 className="text-3xl font-bold text-center mb-6">Manage Game</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow text-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price:</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow text-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow text-blue"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow text-black px-4 py-2 rounded-md hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow"
          >
            Update Game
          </button>
        </form>
        <button
          onClick={handleDelete}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mt-4"
        >
          Delete Game
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default ManageGames;
