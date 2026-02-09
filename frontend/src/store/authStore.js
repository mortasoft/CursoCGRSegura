import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
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

                    const { token, user } = response.data;

                    // Configurar token en axios para futuras peticiones
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return { success: true, user };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
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
                    // Limpiar token de axios
                    delete axios.defaults.headers.common['Authorization'];

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },

            // Verificar token
            verifyToken: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false });
                    return false;
                }

                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${API_URL}/auth/verify`);

                    if (response.data.valid) {
                        set({
                            isAuthenticated: true,
                            user: { ...get().user, ...response.data.user }
                        });
                        return true;
                    } else {
                        get().logout();
                        return false;
                    }
                } catch (error) {
                    get().logout();
                    return false;
                }
            },

            // Actualizar usuario
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
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                viewAsStudent: state.viewAsStudent,
            }),
        }
    )
);

// Configurar interceptor de axios para incluir header de modo estudiante y manejar errores 401
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
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
