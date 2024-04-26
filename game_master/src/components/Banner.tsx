import React from 'react';
import bannerImage from './assets/banner.jpg'; 

const Banner: React.FC = () => {
  return (
    <div className="banner">
      <img src={bannerImage} alt="Bannière" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Banner;
