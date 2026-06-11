import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configurar axios globalmente para manejar cookies de sesión (HTTP-Only)
axios.defaults.withCredentials = true;

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            viewAsStudent: false,

            setViewAsStudent: (val) => set({ viewAsStudent: val }),

            // Login con Google
            loginWithGoogle: async (credential) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/auth/google`, {
                        credential,
                    });

                    const { user } = response.data;

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return { success: true, user };
                } catch (error) {
                    // Extraer el mensaje más específico posible
                    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.response?.data?.error || 
                        (typeof error.response?.data === 'string' ? error.response.data : null) ||
                        error.message || 
                        'Error al iniciar sesion';

                    console.error('[AuthStore] Login failed details:', {
                        serverMessage: error.response?.data?.message,
                        axiosMessage: error.message,
                        status: error.response?.status
                    });

                    set({
                        error: errorMessage,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Logout
            logout: async () => {
                try {
                    await axios.post(`${API_URL}/auth/logout`);
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },

            // Verificar sesión activa
            verifyToken: async () => {
                set({ isLoading: true });
                try {
                    const response = await axios.get(`${API_URL}/auth/verify?t=${Date.now()}`);

                    if (response.data.valid) {
                        const currentUser = get().user;
                        const fetchedUser = response.data.user;
                        
                        // Solo actualizar si hay cambios reales para evitar re-renders innecesarios
                        // Comparamos puntos y nivel que son los que más cambian
                        if (!currentUser || 
                            currentUser.points !== fetchedUser.points || 
                            currentUser.level !== fetchedUser.level ||
                            currentUser.id !== fetchedUser.id) {
                            
                            set({
                                isAuthenticated: true,
                                user: { ...currentUser, ...fetchedUser },
                                isLoading: false
                            });
                        } else {
                            set({ isAuthenticated: true, isLoading: false });
                        }
                        return true;
                    } else {
                        get().logout();
                        set({ isLoading: false });
                        return false;
                    }
                } catch (error) {
                    // Si recibimos 401, simplemente limpiamos el estado local de auth
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    return false;
                }
            },

            // Actualizar el estado del usuario en el store
            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData },
                }));
            },

            // Limpiar error
            clearError: () => set({ error: null }),
        }),
        {
            name: 'cgr-lms-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                viewAsStudent: state.viewAsStudent,
            }),
        }
    )
);

// Interceptor de axios para incluir header de modo estudiante y manejar errores 401
axios.interceptors.request.use((config) => {
    const viewAsStudent = useAuthStore.getState().viewAsStudent;
    if (viewAsStudent) {
        config.headers['x-view-as-student'] = 'true';
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor retorna 401 Unauthorized, cerramos sesión localmente
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }

        // Manejo de modo mantenimiento (503 Service Unavailable)
        if (error.response?.status === 503 && error.response?.data?.maintenance) {
            window.location.href = '/maintenance';
        }

        return Promise.reject(error);
    }
);
