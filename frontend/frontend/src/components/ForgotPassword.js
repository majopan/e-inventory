import React, { useState } from "react";
import { ReactComponent as Logo } from "../assets/logo.svg";
import EInventoryLogo from "../assets/E-Inventory.png";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de entrada
    if (!email) {
      setError("Por favor, introduce un correo electrónico válido.");
      setMessage("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/reset-password-request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Se han enviado las instrucciones a tu correo.");
        setError("");
        setEmail(""); // Limpia el campo de correo tras el envío exitoso
      } else if (response.status === 404) {
        setError("El correo no está registrado.");
        setMessage("");
      } else {
        setError(data.error || "Ocurrió un error al procesar la solicitud.");
        setMessage("");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor. Por favor, inténtalo más tarde.");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="forgot-password">
    <div className="container">
      <div className="formw">
        <div className="forgot-password-container">
          <form onSubmit={handleSubmit}>
            <Logo className="logo" style={{ width: "220px", height: "auto", padding: "10px" }} />
            <span>Restablecer tu contraseña</span>

            {/* Mensajes de éxito y error */}
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
            </button>
            <Link to="/" onClick={onBackToLogin} className="back-to-login">
              Volver a Iniciar sesión
            </Link>
          </form>
        </div>
      </div>

      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-right">
            <img
              src={EInventoryLogo}
              alt="Logo de E-Inventory"
              className="logo-e"
              style={{ width: "300px", height: "auto" }}
            />
            <p>Sistema de inventario y control</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ForgotPassword;