import React from 'react';
import ServiciosExistentes from '../components/ServiciosExistentes';
import '../styles/Registro.css';

const Services = () => {
  return (
    <div className="registro-container">
      <div className="registro-image-container">
        <img src={require('../assets/E-Inventory.png')} alt="E-Inventory" className="registro-image" />
      </div>

      <div className="registro-content">
        <ServiciosExistentes/>
      </div>
    </div>
  );
};

export default Services;
