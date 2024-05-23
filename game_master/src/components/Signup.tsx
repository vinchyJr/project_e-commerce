import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    specialCode: '',
    birthdate: '' 
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/signup', formData);
      console.log(response.data); 
      if (response.data.success) {
        alert('Inscription réussie');
        navigate('/login');
      } else if (response.data.error) {
        setError(response.data.error);
      } else {
        setError('Échec de l\'inscription');
      }
    } catch (error) {
      setError('Il y avait une erreur!');
      console.error('Il y avait une erreur!', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="signup-container max-w-md mx-auto mt-64 mb-32 p-8 border rounded-lg shadow-lg bg-white">
        <h2 className="text-lg font-bold mb-6 text-center">Inscription</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pseudo:</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe:</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de naissance:</label>
            <input 
              type="date" 
              name="birthdate" 
              value={formData.birthdate} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Special Code (pour Admin):</label>
            <input 
              type="text" 
              name="specialCode" 
              value={formData.specialCode} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-yellow text-black px-4 py-2 rounded-md hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow">
            Signup
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Déjà un compte ? <button onClick={() => navigate('/login')} className="hover:text-yellow">Se connecter</button>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
