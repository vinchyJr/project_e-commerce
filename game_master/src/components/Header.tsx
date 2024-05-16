import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaGamepad } from 'react-icons/fa';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className={`w-full fixed top-0 z-[2000] flex items-center justify-between py-4 px-5 ${isScrolled ? 'bg-blue' : 'bg-transparent'} text-white`} style={{ transition: 'background-color 1s' }}>
      <div className="px-5">
        <Link to="/accueil">
          <FaGamepad className="h-18 w-18 hover:text-yellow" size={72} />
        </Link>
      </div>
      <div className="flex gap-6 p-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '30px' }}>
        <Link to="/pc" className="hover:bg-yellow rounded-2xl p-2">PC</Link>
        <Link to="/playstation" className="hover:bg-yellow rounded-2xl p-2">PlayStation</Link>
        <Link to="/xbox" className="hover:bg-yellow rounded-2xl p-2">Xbox</Link>
        <Link to="/nintendoswitch" className="hover:bg-yellow rounded-2xl p-2">Nintendo</Link>
      </div>
      <div className="flex items-center gap-4 px-5">
        <Link to="/cart">
          <FaShoppingCart className="h-18 w-18 cursor-pointer hover:text-yellow" size={30} />
        </Link>
        {isAuthenticated ? (
          <>
            <Link to="/account">
              <FaUser className="h-18 w-18 cursor-pointer hover:text-yellow" size={30} />
            </Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              Se déconnecter
            </button>
          </>
        ) : (
          <Link to="/login">
            <FaUser className="h-18 w-18 cursor-pointer hover:text-yellow" size={30} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
