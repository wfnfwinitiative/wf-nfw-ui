import { serviceApi } from './apiClient';
import config from '../../config';

export const HungerSpotApi = {
    async getHungerSpot(){
        try {
            const response = await serviceApi.get('/api/hunger-spots/');
            console.log('Hunger Spot API Response:', response);
            
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
            return data.map(spot => ({
                id: spot.hunger_spot_id || spot.id,
                name: spot.spot_name || spot.name,
                city: spot.city,
                capacity: spot.capacity_meals,
                contact: spot.contact_person,
                phone: spot.mobile_number,
                address: spot.address,
                ...spot // Include all original fields
            }));
        } catch (error) {
            console.error('Error fetching hunger spots:', error);
            throw error;
        }
    },

      async createHungerSpot(data) {
        try {
            const response = await serviceApi.post('/api/hunger-spots/', data);
            console.log('HungerSpot created:', response);
            return response;
        } catch (error) {
            console.error('Error creating HungerSpot:', error);
            throw error;
        }
    },

    async updateHungerSpot(hunger_spot_id, data) {
        try {
            const response = await serviceApi.patch(`/api/hunger-spots/${hunger_spot_id}`, data);
            console.log(`HungerSpot ${hunger_spot_id} updated:`, response);
            return response;
        } catch (error) {
            console.error(`Error updating Donor ${donorid}:`, error);
            throw error;
        }
    },

    async deleteHungerSpot(hunger_spot_id) {
        try {
            const response = await serviceApi.delete(`/api/hunger-spots/${hunger_spot_id}`);
            console.log(`HungerSpot ${hunger_spot_id} deleted:`, response);
            return response;
        } catch (error) {
            console.error(`Error deleting HungerSpot ${hunger_spot_id}:`, error);
            throw error;
        }
    },

    async activateHungerSpot(hunger_spot_id) {
        try {
            const response = await serviceApi.post(`/api/hunger-spots/activate/${hunger_spot_id}`);
            console.log(`HungerSpot ${hunger_spot_id} activated:`, response);
            return response;
        } catch (error) {
            console.error(`Error activating HungerSpot ${hunger_spot_id}:`, error);
            throw error;
        }
    },
}