import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiClient} from "../api/API"
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
    role: string;
    sub: string;
}

interface AuthContextType {
    accessToken: string | null;
    role: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAxiosReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within the AuthProvider');
    }
    return context;
}

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const navigate = useNavigate();
    const [isAxiosReady, setIsAxiosReady] = useState(false);
    let refreshPromise: Promise<string> | null = null;

    const decodeAndSetTokenData = (token: string) => {
        const decoded: JwtPayload = jwtDecode(token);
        setRole(decoded.role);
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.post(
                "/auth/login",
                {email, password},
                {withCredentials: true}
            );
            const token = response.data.access_token;
            setAccessToken(token);
            decodeAndSetTokenData(token);
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post("/auth/logout", null, {
                withCredentials: true
            });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setAccessToken(null);
            setRole(null);
            navigate("/auth");
        }
    }

    useEffect(() => {
        const requestInterceptor = apiClient.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            apiClient.interceptors.request.eject(requestInterceptor);
        };
    }, [accessToken]);

    useEffect(() => {
        const responseInterceptor = apiClient.interceptors.response.use(
            response => response,
            async error => {
                if (error.response?.status === 440) {
                    logout();
                    return Promise.reject(error);
                }

                if (error.response?.status === 401) {
                    try {
                        if (!refreshPromise) {
                            refreshPromise = apiClient.post('/auth/refresh', null, {
                                withCredentials: true,
                            }).then(res => {
                                const newToken = res.data.access_token;
                                setAccessToken(newToken);
                                decodeAndSetTokenData(newToken);
                                return newToken;
                            }).finally(() => {
                                refreshPromise = null;
                            });
                        }
                        const newAccessToken = await refreshPromise;
                        error.config.headers = {
                            ...error.config.headers,
                            Authorization: `Bearer ${newAccessToken}`,
                        };
                        return apiClient(error.config);
                    } catch (refreshError) {
                        console.error("Refresh failed:", refreshError);
                        logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, [])

    useEffect(() => {
        if (accessToken) {
            setIsAxiosReady(true);
        }
    }, [accessToken]);

    return (
        <AuthContext.Provider
            value={{accessToken, role, login, logout, isAxiosReady}}>
            {children}
        </AuthContext.Provider>
    );
};