import apiClient from './api';

/**
 * Maintenance API Service
 */
export const MaintenanceService = {
  /**
   * List and filter maintenance requests
   * @param {Object} params - Query parameters (status, priority, asset_id, limit, offset)
   */
  listRequests: async (params = {}) => {
    const response = await apiClient.get('/maintenance', { params });
    return response.data;
  },

  /**
   * Raise a new maintenance request
   * @param {Object} data - Maintenance creation data (asset_id, issue_description, priority, photo_url)
   */
  raiseRequest: async (data) => {
    const response = await apiClient.post('/maintenance', data);
    return response.data;
  },

  /**
   * Approve a maintenance request (Admin/Asset Manager only)
   * @param {string} id - Request UUID
   */
  approveRequest: async (id) => {
    const response = await apiClient.post(`/maintenance/${id}/approve`);
    return response.data;
  },

  /**
   * Reject a maintenance request (Admin/Asset Manager only)
   * @param {string} id - Request UUID
   */
  rejectRequest: async (id) => {
    const response = await apiClient.post(`/maintenance/${id}/reject`);
    return response.data;
  },

  /**
   * Assign a technician or update in-progress status (Admin/Asset Manager only)
   * @param {string} id - Request UUID
   * @param {Object} data - Update data (status, technician_name)
   */
  assignTechnician: async (id, data) => {
    const response = await apiClient.put(`/maintenance/${id}/assign`, data);
    return response.data;
  },

  /**
   * Mark maintenance request resolved (Admin/Asset Manager only)
   * @param {string} id - Request UUID
   */
  resolveRequest: async (id) => {
    const response = await apiClient.post(`/maintenance/${id}/resolve`);
    return response.data;
  }
};
