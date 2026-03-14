import { serviceApi } from './apiClient';
import config from '../../config';

export const VehicleApi = {
    async getVehicles(){
        try {
            const response = await serviceApi.get('/api/vehicles/');
            console.log('Vehicles API Response:', response);
            
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
            return data.map(vehicle => ({
                id: vehicle.vehicle_id || vehicle.id,
                number: vehicle.vehicle_no || vehicle.number,
                notes: vehicle.notes,
                createdAt: vehicle.created_at,
                updatedAt: vehicle.updated_at,
                ...vehicle // Include all original fields
            }));
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    async createVehicle(data) {
        try {
            const response = await serviceApi.post('/api/vehicles/', data);
            console.log('Vehicle created:', response);
            return response;
        } catch (error) {
            console.error('Error creating Driver:', error);
            throw error;
        }
    },

    async updateVehicle(vehicleid, data) {
        try {
            const response = await serviceApi.patch(`/api/vehicles/${vehicleid}`, data);
            console.log(`Vehicle ${vehicleid} updated:`, response);
            return response;
        } catch (error) {
            console.error(`Error updating Vehicle ${vehicleid}:`, error);
            throw error;
        }
    },

    async deleteVehicle(vehicleid) {
        try {
            const response = await serviceApi.delete(`/api/vehicles/${vehicleid}`);
            console.log(`Vehicle ${vehicleid} deleted:`, response);
            return response;
        } catch (error) {
            console.error(`Error deleting Vehicle ${vehicleid}:`, error);
            throw error;
        }
    },

    async activateVehicle(vehicleid) {
        try {
            const response = await serviceApi.post(`/api/vehicles/activate/${vehicleid}`);
            console.log(`Vehicle ${vehicleid} activated:`, response);
            return response;
        } catch (error) {
            console.error(`Error activating Vehicle ${vehicleid}:`, error);
            throw error;
        }
    },
}