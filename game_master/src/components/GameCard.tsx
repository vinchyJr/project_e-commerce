import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  jeu: {
    id: number;
    name: string; 
    price: string;
    image: string | null;
    videoUrl?: string | null;
  };
}

const GameCard: React.FC<GameCardProps> = ({ jeu }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 m-4 mb-10"
    >
      <Link to={`/game/${jeu.id}`}>
        {jeu.videoUrl && isHovering ? (
          <video
            src={jeu.videoUrl}
            aria-label={`Video of ${jeu.name}`} 
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={jeu.image || ''} alt={`Image of ${jeu.name}`} className="w-full h-full object-cover" />
        )}
      </Link>
      {!isHovering && (
        <div className="absolute bottom-0 w-full p-4 flex justify-between items-center" style={{ 
          background: 'linear-gradient(rgba(253, 207, 118, 0), rgba(253, 207, 118, 0.8), rgba(253, 207, 118, 1))'
        }}>
          <h3 className="text-xl text-blue-800">{jeu.name}</h3> 
          <span className="text-xl text-blue-800">{jeu.price}</span>
        </div>
      )}
      {isAdmin && (
        <div className="absolute top-0 right-0 p-2 bg-yellow">
          <Link to={`/manage-games/${jeu.id}`} className="text-red-500 hover:text-red-700">
            Manage Game
          </Link>
        </div>
      )}
    </div>
  );
};

export default GameCard;
