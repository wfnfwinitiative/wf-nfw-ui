import { serviceApi } from './apiClient';

export const StatusApi = {
  async getStatuses() {
    try {
      const response = await serviceApi.get('/api/statuses/');
      console.log('Statuses API Response:', response);

      let data = [];

      // Handle different response formats
      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data && Array.isArray(response.data.statuses)) {
        data = response.data.statuses;
      }

      return data;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return [];
    }
  },
};