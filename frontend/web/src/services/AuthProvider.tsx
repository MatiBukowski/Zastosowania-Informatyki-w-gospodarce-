import {createContext, ReactNode, useContext, useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {apiClient} from "../api/API"
import {jwtDecode} from "jwt-decode";
import {usePostHog} from "@posthog/react";

interface JwtPayload {
    role: string;
    sub: string;
    first_name: string;
    surname: string;
}

interface AuthContextType {
    accessToken: string | null;
    role: string | null;
    firstName: string | null;
    surname: string | null;
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
    const [firstName, setFirstName] = useState<string | null>(null);
    const [surname, setSurname] = useState<string | null>(null);
    const navigate = useNavigate();
    const posthog = usePostHog();
    const initRef = useRef(false);
    const [isAxiosReady, setIsAxiosReady] = useState(false);
    let refreshPromise: Promise<string> | null = null;

    const decodeAndSetTokenData = (token: string) => {
        const decoded: JwtPayload = jwtDecode(token);
        setRole(decoded.role);
        setFirstName(decoded.first_name);
        setSurname(decoded.surname);
        
        // Store in localStorage for persistence and to prevent flickering
        localStorage.setItem('user_role', decoded.role);
        localStorage.setItem('user_firstName', decoded.first_name);
        localStorage.setItem('user_surname', decoded.surname);
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.post(
                "/api/auth/login",
                {email, password},
                {withCredentials: true}
            );
            const token = response.data.access_token;
            setAccessToken(token);
            decodeAndSetTokenData(token);
            
            // Identify user in PostHog for better error tracking
            posthog.identify(email, {
                email: email,
                firstName: firstName,
                surname: surname,
                role: role
            });
            
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post("/api/auth/logout", null, {
                withCredentials: true
            });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setAccessToken(null);
            setRole(null);
            setFirstName(null);
            setSurname(null);
            
            // Clear user info from localStorage
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_firstName');
            localStorage.removeItem('user_surname');
            
            // Reset PostHog user
            posthog.reset();
            
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
                            refreshPromise = apiClient.post('/api/auth/refresh', null, {
                                withCredentials: true,
                            }).then(res => {
                                const newToken = res.data.access_token;
                                // Only update the token, user info stays the same (cached in localStorage)
                                setAccessToken(newToken);
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

    useEffect(() => {
        const initializeAuth = async () => {
            if (initRef.current) return;
            initRef.current = true;

            const cachedRole = localStorage.getItem('user_role');
            const cachedFirstName = localStorage.getItem('user_firstName');
            const cachedSurname = localStorage.getItem('user_surname');
            
            if (cachedRole) setRole(cachedRole);
            if (cachedFirstName) setFirstName(cachedFirstName);
            if (cachedSurname) setSurname(cachedSurname);

            if (!cachedRole) {
                try {
                    const response = await apiClient.post('/api/auth/refresh', null, {
                        withCredentials: true,
                    });
                    const token = response.data.access_token;
                    setAccessToken(token);
                    decodeAndSetTokenData(token);
                } catch (error) {
                    setAccessToken(null);
                    setRole(null);
                    setFirstName(null);
                    setSurname(null);
                    
                    // Clear localStorage on auth failure
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_firstName');
                    localStorage.removeItem('user_surname');
                }
            }
        };

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{accessToken, role, firstName, surname, login, logout, isAxiosReady}}>
            {children}
        </AuthContext.Provider>
    );
};