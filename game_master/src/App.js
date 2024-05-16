import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Accueil from './apps/Accueil';
import Pc from './apps/Pc';
import Playstation from './apps/Playstation';
import Xbox from './apps/Xbox';
import Cart from './apps/Cart';
import Signup from './components/Signup';
import NintendoSwitch from './apps/NintendoSwitch';
import Login from './apps/Login';
import AddGame from './apps/AddGame';
import Game from './apps/Game';
import Account from './apps/Account';

function App() {
  return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/accueil" element={<Accueil />} />
          <Route path="/addgame" element={<AddGame />} />
          <Route path="/pc" element={<Pc />} />
          <Route path="/playstation" element={<Playstation />} />
          <Route path="/xbox" element={<Xbox />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/nintendoswitch" element={<NintendoSwitch />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
  );
}

export default App;
