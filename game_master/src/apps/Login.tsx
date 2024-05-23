import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      const response = await axios.post('http://localhost:3000/login', formData);
      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', response.data.isAdmin ? 'true' : 'false');
        localStorage.setItem('userId', response.data.userId); 
        navigate('/accueil');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Failed to log in');
    }
  };

  return (
    <div className="">
      <Header />
      <div className="container mx-auto mb-32 pt-32 ">
        <div className="max-w-md mx-auto mt-16 p-8 border rounded-lg shadow-lg bg-white">
          <h2 className="text-lg font-bold mb-6 text-center">Se connecter</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <button
              type="submit"
              className="w-full bg-yellow text-black px-4 py-2 rounded-md hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow"
            >
              Se connecter
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
          Pas encore de compte ? <button onClick={() => navigate('/signup')} className="hover:text-yellow">S'inscrire</button>
        </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
