import React from 'react';
import UsuariosExistentes from '../components/UsuariosExistentes';
import '../styles/Registro.css';

const Registro = () => {
  return (
    <div className="registro-container">
      <div className="registro-image-container">
        <img src={require('../assets/E-Inventory.png')} alt="E-Inventory" className="registro-image" />
      </div>

      <div className="registro-content">
        <UsuariosExistentes />
      </div>
    </div>
  );
};

export default Registro;
