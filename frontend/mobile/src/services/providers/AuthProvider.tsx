import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "@/services/api/API";
import { loginUser } from "@/services/api/AuthAPI";
import { ILoginRequest, IRegisterRequest }  from '@/services/interfaces/user';

export interface IJwtPayload {
    role: string;
    user_id: string;
    first_name: string;
    surname: string;
}

interface AuthContextType {
    accessToken: string | null;
    userId: string | null;
    firstName: string | null;
    surname: string | null;
    login: (data: ILoginRequest) => Promise<void>;
    register: (data: IRegisterRequest) => Promise<void>;
    logout: () => void;
    isAxiosReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [surname, setSurname] = useState<string | null>(null);
    const [isAxiosReady, setIsAxiosReady] = useState(false);

    const initRef = useRef(false);


    const decodeAndSetTokenData = async (token: string) => {
        const decoded: IJwtPayload = jwtDecode(token);
        console.log("Decoded token:", decoded);

        const idToSave = String(decoded.user_id);

        setUserId(idToSave);
        setFirstName(decoded.first_name);
        setSurname(decoded.surname);

        if (idToSave) {
            await AsyncStorage.setItem('user_id', idToSave);
        }
    };

    const login = async (data: ILoginRequest) => {
        try {
            const response = await loginUser(data);
            const token = response.access_token;

            // save token
            await AsyncStorage.setItem('user_token', token);

            setAccessToken(token);
            await decodeAndSetTokenData(token);
            setIsAxiosReady(true);
        } catch (error) {
            console.error("Logging error:", error);
            throw error;
        }
    };

    const register = async (data: IRegisterRequest) => {
        try {
            const response = await apiClient.post('/api/auth/register', data);
            const token = response.data.access_token;

            await AsyncStorage.setItem('user_token', token);

            setAccessToken(token);
            await decodeAndSetTokenData(token);
            setIsAxiosReady(true);
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['user_token', 'user_id']);
        } finally {
            setAccessToken(null);
            setUserId(null);
            setIsAxiosReady(false);
        }
    };

    // add a token to each request
    useEffect(() => {
        const requestInterceptor = apiClient.interceptors.request.use(
            async (config) => {
                if (accessToken) {
                    // appends a token to every request
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
        return () => apiClient.interceptors.request.eject(requestInterceptor);
    }, [accessToken]);

    // check if the user is already logged in
    useEffect(() => {
        const initializeAuth = async () => {
            if (initRef.current) return;
            initRef.current = true;

            const savedToken = await AsyncStorage.getItem('user_token');
            if (savedToken) {
                // if the toke is saved, logging process becomes automatic
                setAccessToken(savedToken);
                await decodeAndSetTokenData(savedToken);
                setIsAxiosReady(true);
            }
        };
        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ accessToken, userId, firstName, surname, login, register, logout, isAxiosReady }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within the AuthProvider');
    return context;
};

