import { backendApi } from './apiClient';
import config from '../../config';

export const opportunityApi = {
    async createOpportunity(opportunityData) {
        try {
            const response = await backendApi.post('/api/opportunities/', opportunityData);
            console.log('Create Opportunity Response:', response);
            
            return response;
        } catch (error) {
            console.error('Error creating opportunity:', error);
            throw error;
        }
    },

    async getOpportunities() {
        try {
            const response = await backendApi.get('/api/opportunities/');
            console.log('Opportunities API Response:', response);
            
            let data = [];
            
            // Handle different response formats
            if (Array.isArray(response)) {
                data = response;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                data = response.data.results;
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            throw error;
        }
    }
}