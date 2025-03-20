import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ReactComponent as Logo } from '../assets/logo.svg';
import EInventoryLogo from '../assets/E-Inventory.png';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get("email"); // Obtenemos el email desde los parámetros de la URL
    // Eliminamos el token, ya que no lo necesitamos
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de entrada
        if (!email) {
            setError("Falta el correo electrónico en el enlace de restablecimiento.");
            return;
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch("http://localhost:8000/api/reset-password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    // Ya no enviamos el token
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || "Contraseña actualizada correctamente.");
                setTimeout(() => navigate("/"), 3000); // Redirigir después de 3 segundos
            } else {
                setError(data.error || "Error al cambiar contraseña.");
            }
        } catch (err) {
            setError("Ocurrió un error. Inténtalo de nuevo más tarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <div className="formw">
                <div className="reset-password-container">
                    <form onSubmit={handleSubmit}>
                        <Logo className="logo" style={{ width: '220px', height: 'auto', padding: '10px' }} />
                        <span>Restablecer tu contraseña</span>

                        {/* Mensajes de error y éxito */}
                        {error && <p className="error-message">{error}</p>}
                        {successMessage && <p className="success-message">{successMessage}</p>}

                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            onInput={() => setError("")} // Limpia el error cuando el usuario escribe
                        />
                        <input
                            type="password"
                            placeholder="Confirmar nueva contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            onInput={() => setError("")} // Limpia el error cuando el usuario escribe
                        />
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
                        </button>
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
                            style={{ width: '300px', height: 'auto' }}
                        />
                        <p>Sistema de inventario y control</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
