import React, { useState, useEffect } from 'react';
import '../styles/DashboardContent.css';

// Componente funcional que muestra el contenido del dashboard
const DashboardContent = () => {
  // Estado para almacenar la información de las tarjetas
  const [cardsData, setCardsData] = useState([]);
  // Estado para controlar si los datos están cargando
  const [loading, setLoading] = useState(true);

  // useEffect se ejecuta una vez al montar el componente
  useEffect(() => {
    // Función asíncrona para obtener los datos del dashboard desde la API
    const fetchDashboardData = async () => {
      try {
        // Se obtiene el token almacenado en el localStorage
        

        // Se realiza la petición a la API del dashboard
        const response = await fetch('http://localhost:8000/api/dashboard/', {
          headers: {
            'Content-Type': 'application/json',
            // Envía el token en el header de autorización; dependiendo de tu backend,
            // podrías necesitar usar 'Bearer ' o 'Token ' concatenado con el token.
            
          }
        });

        // Si la respuesta no es exitosa (status diferente a 200)
        if (!response.ok) {
          // Se obtiene el cuerpo de la respuesta en texto para mayor claridad en el error
          const errorText = await response.text();
          console.error('Response status:', response.status);
          console.error('Response body:', errorText);
          // Lanza un error que será capturado en el bloque catch
          throw new Error('Error al obtener los datos del dashboard');
        }

        // Si la respuesta es exitosa, se parsea el JSON recibido
        const data = await response.json();

        // Se actualiza el estado con los datos recibidos de la API.
        // Verifica que la API retorne un objeto con la propiedad 'cardsData'
        setCardsData(data.cardsData);
      } catch (error) {
        // Se captura y se muestra cualquier error ocurrido durante la petición
        console.error('Error fetching dashboard data:', error);
      } finally {
        // Una vez completada la petición (exitosa o no), se desactiva el loading
        setLoading(false);
      }
    };

    // Se ejecuta la función para obtener los datos del dashboard
    fetchDashboardData();
  }, []); // Dependencias vacías: se ejecuta solo una vez al montar el componente

  return (
    <div className="dashboard-content">
      {/* Contenedor para la imagen principal del dashboard */}
      <div className="dashboard-image-container">
        <img
          src={require('../assets/E-Inventory.png')}
          alt="E-Inventory"
          className="dashboard-image"
        />
      </div>
      {/* Contenedor para las tarjetas que muestran los datos */}
      <div className="cards-container">
        {loading ? (
          // Mientras se cargan los datos, muestra un mensaje de "Cargando datos..."
          <p>Cargando datos...</p>
        ) : (
          // Una vez cargados los datos, se mapea el array cardsData y se renderiza cada tarjeta
          cardsData.map((card, index) => (
            <div className="card" key={index}>
              {/* Ícono de la tarjeta */}
              <img src={require('../assets/icon.ico')} alt="icon" className="card-icon" />
              {/* Título de la tarjeta */}
              <h5>{card.title}</h5>
              {/* Valor principal de la tarjeta */}
              <h1>{card.value}</h1>
              {/* Información adicional, por ejemplo, una fecha */}
              <p>{card.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
