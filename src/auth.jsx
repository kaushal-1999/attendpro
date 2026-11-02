import { createContext, useContext, useEffect, useState } from 'react';
import { AuthAPI } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('attendpro_token'));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('attendpro_user');
        return raw ? JSON.parse(raw) : null;
    });

    const login = async (mobile, password) => {
        const { data } = await AuthAPI.login(mobile, password);
        if (data.role !== 'admin') {
            throw new Error('This portal is for super admin only.');
        }
        localStorage.setItem('attendpro_token', data.token);
        localStorage.setItem('attendpro_user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('attendpro_token');
        localStorage.removeItem('attendpro_user');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        if (token && !user) {
            AuthAPI.me().then(({ data }) => setUser(data)).catch(logout);
        }
    }, [token, user]);

    return (
        <AuthCtx.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthCtx.Provider>
    );
}

export const useAuth = () => useContext(AuthCtx);