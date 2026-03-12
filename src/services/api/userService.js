import { serviceApi } from './apiClient';
import config from '../../config';

export const UserApi = {
    async getUserByRole(role){
        try {
            const response = await serviceApi.get(`/api/users/by-role/${role}`);
            console.log(`Users API Response for role ${role}:`, response);
            
            let data = [];
            
            // Handle different response formats
            if (Array.isArray(response)) {
                data = response;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                data = response.data.results;
            }
            
            // Transform API response fields to component expected fields
            return data.map(user => ({
                id: user.user_id || user.id,
                name: user.name,
                phone: user.mobile_number,
                status: user.is_active ? 'active' : 'inactive',
                isActive: user.is_active,
                createdAt: user.created_at,
                ...user // Include all original fields
            }));
        } catch (error) {
            console.error(`Error fetching users for role ${role}:`, error);
            throw error;
        }
    },

    async createCoordinator(data) {
        try {
            const response = await serviceApi.post('/api/users/', data);
            console.log('Coordinator created:', response);
            return response;
        } catch (error) {
            console.error('Error creating coordinator:', error);
            throw error;
        }
    },

    async updateCoordinator(userid, data) {
        try {
            const response = await serviceApi.patch(`/api/users/${userid}`, data);
            console.log(`Coordinator ${userid} updated:`, response);
            return response;
        } catch (error) {
            console.error(`Error updating coordinator ${userid}:`, error);
            throw error;
        }
    },

    async deleteCoordinator(userid) {
        try {
            const response = await serviceApi.delete(`/api/users/${userid}`);
            console.log(`Coordinator ${userid} deleted:`, response);
            return response;
        } catch (error) {
            console.error(`Error deleting coordinator ${userid}:`, error);
            throw error;
        }
    },


    async createDriver(data) {
        try {
            const response = await serviceApi.post('/api/users/', data);
            console.log('Driver created:', response);
            return response;
        } catch (error) {
            console.error('Error creating Driver:', error);
            throw error;
        }
    },

    async updateDriver(userid, data) {
        try {
            const response = await serviceApi.patch(`/api/users/${userid}`, data);
            console.log(`Driver ${userid} updated:`, response);
            return response;
        } catch (error) {
            console.error(`Error updating Driver ${userid}:`, error);
            throw error;
        }
    },

    async deleteDriver(userid) {
        try {
            const response = await serviceApi.delete(`/api/users/${userid}`);
            console.log(`Driver ${userid} deleted:`, response);
            return response;
        } catch (error) {
            console.error(`Error deleting Driver ${userid}:`, error);
            throw error;
        }
    },
}