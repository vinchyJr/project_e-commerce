import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const response = await axios.post('http://localhost:3000/login', formData);
      console.log(response.data);
      if (response.data.success) {
        localStorage.setItem('isAdmin', response.data.isAdmin);
        navigate('/');
      } else if (response.data.error) {
        setError(response.data.error);
      } else {
        setError('Login failed');
      }
    } catch (error) {
      setError('There was an error!');
      console.error('There was an error!', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container max-w-md mx-auto mt-64 mb-64 p-8 border rounded-lg shadow-lg bg-white ">
        <h2 className="text-lg font-bold mb-6 text-center">Connexion</h2>
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
            <label className="block text-sm font-medium text-gray-700">Password:</label>
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
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Pas encore de compte ? <button onClick={() => navigate('/signup')} className="hover:text-yellow">S'inscrire</button>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
