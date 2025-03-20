import React from 'react';
import SedesExistentes from '../components/SedesExistentes';
import '../styles/Registro.css';

const sedes = () => {
  return (
    <div className="registro-container">
      <div className="registro-image-container">
        <img src={require('../assets/E-Inventory.png')} alt="E-Inventory" className="registro-image" />
      </div>

      <div className="registro-content">
        <SedesExistentes/>
      </div>
    </div>
  );
};

export default sedes;
