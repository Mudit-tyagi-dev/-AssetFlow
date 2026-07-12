import apiClient from './api';

/**
 * Audits API Service
 */
export const AuditsService = {
  /**
   * List and filter audit cycles (Admin, Manager, Dept Head only)
   * @param {Object} params - Query parameters (status, limit, offset)
   */
  listCycles: async (params = {}) => {
    const response = await apiClient.get('/audits', { params });
    return response.data;
  },

  /**
   * Create a new Audit Cycle (Admin/Asset Manager only)
   * @param {Object} data - AuditCycleCreate schema (scope_department_id, scope_location, date_range_start, date_range_end, auditor_ids)
   */
  createCycle: async (data) => {
    const response = await apiClient.post('/audits', data);
    return response.data;
  },

  /**
   * Start a draft audit cycle (Admin/Manager only)
   * @param {string} id - Cycle UUID
   */
  startCycle: async (id) => {
    const response = await apiClient.post(`/audits/${id}/start`);
    return response.data;
  },

  /**
   * List items belonging to an audit cycle
   * @param {string} id - Cycle UUID
   * @param {Object} params - Query parameters (status, limit, offset)
   */
  listItems: async (id, params = {}) => {
    const response = await apiClient.get(`/audits/${id}/items`, { params });
    return response.data;
  },

  /**
   * Verify an item within an active audit cycle
   * @param {string} id - Cycle UUID
   * @param {string} itemId - Item UUID
   * @param {Object} data - AuditItemUpdate schema (status, notes)
   */
  verifyItem: async (id, itemId, data) => {
    const response = await apiClient.put(`/audits/${id}/items/${itemId}`, data);
    return response.data;
  },

  /**
   * Close an audit cycle irreversibly (Admin/Asset Manager only)
   * @param {string} id - Cycle UUID
   */
  closeCycle: async (id) => {
    const response = await apiClient.post(`/audits/${id}/close`);
    return response.data;
  }
};
