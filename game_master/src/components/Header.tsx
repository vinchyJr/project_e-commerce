import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaGamepad  } from 'react-icons/fa';

function Header() {
  return (
    <div className="sticky top-0 flex items-center justify-between py-4 px-5 bg-blue-300 opacity-80 text-white">
      <div className="px-5">
        <Link to="/">
          <FaGamepad  className="h-18 w-18" size={72} />
        </Link>
      </div>
      <div className="flex gap-4">
        <Link to="/pc" className="hover:text-gray-300">PC</Link>
        <Link to="/playstation" className="hover:text-gray-300">PlayStation</Link>
        <Link to="/xbox" className="hover:text-gray-300">Xbox</Link>
        <Link to="/nintendoswitch" className="hover:text-gray-300">Nintendo</Link>
      </div>
      <div className="flex items-center gap-4 px-5">
        <Link to="/cart">
          <FaShoppingCart className="h-18 w-18 cursor-pointer" size={30} />
        </Link>
        <Link to="/Login">
          <FaUser className="h-18 w-18 cursor-pointer" size={30} />
        </Link>
      </div>
    </div>
  );
}

export default Header;
