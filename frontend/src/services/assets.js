import apiClient from './api';
import axios from 'axios';

/**
 * Assets API Service
 */
export const AssetsService = {
  /**
   * List all assets
   * @param {Object} params - Query parameters (search, category_id, status, department_id, location, is_bookable, limit, offset)
   */
  listAssets: async (params = {}) => {
    const response = await apiClient.get('/assets', { params });
    return response.data;
  },

  /**
   * Get single asset by ID
   * @param {string} id - Asset UUID
   */
  getAsset: async (id) => {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data;
  },

  /**
   * Create a new asset
   * @param {Object} data - Asset creation data
   */
  createAsset: async (data) => {
    const response = await apiClient.post('/assets', data);
    return response.data;
  },

  /**
   * Update an existing asset
   * @param {string} id - Asset UUID
   * @param {Object} data - Asset update data
   */
  updateAsset: async (id, data) => {
    const response = await apiClient.put(`/assets/${id}`, data);
    return response.data;
  },

  /**
   * Delete an asset
   * @param {string} id - Asset UUID
   */
  deleteAsset: async (id) => {
    const response = await apiClient.delete(`/assets/${id}`);
    return response.data;
  },

  /**
   * Get asset history logs
   * @param {string} id - Asset UUID
   */
  getAssetHistory: async (id) => {
    const response = await apiClient.get(`/assets/${id}/history`);
    return response.data;
  },

  /**
   * Generate a presigned upload URL
   * @param {string} filename - Original filename
   * @param {string} mimeType - File MIME type
   */
  getPresignedUrl: async (filename, mimeType) => {
    const response = await apiClient.post('/assets/presigned-url', null, {
      params: { filename, mime_type: mimeType }
    });
    return response.data;
  },

  /**
   * Upload file to a presigned S3/Storage URL
   * NOTE: We must use standard axios instance without default custom headers (like Authorization)
   * to prevent CORS/Signature issues with S3/GCS.
   * @param {string} uploadUrl - The presigned URL
   * @param {File} file - The file object to upload
   */
  uploadFileToPresignedUrl: async (uploadUrl, file) => {
    // Use raw axios instance with no headers except Content-Type
    const response = await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    return response;
  },

  /**
   * Fetch categories list from the backend (helper for forms)
   */
  getCategories: async () => {
    const response = await apiClient.get('/org/categories');
    return response.data;
  }
};
