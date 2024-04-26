import React from 'react';
import PopularProducts from '../../components/PopularProducts';
import Reviews from '../../components/Reviews';
import Header from '../../components/header';
import Banner from '../../components/banner';
import Categories from '../../components/categories';

function Accueil() {
  return (
    <div>
      <Header />
      <Banner />
      <Categories />
      <PopularProducts />
      <Reviews />
    </div>
  );
};

export default Accueil;
