import { backendApi } from './apiClient';
import config from '../../config';

export const VehicleApi = {
    async getVehicles(){
        try {
            const response = await backendApi.get('/api/vehicles/');
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
    }
}