import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    pendingLevelUp: null,
    pendingModuleCompletion: null,

    setPendingLevelUp: (data) => {
        set({ pendingLevelUp: data });
        // Reproducir sonido de level up
        const audio = new Audio('/level-up.mp3');
        audio.play().catch(e => console.log('Audio play blocked:', e));
    },
    clearLevelUp: () => set({ pendingLevelUp: null }),

    setPendingModuleCompletion: (data) => {
        set({ pendingModuleCompletion: data });
    },
    clearModuleCompletion: () => {
        const { pendingLevelUp } = get();
        set({ pendingModuleCompletion: null });

        // Si hay un nivel pendiente, se "dispara" ahora al cerrar el de modulo
        if (pendingLevelUp) {
            // Refrescar el estado para que LevelUpModal lo detecte si es necesario
            set({ pendingLevelUp: { ...pendingLevelUp } });
        }
    },

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const newNotifications = response.data.notifications;
                const oldNotifications = get().notifications;

                // Si hay notificaciones nuevas que no estaban antes, sonar alerta
                if (newNotifications.length > oldNotifications.length && oldNotifications.length > 0) {
                    const audio = new Audio('/alert.mp3');
                    audio.play().catch(e => console.log('Audio play blocked:', e));
                }

                set({ notifications: newNotifications, loading: false });
                get().fetchUnreadCount();
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({ loading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const token = useAuthStore.getState().token;
            const response = await axios.get(`${API_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                set({ unreadCount: response.data.count });
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    },

    markAsRead: async (id) => {
        try {
            const token = useAuthStore.getState().token;
            await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Actualizar estado local
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, is_read: 1 } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            const token = useAuthStore.getState().token;
            await axios.put(`${API_URL}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: 1 })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }
}));
