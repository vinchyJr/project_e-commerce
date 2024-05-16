import React from 'react';
import { FaYoutube, FaDiscord, FaInstagram, FaGithub, FaCcAmazonPay, FaPaperPlane, FaCcPaypal, FaGooglePay, FaCcApplePay, } from 'react-icons/fa';
import { Link } from 'react-router-dom';  
import './style.css';

const Footer = () => {
      const socialItems = [
        FaInstagram,
        FaCcAmazonPay,
        FaPaperPlane,
        FaCcPaypal, 
        FaCcApplePay, 
        FaGooglePay,
      ];
  return (
    <footer className="footer">
      <div className="container">
        <div className="col1">
          <Link to="/accueil" className="brand">Game Master</Link>
          <ul className="media-icons">
            <li><Link to="https://www.youtube.com/watch?v=dQw4w9WgXcQ"><FaYoutube /></Link></li>
            <li><Link to="https://www.youtube.com/watch?v=dQw4w9WgXcQ"><FaDiscord /></Link></li>
            <li><Link to="https://www.instagram.com/vincentlemeur_/"><FaInstagram /></Link></li>
            <li><Link to="https://github.com/vinchyJr"><FaGithub /></Link></li>
          </ul>
        </div>
        <div className="col2">
          <ul className="menu">
            <li><Link to="/accueil">Acceuil</Link></li>
            <p>Découvrez notre boutique de jeux vidéo. Notre plateforme, construite avec React, garantit une navigation fluide et une expérience utilisateur optimale. </p>
          </ul>
        </div>
        <div className="col3">
          <p>Pour participer à ma réussite</p>
          <ul className="services-icons">
            <li><Link to="#"><FaCcPaypal /></Link></li>
            <li><Link to="#"><FaCcApplePay /></Link></li>
            <li><Link to="#"><FaGooglePay /></Link></li>
            <li><Link to="#"><FaCcAmazonPay /></Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="mekk">
          <p>Game Master 2023 - by A.Germain & V.Le Meur </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
