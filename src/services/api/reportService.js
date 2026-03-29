import { serviceApi } from './apiClient';

export const getReport = async (filters) => {
  try {
    const response = await serviceApi.post("/api/reports/opportunities", filters);
    console.log("Report API Response:", response);

    let data = {
      summary: {},
      grid: [],
      graph: [],
    };
    if (response) {
      data = {
        summary: response.summary || {},
        grid: response.grid || [],
        graph: response.graph || [],
      };
    }    

    return data;
  } catch (error) {
    console.error("Error fetching report:", error);

    return {
      summary: {
        total_food: 0,
        people_count: 0,
      },
      grid: [],
      graph: [],
    };
  }
};


export const getDrivers = async () => {
  try {
    const response = await serviceApi.get("/api/users/");
    console.log("Drivers API Response:", response);

    let data = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      data = response.data.results;
    } else if (response.data && Array.isArray(response.data.users)) {
      data = response.data.users;
    }

    
    return data.map((u) => ({
      id: u.user_id,
      name: u.name,
    }));
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
};

export const getHungerSpots = async () => {
  try {
      const response = await serviceApi.get("/api/hunger-spots/");
      console.log("Hunger Spots API Response:", response);

      let data = [];

      
      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data && Array.isArray(response.data.hunger_spots)) {
        data = response.data.hunger_spots;
      }

      return data;
    } catch (error) {
      console.error("Error fetching hunger spots:", error);
      return [];
    }
};

export const getVehicles = async () => { 
   try {
      const response = await serviceApi.get("/api/vehicles/");
      console.log("Vehicles API Response:", response);
      let data = [];      
      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data && Array.isArray(response.data.vehicles)) {
        data = response.data.vehicles;
      }

      return data;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      return [];
    }
};

export const getDonors = async () => {
   try {
      const response = await serviceApi.get("/api/donors/");
      console.log("Donors API Response:", response);

      let data = [];

      
      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data && Array.isArray(response.data.donors)) {
        data = response.data.donors;
      }

      return data;
    } catch (error) {
      console.error("Error fetching donors:", error);
      return [];
    }
};
export const getStatus = async () => {
   try {
      const response = await serviceApi.get("/api/statuses/");
      console.log("Statuses API Response:", response);

      let data = [];

      
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
      console.error("Error fetching statuses:", error);
      return [];
    }
};

//   async getStatuses() {
//     try {
//       const response = await serviceApi.get('/api/statuses/');
//       console.log('Statuses API Response:', response);

//       let data = [];

//       // Handle different response formats
//       if (Array.isArray(response)) {
//         data = response;
//       } else if (Array.isArray(response.data)) {
//         data = response.data;
//       } else if (response.data && Array.isArray(response.data.results)) {
//         data = response.data.results;
//       } else if (response.data && Array.isArray(response.data.statuses)) {
//         data = response.data.statuses;
//       }

//       return data;
//     } catch (error) {
//       console.error('Error fetching statuses:', error);
//       return [];
//     }
//   },
// };