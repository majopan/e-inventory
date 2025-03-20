import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth"; // Importar el contexto de autenticación

const InactivityHandler = () => {
    const navigate = useNavigate();
    const { setToken } = useAuth(); // Obtener la función para manejar el token

    useEffect(() => {
        let timeout;

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                logoutUser();
            }, 5 * 60 * 1000); // 5 minutos
        };

        const logoutUser = () => {
            console.log("Sesión cerrada por inactividad.");
            sessionStorage.removeItem("token");  // Eliminar el token
            setToken(null);  // Actualizar el estado de autenticación
            navigate("/"); // Redirigir al login
        };

        // Detectar actividad del usuario
        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keypress", resetTimer);
        window.addEventListener("scroll", resetTimer);
        window.addEventListener("click", resetTimer);

        resetTimer();  // Inicializa el temporizador

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keypress", resetTimer);
            window.removeEventListener("scroll", resetTimer);
            window.removeEventListener("click", resetTimer);
        };
    }, [navigate, setToken]);

    return null;
};

export default InactivityHandler;
