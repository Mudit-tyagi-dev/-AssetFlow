import apiClient from './api';

/**
 * Allocations API Service
 */
export const AllocationsService = {
  /**
   * List allocations for the organization
   * @param {Object} params - Query parameters (status, limit, offset)
   */
  listAllocations: async (params = {}) => {
    const response = await apiClient.get('/allocations', { params });
    return response.data;
  },

  /**
   * Checkout/allocate an asset to an employee or department
   * @param {Object} data - Allocation creation data (asset_id, allocated_to_type, allocated_to_id, expected_return_date)
   */
  allocateAsset: async (data) => {
    const response = await apiClient.post('/allocations', data);
    return response.data;
  },

  /**
   * Process check-in / return of a currently checked-out asset
   * @param {string} assetId - Asset UUID
   * @param {Object} data - Return check-in notes (condition_check_in_notes)
   */
  returnAsset: async (assetId, data) => {
    const response = await apiClient.post(`/allocations/return/${assetId}`, data);
    return response.data;
  },

  /**
   * Request transfer of a currently allocated asset
   * @param {Object} data - Transfer request creation data (asset_id, to_holder_type, to_holder_id)
   */
  requestTransfer: async (data) => {
    const response = await apiClient.post('/allocations/transfers', data);
    return response.data;
  },

  /**
   * List transfer requests
   * @param {Object} params - Query parameters (status, limit, offset)
   */
  listTransfers: async (params = {}) => {
    const response = await apiClient.get('/allocations/transfers', { params });
    return response.data;
  },

  /**
   * Approve or reject an asset transfer request
   * @param {string} id - Transfer request UUID
   * @param {string} status - TransferStatus ("approved" or "rejected")
   */
  resolveTransfer: async (id, status) => {
    const response = await apiClient.put(`/allocations/transfers/${id}`, { status });
    return response.data;
  }
};
