import apiClient from './api';

/**
 * Bookings API Service
 */
export const BookingsService = {
  /**
   * List bookings for the organization
   * @param {Object} params - Query parameters (asset_id, booked_by_id, status, limit, offset)
   */
  listBookings: async (params = {}) => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  /**
   * Book a resource
   * @param {Object} data - Booking creation data (asset_id, start_time, end_time, department_id)
   */
  createBooking: async (data) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  /**
   * Reschedule an upcoming booking
   * @param {string} id - Booking UUID
   * @param {Object} data - Booking update data (start_time, end_time, status)
   */
  rescheduleBooking: async (id, data) => {
    const response = await apiClient.put(`/bookings/${id}`, data);
    return response.data;
  },

  /**
   * Cancel an active or upcoming booking
   * @param {string} id - Booking UUID
   */
  cancelBooking: async (id) => {
    const response = await apiClient.delete(`/bookings/${id}`);
    return response.data;
  }
};
