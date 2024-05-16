import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';
import PopularProducts from '../components/PopularProducts';
import Reviews from '../components/Reviews';
import Categories from '../components/Categories';

import gtaImage from './assets/images/gta6.jpg';
import cyberpunkImage from './assets/images/cyberpunk.jpg';
import witcherImage from './assets/images/witcher3.jpg';
import ageOfEmpiresImage from './assets/images/ageofempires4.jpg';
import cyberpunkVideo from './assets/videos/cyberpunk.mp4';
import gta from './assets/videos/gta6.mp4';

interface Jeu {
  id: number;
  nom: string;
  price: string;
  image: string;
  videoUrl?: string;
}

const jeuxPc: Jeu[] = [
  { id: 1, nom: 'Cyberpunk 2077', price: '€49.99', image: cyberpunkImage, videoUrl: cyberpunkVideo },
  { id: 2, nom: 'The Witcher 3: Wild Hunt', price: '€29.99', image: witcherImage,  videoUrl:'' },
  { id: 3, nom: 'GTA 6', price: '€49.99', image: gtaImage, videoUrl: gta },
  { id: 4, nom: 'Age of Empires IV', price: '€59.99', image: ageOfEmpiresImage },
  { id: 5, nom: 'Cyberpunk 2077', price: '€49.99', image: cyberpunkImage, videoUrl: cyberpunkVideo },
  { id: 6, nom: 'The Witcher 3: Wild Hunt', price: '€29.99', image: witcherImage,  videoUrl:'' },
  { id: 7, nom: 'Cyberpunk 2077', price: '€49.99', image: cyberpunkImage, videoUrl: cyberpunkVideo },
  { id: 8, nom: 'The Witcher 3: Wild Hunt', price: '€29.99', image: witcherImage,  videoUrl:'' },
  { id: 9, nom: 'The Witcher 3: Wild Hunt', price: '€29.99', image: witcherImage,  videoUrl:'' },
];

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const jeuEnAvant = jeuxPc.find(jeu => jeu.id === 1);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  const handleAddGame = () => {
    navigate('/addgame');
  };

  return (
    <div className="bg-color-dark z-0">
      <Header />
      <div className="relative min-h-screen bg-color-dark text-white overflow-hidden">
        <div className="relative w-full" style={{ height: '60vh', marginTop: '0' }}>
          {jeuEnAvant && (
            <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              <Link to={`/game/${jeuEnAvant.id}`}>
                <video
                  src={jeuEnAvant.videoUrl}
                  aria-label={`Video of ${jeuEnAvant.nom}`}
                  autoPlay
                  muted
                  loop
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full object-cover"
                ></video>
              </Link>
              <div className="absolute left-32 top-1/2 transform -translate-y-1/2 p-4" 
                style={{ backgroundColor: `rgba(253, 207, 118, ${isHovering ? '1' : '0.1'})`, borderRadius: '30px' }}>
                <Link to={`/game/${jeuEnAvant.id}`} className="block text-5xl font-bold mb-2 hover:text-blue-300">{jeuEnAvant.nom}</Link>
                <Link to={`/game/${jeuEnAvant.id}`} className="block text-3xl hover:text-blue-300">{jeuEnAvant.price}</Link>
              </div>
            </div>
          )}
        </div>
        <div className="container mx-auto p-4 text-white">
          <h2 className="text-3xl font-bold text-center m-6">Featured Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jeuxPc.map((jeu) => (
              <GameCard key={jeu.id} jeu={jeu} />
            ))}
          </div>
          <Categories />
          <PopularProducts />
          <Reviews />
        </div>
        <p className="mt-4 text-sm text-center">
          Pas encore de compte ? <button onClick={() => navigate('/addgame')} className="hover:text-yellow">S'inscrire</button>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Accueil;
