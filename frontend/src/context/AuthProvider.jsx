
import { useState } from "react";
import { AuthContext } from "./authContext";
import api from "../services/api";



export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);

        return response.data;
    };

    const register = async (name, email, password) => {
        const response = await api.post("/auth/register", {
            name,
            email,
            password,
        });

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, login, register, logout, isAuthenticated: !!user }}
        >
            {children}
        </AuthContext.Provider>
    );
}
