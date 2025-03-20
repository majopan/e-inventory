import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaServicestack, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import "../styles/ServiciosExistentes.css";

const ServiciosExistentes = () => {
  const [services, setServices] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({
    nombre: "",
    codigo_analitico: "",
    sede: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error", // Puede ser "error" o "success"
  });

  // Fetch the list of services
  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/servicios/");
      console.log(" Lista actualizada de servicios:", response.data);
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      setServices([]);
    }
  }, []);
  
  // Fetch the list of sedes
  const fetchSedes = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/sede/");
      if (Array.isArray(response.data.sedes)) {  // Cambiar a 'response.data.sedes' si la respuesta está anidada
        setSedes(response.data.sedes);
      } else {
        console.error("La respuesta de sedes no tiene el formato esperado");
        setSedes([]);
      }
    } catch (error) {
      console.error("Error al obtener sedes:", error);
    }
  }, []);
  

  // Fetch service details
  const fetchServiceDetails = async (serviceId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/servicios/${serviceId}/`);
      const serviceData = response.data;
  
      setSelectedService({
        ...serviceData,
        sede: serviceData.sedes.length > 0 ? serviceData.sedes[0].id : "",
        color: serviceData.color || "#FFFFFF", // Asegurar que siempre hay un color
      });
  
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error al obtener los detalles del servicio:", error);
      setAlert({
        show: true,
        message: "No se pudo cargar el servicio.",
        type: "error",
      });
    }
  };
  
  
  
  // Edit service
  const editService = async (serviceId, updatedServiceData) => {
    try {
      if (!updatedServiceData.nombre) {
        setAlert({
          show: true,
          message: "El campo 'nombre' es obligatorio.",
          type: "error",
        });
        return;
      }
  
      // Convertimos sede a lista y aseguramos que el color esté presente
      const payload = {
        nombre: updatedServiceData.nombre,
        codigo_analitico: updatedServiceData.codigo_analitico,
        sedes: updatedServiceData.sede ? [parseInt(updatedServiceData.sede, 10)] : [],
        color: updatedServiceData.color || "#FFFFFF",
      };
  
      console.log("📢 Enviando datos a la API (PUT):", payload);
  
      await axios.put(`http://127.0.0.1:8000/api/servicios/${serviceId}/`, payload);
  
      // 🔹 Esperamos 200ms antes de refrescar la lista
      setTimeout(() => {
        fetchServices(); // 🔹 Refrescamos la lista de servicios
        setShowDetailModal(false);
      }, 200);
  
      setAlert({
        show: true,
        message: "Servicio editado exitosamente.",
        type: "success",
      });
    } catch (error) {
      console.error("🚨 Error al editar el servicio:", error);
      setAlert({
        show: true,
        message: "Hubo un error al editar el servicio.",
        type: "error",
      });
    }
  };
  
  
  

  // Delete service
  const deleteService = async (serviceId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/servicios/${serviceId}/`);
      fetchServices();
      setAlert({
        show: true,
        message: "Servicio eliminado exitosamente.",
        type: "success",
      });
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      setAlert({
        show: true,
        message: "Hubo un error al eliminar el servicio.",
        type: "error",
      });
    }
  };

  const addService = async () => {
    if (!newService.nombre) {
      setAlert({
        show: true,
        message: "El campo 'nombre' es obligatorio.",
        type: "error",
      });
      return;
    }
  
    try {
      const payload = {
        nombre: newService.nombre,
        codigo_analitico: newService.codigo_analitico,
        sedes: newService.sede ? [parseInt(newService.sede, 10)] : [], // 🔹 Convertimos el ID de la sede a número
        color: newService.color || "#FFFFFF",
      };
  
      console.log("Enviando datos al backend:", payload); // Para depuración
  
      await axios.post("http://127.0.0.1:8000/api/servicios/", payload);
      setShowForm(false);
      fetchServices();
      setAlert({
        show: true,
        message: "Servicio agregado exitosamente.",
        type: "success",
      });
    } catch (error) {
      console.error("Error al agregar el servicio:", error);
      setAlert({
        show: true,
        message: "Hubo un error al agregar el servicio.",
        type: "error",
      });
    }
  };
  
  
  // Load services and sedes when component mounts
  useEffect(() => {
    fetchServices();
    fetchSedes();
  }, [fetchServices, fetchSedes]);

  // Efecto para cerrar la alerta automáticamente después de 1 segundo
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 1000); // Cerrar la alerta después de 1 segundo
      return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
    }
  }, [alert]);

  // Componente de alerta
  const AlertModal = ({ message, type, onClose }) => {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className={`alert-modal ${type}`}>
            <p>{message}</p>
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="records-container">
      <div className="user-card">
        <div className="card-header">
          <h2>Servicios existentes</h2>
          <button className="add-user-btn" onClick={() => setShowForm(true)}>
            <FaPlus />
          </button>
        </div>

        {/* Mensajes de alerta */}
        {alert.show && (
          <AlertModal
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        {/* Lista de servicios */}
        <div className="user-list">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} className="user-item">
                <div className="user-avatar">
                  <FaServicestack />
                </div>
                <div className="user-info" onClick={() => fetchServiceDetails(service.id)}>
                  <div className="user-name">{service.nombre}</div>
                  <div className="color-box" style={{ backgroundColor: service.color || "#ccc" }}></div>
                  <div className="user-access">
                   Sedes: {service.sedes && service.sedes.length > 0 
                   ? service.sedes.map(sede => sede.nombre).join(", ")  // 👈 Mostrar el nombre de la sede
                  : "No asignadas"}
                  </div>

                  </div>
                <div className="user-actions">
                  <button className="action-button edit" onClick={() => fetchServiceDetails(service.id)}>
                    <FaEdit />
                  </button>
                  <button className="action-button delete" onClick={() => deleteService(service.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No hay servicios disponibles.</p>
          )}
        </div>

        {/* Modal para ver y editar detalles del servicio */}
        {showDetailModal && selectedService && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-button" onClick={() => setShowDetailModal(false)}>
                &times;
              </button>
              <div className="modal-content">
                <h1>Detalles del servicio</h1>
                <div className="input-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={selectedService.nombre || ""}
                    onChange={(e) => setSelectedService({ ...selectedService, nombre: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
                <div className="input-group">
                  <label>Código analítico</label>
                  <input
                    type="text"
                    value={selectedService.codigo_analitico || ""}
                    onChange={(e) => setSelectedService({ ...selectedService, codigo_analitico: e.target.value })}
                    placeholder="Código analítico"
                  />
                </div>
                <div className="input-group">
  <label>Seleccionar color</label>
  <input
    type="color"
    value={selectedService.color || "#000000"} 
    onChange={(e) => setSelectedService({ ...selectedService, color: e.target.value })}
  />
</div>

                <div className="input-group">
                  <label>Sede</label>
                  <select
                    value={selectedService.sede || ""}
                    onChange={(e) => setSelectedService({ ...selectedService, sede: e.target.value })}
                  >
                    <option value="">Seleccionar sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="create-button" onClick={() => editService(selectedService.id, selectedService)}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar nuevo servicio */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-button" onClick={() => setShowForm(false)}>
                &times;
              </button>
              <div className="modal-content">
                <h1>Agregar Servicio</h1>
                <div className="input-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del servicio"
                    value={newService.nombre}
                    onChange={(e) => setNewService({ ...newService, nombre: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Código analítico</label>
                  <input
                    type="text"
                    placeholder="Código analítico"
                    value={newService.codigo_analitico}
                    onChange={(e) => setNewService({ ...newService, codigo_analitico: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Seleccionar color</label>
                  <input
                    type="color"
                    value={newService.color || "#000000"} 
                    onChange={(e) => setNewService({ ...newService, color: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Sede</label>
                  <select
                    value={newService.sede || ""}
                    onChange={(e) => setNewService({ ...newService, sede: e.target.value })}
                  >
                    <option value="">Seleccionar sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="create-button" onClick={addService}>
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiciosExistentes;
