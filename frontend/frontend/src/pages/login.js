import React, { useState, useEffect } from "react";
import { ReactComponent as Logo } from '../assets/logo.svg';
import EInventoryLogo from '../assets/E-Inventory.png';
import { Link, useNavigate } from "react-router-dom";
import '../styles/Login.css';
import ForgotPassword from '../components/ForgotPassword';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [forgotPassword, setForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sedeId, setSedeId] = useState('');
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar sedes al montar el componente
  useEffect(() => {
    const fetchSedes = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/sede/');
        if (!response.ok) throw new Error('Error al obtener las sedes.');

        const data = await response.json();
        setSedes(data.sedes);
      } catch (err) {
        toast.error('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchSedes();
  }, []);

  // Verificar token al cargar
  useEffect(() => {
    const checkToken = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8000/api/validate-token/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token inválido o expirado.");
        }

        console.log("Token válido.");
      } catch (error) {
        console.error("Error validando token:", error.message);
        sessionStorage.removeItem("token");
      }
    };

    checkToken();
  }, []);

  // Validar formulario antes de enviar
  const validateForm = () => {
    let errors = [];

    if (!username.trim()) errors.push('Ingresa tu nombre de usuario.');
    if (!password.trim()) errors.push('Ingresa tu contraseña.');
    if (password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres.');
    if (!sedeId) errors.push('Selecciona una sede.');

    if (errors.length > 0) {
      toast.warn(errors.join(' '));
      return false;
    }
    return true;
  };

  // Manejar login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, sede_id: Number(sedeId) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || 'Error al iniciar sesión.');
      }

      // Guardar token y datos en sessionStorage
      sessionStorage.setItem("token", data.access);
      if (data.username) sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("sedeId", sedeId);

      toast.success(`Bienvenido ${data.username}`);
      console.log("Redirigiendo al dashboard...");
      navigate('/dashboard');
      setTimeout(() => {
        window.location.reload(); // Recarga para aplicar cambios
      }, 100);
    } catch (err) {
      toast.error(err.message || "Error de conexión con el servidor.");
    }
  };

  return (
    <div className="login-container">
      <div className="container">
        {!forgotPassword ? (
          <div className="form-container sign-in">
            <form onSubmit={handleLogin}>
              <Logo className="logo" style={{ width: '220px', height: 'auto', padding: '10px' }} />
              <span>Iniciar sesión</span>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username" 
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" 
              />
              {loading ? (
                <p>Cargando sedes...</p>
              ) : (
                <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} disabled={loading}>
                  <option value="">Seleccionar sede</option>
                  {sedes.map(sede => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre} - {sede.ciudad}
                    </option>
                  ))}
                </select>
              )}
              <Link to="#" onClick={() => setForgotPassword(true)}>¿Olvidaste tu contraseña?</Link>
              <button type="submit">Entrar</button>
            </form>
          </div>
        ) : (
          <ForgotPassword onBackToLogin={() => setForgotPassword(false)} />
        )}

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-right">
              <img src={EInventoryLogo} alt="Logo de E-Inventory" className="logo-e" />
              <p>Sistema de inventario y control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
