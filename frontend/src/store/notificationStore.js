import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    pendingLevelUp: null,

    setPendingLevelUp: (data) => set({ pendingLevelUp: data }),
    clearLevelUp: () => set({ pendingLevelUp: null }),

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                set({ notifications: response.data.notifications, loading: false });
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
