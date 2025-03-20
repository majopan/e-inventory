import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
    token: null, // Valor predeterminado
    setToken: () => {},
    userData: null,
});

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (token) {
            async function fetchUserData() {
                try {
                    const response = await fetch("http://localhost:8000/api/datos-protegidos/", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    });

                    const data = await response.json();
                    if (response.ok) {
                        setUserData(data);
                    } else {
                        setUserData(null);
                    }
                } catch (err) {
                    console.error("Error en la petición:", err);
                }
            }

            fetchUserData();
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, userData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
