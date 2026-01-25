import React, {createContext, useEffect, useState} from "react";
import {deleteCookie, getCookie, setCookie} from "../utils/cookieUtil.js";
import {registerAuthLogout} from "./authEvent.ts";

interface AuthContextProps {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    syncAuth: () => void;
}
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        registerAuthLogout(logout);
    }, []);

    const syncAuth = () => {
        const token = getCookie("token");
        setIsAuthenticated(!!token);
    };

    useEffect(() => {
        syncAuth();
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        setCookie("token", token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        deleteCookie("token");
        deleteCookie("refresh_token");
        setIsAuthenticated(false);
    };

    return (
      <AuthContext.Provider
        value={{ isAuthenticated, login, logout, syncAuth }}
      >
          {!isLoading && children}
      </AuthContext.Provider>
    );
};
