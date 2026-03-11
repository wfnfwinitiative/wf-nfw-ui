import { serviceApi } from './apiClient';
import config from '../../config';

export const hungerSpotApi = {
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
    }
}