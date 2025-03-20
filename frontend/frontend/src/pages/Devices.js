import React from 'react';
import Dispositivos from '../components/dispositivos';
import '../styles/Devices.css'; // Asegúrate de personalizar este archivo CSS según tus necesidades


const Devices = () => {
    return (
        <div className="registro-container">
        <div className="registro-image-container">
          <img src={require('../assets/E-Inventory.png')} alt="E-Inventory" className="registro-image" />
        </div>
        <div className="dashboard-content">
    <Dispositivos />
  </div>

    </div>

    );
};

export default Devices;





