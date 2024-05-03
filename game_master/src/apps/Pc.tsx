import React, { useState } from 'react';
import cyberpunkImage from './assets/images/cyberpunk.jpg';
import witcherImage from './assets/images/witcher3.jpg';
import ageOfEmpiresImage from './assets/images/ageofempires4.jpg';
import cyberpunkVideo from './assets/videos/cyberpunk.mp4';

interface Jeu {
  id: number;
  nom: string;
  price: string;  
  image: string;
  videoUrl?: string;
}

const jeuxPc: Jeu[] = [
  { 
    id: 1, 
    nom: 'Cyberpunk 2077', 
    price: '€49.99', 
    image: cyberpunkImage,
    videoUrl: cyberpunkVideo
  },
  { 
    id: 2, 
    nom: 'The Witcher 3: Wild Hunt', 
    price: '€29.99', 
    image: witcherImage,
    videoUrl: ''
  },
  { 
    id: 3, 
    nom: 'Age of Empires IV', 
    price: '€59.99', 
    image: ageOfEmpiresImage,
    videoUrl: ''  
  },
  { 
    id: 4, 
    nom: 'Cyberpunk 2077', 
    price: '€49.99', 
    image: cyberpunkImage,
    videoUrl: cyberpunkVideo
  },
  { 
    id: 5, 
    nom: 'The Witcher 3: Wild Hunt', 
    price: '€29.99', 
    image: witcherImage,
    videoUrl: ''
  },
  { 
    id: 6, 
    nom: 'Age of Empires IV', 
    price: '€59.99', 
    image: ageOfEmpiresImage,
    videoUrl: ''  
  },
  { 
    id: 7, 
    nom: 'Cyberpunk 2077', 
    price: '€49.99', 
    image: cyberpunkImage,
    videoUrl: cyberpunkVideo
  },
  { 
    id: 8, 
    nom: 'The Witcher 3: Wild Hunt', 
    price: '€29.99', 
    image: witcherImage,
    videoUrl: ''
  },
  { 
    id: 9, 
    nom: 'Age of Empires IV', 
    price: '€59.99', 
    image: ageOfEmpiresImage,
    videoUrl: ''  
  },
  { 
    id: 10, 
    nom: 'Cyberpunk 2077', 
    price: '€49.99', 
    image: cyberpunkImage,
    videoUrl: cyberpunkVideo
  },
  { 
    id: 11, 
    nom: 'The Witcher 3: Wild Hunt', 
    price: '€29.99', 
    image: witcherImage,
    videoUrl: ''
  },
  { 
    id: 12, 
    nom: 'Age of Empires IV', 
    price: '€59.99', 
    image: ageOfEmpiresImage,
    videoUrl: ''  
  },
];

const Pc = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
  <div className="bg-color-dark">
    <div className="bg-color-dark container mx-auto p-4">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Jeux PC</h2>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {jeuxPc.map(jeu => (
          <div 
            key={jeu.id}
            className="relative rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 m-4 mb-10"
            onMouseEnter={() => setHovered(jeu.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === jeu.id && jeu.videoUrl ? (
              <video 
                src={jeu.videoUrl} 
                aria-label={`Video of ${jeu.nom}`} 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={jeu.image} alt={`Image of ${jeu.nom}`} className="w-full h-full object-cover" />
            )}
            {hovered !== jeu.id && (
              <div className="absolute bottom-0 w-full p-4 flex justify-between items-center" style={{ 
                background: 'linear-gradient(rgba(255, 255, 255, 0),rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1))'
              }}>
                <h3 className="text-xl text-blue-800">{jeu.nom}</h3>
                <span className="text-xl text-blue-800">{jeu.price}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Pc;
