import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importez Routes au lieu de Switch
import Accueil from './apps/Accueil';
import Header from './components/Header';
import Banner from './components/Banner';
import Pc from './apps/Pc';
import Playstation from './apps/Playstation';
import Xbox from './apps/Xbox';
import Cart from './apps/Cart';
import Login from './apps/Login';
import SignUpPage from './apps/SignUpPage';
import NintendoSwitch from './apps/NintendoSwitch'; 

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <Routes> 
          
          <Route path="/accueil" element={<Accueil />} />
          <Route path="/pc" element={<Pc />} />
          <Route path="/playstation" element={<Playstation />} />
          <Route path="/xbox" element={<Xbox />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nintendoswitch" element={<NintendoSwitch />} />
          <Route path="/signuppage" element={<SignUpPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
