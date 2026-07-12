import apiClient from './api';

/**
 * Notifications API Service
 */
export const NotificationsService = {
  /**
   * Retrieve notifications for the current authenticated user
   * @param {Object} params - Query parameters (is_read, limit, offset)
   */
  listNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  /**
   * Update notification status (mark read/unread)
   * @param {string} id - Notification UUID
   * @param {boolean} isRead - Whether the notification is read
   */
  markNotificationRead: async (id, isRead) => {
    const response = await apiClient.put(`/notifications/${id}`, { is_read: isRead });
    return response.data;
  }
};
