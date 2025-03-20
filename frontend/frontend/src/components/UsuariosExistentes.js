import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaUser, FaEdit, FaPlus } from "react-icons/fa";
import "../styles/UsuariosExistentes.css";

const UsuariosExistentes = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    nombre: "",
    email: "",
    documento: "",
    celular: "",
    rol: "coordinador", // Valor predeterminado según el modelo de Django
    password: "",
    confirm_password: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error", // Puede ser "error" o "success"
  });

  const showAlert = (message, type = "error") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "error" }), 3000);
  };

  // Efecto para ocultar la alerta después de 3 segundos
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 1000); // 3000 ms = 3 segundos
      return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
    }
  }, [alert]);

  // Fetch the list of users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/usuarios/");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setUsers([]);
    }
  }, []);

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/dusuarios/${userId}/`);
      setSelectedUser(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error al obtener los detalles del usuario:", error);
    }
  };

  // Edit user
  const editUser = async (userId, updatedUserData) => {
    if (!updatedUserData.nombre || !updatedUserData.email || !updatedUserData.username) {
      setAlert({
        show: true,
        message: "Por favor, complete todos los campos obligatorios.",
        type: "error",
      });
      return;
    }

    try {
      await axios.put(`http://127.0.0.1:8000/api/editusuarios/${userId}/`, updatedUserData);
      setAlert({
        show: true,
        message: "Usuario editado exitosamente.",
        type: "success",
      });
      fetchUsers();
      setShowDetailModal(false);
    }catch (error) {
      if (error.response && error.response.data) {
        const errorMessages = Object.values(error.response.data).flat().join(" \n");
        showAlert(errorMessages);
      } else {
        showAlert("Error al editar el usuario.");
      }
    }
  };

  // Toggle user status (activate/deactivate)
  const toggleUserStatus = async (userId, isActive) => {
    try {
      const endpoint = isActive
        ? `http://127.0.0.1:8000/api/deusuarios/${userId}/`
        : `http://127.0.0.1:8000/api/activarusuarios/${userId}/`;

      await axios.put(endpoint);
      setAlert({
        show: true,
        message: `Usuario ${isActive ? "desactivado" : "activado"} exitosamente.`,
        type: "success",
      });
      fetchUsers(); // Refrescar la lista de usuarios después del cambio
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cambiar el estado del usuario.",
        type: "error",
      });
      const errorMessage = error.response?.data?.error || "Error al desactivar el usuario.";
      showAlert(errorMessage);
    }
  };

  // Add new user
  const addUser = async () => {
    if (!newUser.nombre || !newUser.email || !newUser.password || !newUser.username) {
      setAlert({
        show: true,
        message: "Por favor, complete todos los campos obligatorios.",
        type: "error",
      });
      return;
    }

    if (newUser.password !== newUser.confirm_password) {
      setAlert({
        show: true,
        message: "Las contraseñas no coinciden.",
        type: "error",
      });
      return;
    }

    try {
      const usuarioData = {
        username: newUser.username,
        nombre: newUser.nombre,
        email: newUser.email,
        documento: newUser.documento,
        celular: newUser.celular,
        rol: newUser.rol,
        password: newUser.password,
        confirm_password: newUser.confirm_password,
      };

      await axios.post("http://127.0.0.1:8000/api/register/", usuarioData);
      setAlert({
        show: true,
        message: "Usuario agregado exitosamente.",
        type: "success",
      });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al agregar el usuario.",
        type: "error",
      });
      const errorMessage = error.response?.data?.error || "Error al agregar el usuario.";
      showAlert(errorMessage);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // Manejador para cerrar el modal cuando se hace clic fuera de él
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowDetailModal(false);
      setShowForm(false);
    }
  };

  return (
    <div className="records-container">
      <div className="user-card">
        <div className="card-header">
          <h2>Usuarios existentes</h2>
          <button className="add-user-btn" onClick={() => setShowForm(true)}>
            <FaPlus />
          </button>
        </div>

        <div className="user-list">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="user-info" onClick={() => fetchUserDetails(user.id)}>
                  <div className="user-name">{user.nombre}</div>
                  <div className="user-access">
                    {user.rol === "admin" ? "Administrador" : "Coordinador"}
                  </div>
                </div>
                <div className="user-actions">
                  <button className="action-button edit" onClick={() => fetchUserDetails(user.id)}>
                    <FaEdit />
                  </button>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.is_active}
                      onChange={() => toggleUserStatus(user.id, user.is_active)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            ))
          ) : (
            <p>No hay usuarios disponibles.</p>
          )}
        </div>

        {/* Modal para ver y editar detalles del usuario */}
        {showDetailModal && selectedUser && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setShowDetailModal(false)}>
                &times;
              </button>
              <div className="modal-content">
                <h1>Editar Usuario</h1>
                <div className="input-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    value={selectedUser.nombre || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, nombre: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Nombre de usuario *</label>
                  <input
                    type="text"
                    value={selectedUser.username || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Correo electrónico *</label>
                  <input
                    type="email"
                    value={selectedUser.email || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Documento de identidad</label>
                  <input
                    type="text"
                    value={selectedUser.documento || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, documento: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Número de celular</label>
                  <input
                    type="text"
                    value={selectedUser.celular || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, celular: e.target.value })}
                  />
                </div>
                <div className="input-group select-wrapper">
                  <label>Rol *</label>
                  <select value={selectedUser.rol || ""} onChange={(e) => setSelectedUser({ ...selectedUser, rol: e.target.value })}>
                    <option value="" disabled>Seleccione un rol</option>
                    <option value="coordinador">Coordinador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button className="create-button" onClick={() => editUser(selectedUser.id, selectedUser)}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar nuevo usuario */}
        {showForm && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setShowForm(false)}>
                &times;
              </button>
              <div className="modal-content">
                <h1>Agregar Usuario</h1>
                <div className="input-group">
                  <label>Nombre de usuario</label>
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Documento de identidad</label>
                  <input
                    type="text"
                    placeholder="Documento de identidad"
                    value={newUser.documento}
                    onChange={(e) => setNewUser({ ...newUser, documento: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Número de celular</label>
                  <input
                    type="text"
                    placeholder="Número de celular"
                    value={newUser.celular}
                    onChange={(e) => setNewUser({ ...newUser, celular: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Confirmar contraseña</label>
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={newUser.confirm_password}
                    onChange={(e) => setNewUser({ ...newUser, confirm_password: e.target.value })}
                  />
                </div>
                <div className="input-group select-wrapper">
                  <label>Rol</label>
                  <select
                    value={newUser.rol}
                    onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                  >
                    <option value="coordinador">Coordinador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button className="create-button" onClick={addUser}>
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar alerta */}
        {alert.show && (
          <AlertModal
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}
      </div>
    </div>
  );
};

export default UsuariosExistentes;