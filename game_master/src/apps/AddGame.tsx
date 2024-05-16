import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AddGame: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'image' && files) {
      setImage(files[0]);
    } else if (name === 'video' && files) {
      setVideo(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    if (image) data.append('image', image);
    if (video) data.append('video', video);

    try {
      const response = await axios.post('http://localhost:3000/addGame', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setSuccess('Game added successfully');
        setFormData({ name: '', price: '' });
        setImage(null);
        setVideo(null);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Failed to add game');
    }
  };

  return (
    <div className="">
      <Header />
      <div className="container bg-yellow-60 rounded-3xl mx-auto p-10 text-white mt-60 mb-56 max-w-[620px]	">
        <h2 className="text-3xl font-bold text-center mb-6">Ajoute Ton Jeu</h2>
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
            <label className="block text-sm font-medium text-gray-700">Image:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Video:</label>
            <input
              type="file"
              name="video"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow text-black px-4 py-2 rounded-md hover:bg-white focus:outline-none focus:ring-2 border focus:ring-yellow"
          >
            Add Game
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AddGame;
