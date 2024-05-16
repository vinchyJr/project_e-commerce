import React from 'react';
import cyberpunkImage from './assets/images/cyberpunk.jpg';
import witcherImage from './assets/images/witcher3.jpg';

const Cart = () => {
  const cartItems = [
    { id: 1, name: 'Cyberpunk 2077', price: '€49.99', image: cyberpunkImage },
    {id: 2, name: 'The Witcher 3: Wild Hunt', price: '29,99', image: witcherImage },
    // Ajoutez d'autres articles du panier ici si nécessaire
  ];

  const totalPrice = cartItems.reduce((acc, item) => acc + parseFloat(item.price.replace('€', '')), 0);
  
  return (
    <div className="min-h-screen bg-color-dark text-white flex">

      {/* Panier à gauche */}
      <section className="w-2/3 p-5 mr-2">
        <header className="bg-gray-800 text-center p-1">
          <h2 className="text-left text-3xl font-bold mb-3">Votre panier contient</h2>
        </header>
        
        {/* Liste des articles dans le panier */}
        <div className="container mx-auto flex flex-col gap-4 p-2 ">
          {cartItems.map(item => (
            <div key={item.id} className="border border-gray-300 p-4">
              <p>Nom: {item.name}</p>
              <p>Prix: {item.price}</p>
              <img src={item.image} alt={item.name} className="w-44 h-auto" />
            </div>
          ))}
        </div>
      </section>
     {/* Sommaire du prix total à droite dans un carré gris */}
     <aside className="w-1/2 bg-gray-800 text-white p-4 my-8">
     <h3 className="text-lg font-bold mb-2  text-left">Sommaire du Panier</h3>
     
     <div className="border border-black p-12">   
    
     <p className="mb-6 text-center">Prix officiel: {totalPrice.toFixed(2)} €</p>
   
     <div className="text-center">
            <button style={{ backgroundColor: '#EF4444', color: '#FFFFFF', padding: '0.5rem 4rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>Paiement</button>
          </div>
          
     </div>
      </aside>
      
    </div>
  );
};

export default Cart;
