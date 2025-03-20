import React from 'react';
import '../styles/Inventory.css'; 
import Inventario from '../components/inventario';// Asegúrate de personalizar este archivo CSS según tus necesidades

const Inventory = () => {
  return (
    <div className="registro-container">
      <div className="registro-image-container">
        <img src={require('../assets/E-Inventory.png')} alt="E-Inventory" className="registro-image" />
      </div>
        <div className="registro-content">
        <Inventario/>
        </div>
    </div>
  );
};

export default Inventory;