import { serviceApi } from './apiClient';
import config from '../../config';

export const opportunityApi = {
    async createOpportunity(opportunityData) {
        try {
            const response = await serviceApi.post('/api/opportunities/', opportunityData);
            console.log('Create Opportunity Response:', response);
            
            return response;
        } catch (error) {
            console.error('Error creating opportunity:', error);
            throw error;
        }
    },

    async getOpportunities() {
        try {
            const response = await serviceApi.get('/api/opportunities/');
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
    },

    async getOpportunityById(id) {
        try {
            const response = await serviceApi.get(`/api/opportunities/${id}`);
            console.log('Opportunity Detail API Response:', response);
            
            // Handle different response formats
            if (response.data) {
                return response.data;
            }
            return response;
        } catch (error) {
            console.error('Error fetching opportunity by id:', error);
            throw error;
        }
    },

    async updateOpportunity(id, opportunityData) {
        try {
            const response = await serviceApi.patch(`/api/opportunities/${id}`, opportunityData);
            console.log('Update Opportunity Response:', response);
            return response.data || response;
        } catch (error) {
            console.error('Error updating opportunity:', error);
            throw error;
        }
    },

    async addOpportunityItem(opportunityId, itemData) {
        try {
            const response = await serviceApi.post('/api/opportunity-items/', {
                opportunity_id: opportunityId,
                ...itemData
            });
            console.log('Add Opportunity Item Response:', response);
            return response.data || response;
        } catch (error) {
            console.error('Error adding opportunity item:', error);
            throw error;
        }
    },

    async updateOpportunityItem(itemId, itemData) {
        try {
            const response = await serviceApi.put(`/api/opportunity-items/${itemId}`, itemData);
            console.log('Update Opportunity Item Response:', response);
            return response.data || response;
        } catch (error) {
            console.error('Error updating opportunity item:', error);
            throw error;
        }
    },

    async deleteOpportunityItem(itemId) {
        try {
            const response = await serviceApi.delete(`/api/opportunity-items/${itemId}`);
            console.log('Delete Opportunity Item Response:', response);
            return response.data || response;
        } catch (error) {
            console.error('Error deleting opportunity item:', error);
            throw error;
        }
    }
}