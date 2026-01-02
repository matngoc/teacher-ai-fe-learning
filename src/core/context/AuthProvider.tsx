import React, {createContext, useEffect, useState} from "react";
import {deleteCookie, getCookie, setCookie} from "../utils/cookieUtil.js";

interface AuthContextProps {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = getCookie("token");
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        setCookie("token", token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        deleteCookie("token");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

