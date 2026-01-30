import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useModuleStore = create((set, get) => ({
    modules: [],
    loading: false,
    error: null,

    fetchModules: async () => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const response = await axios.get(`${API_URL}/modules`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ modules: response.data.modules, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.error || 'Error al obtener módulos', loading: false });
        }
    },

    fetchAdminModules: async () => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const response = await axios.get(`${API_URL}/modules/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ modules: response.data.modules, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.error || 'Error al obtener módulos', loading: false });
        }
    },

    createModule: async (moduleData) => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            await axios.post(`${API_URL}/modules`, moduleData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await get().fetchAdminModules();
            set({ loading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.response?.data?.error || 'Error al crear módulo', loading: false });
            return { success: false, error: error.response?.data?.error };
        }
    },

    updateModule: async (id, moduleData) => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            await axios.put(`${API_URL}/modules/${id}`, moduleData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await get().fetchAdminModules();
            set({ loading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.response?.data?.error || 'Error al actualizar módulo', loading: false });
            return { success: false, error: error.response?.data?.error };
        }
    },

    deleteModule: async (id) => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            await axios.delete(`${API_URL}/modules/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await get().fetchAdminModules();
            set({ loading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.response?.data?.error || 'Error al eliminar módulo', loading: false });
            return { success: false, error: error.response?.data?.error };
        }
    },

    fetchModule: async (id) => {
        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const response = await axios.get(`${API_URL}/modules/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.error || 'Error al obtener el módulo', loading: false });
            return { success: false, error: error.response?.data?.error };
        }
    }
}));
