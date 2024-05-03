import React from 'react';
import PopularProducts from '../components/PopularProducts';
import Reviews from '../components/Reviews';
import Header from '../components/Header';
import Categories from '../components/Categories';


const Accueil = () => {
  return (
    <div className="min-h-screen bg-color-dark text-white">

      {/* Section principale */}
      <header className="bg-gray-800 p-12 text-center">
        <h2 className="text-3xl font-bold mb-3">Découvrez les meilleurs jeux à prix réduits!</h2>
        <p>Parcourez notre sélection exclusive.</p>
      </header>

      {/* Section des jeux en vedette */}
      <section className="container mx-auto grid grid-cols-3 gap-4 p-4">
        <div className="bg-gray-700 p-4">
          <h3 className="font-bold">Jeu #1</h3>
          <p>Description du jeu #1...</p>
        </div>
        <div className="bg-gray-700 p-4">
          <h3 className="font-bold">Jeu #2</h3>
          <p>Description du jeu #2...</p>
        </div>
        <div className="bg-gray-700 p-4">
          <h3 className="font-bold">Jeu #3</h3>
          <p>Description du jeu #3...</p>
        </div>
      </section>

      {/* Autres sections */}
      {/* Tu peux ajouter plus de sections ici suivant les mêmes patterns */}
    </div>
  );
};

export default Accueil;

