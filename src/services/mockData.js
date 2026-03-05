// Driver mock data for assignments, vehicles, and drivers
export const mockAssignments = [
  {
    id: 1,
    status: 'assigned',
    pickup: {
      organizationName: 'Taj Krishna Hotel',
      contactPerson: 'Nargis Siddique',
      contactNumber: '+91 98765 43210',
      location: {
        address: 'Road No. 1, Banjara Hills, Hyderabad',
        coordinates: { lat: 17.4156, lng: 78.4347 },
        mapLink: 'https://maps.google.com/?q=17.4156,78.4347',
      },
      scheduledTime: '2026-02-14T10:00:00',
      estimatedQuantity: '50 kg',
    },
    delivery: {
      hungerSpotName: 'Akshaya Patra - Gachibowli',
      locationName: 'DLF Cyber City, Gachibowli',
      location: {
        address: 'DLF Cyber City, Gachibowli, Hyderabad',
        coordinates: { lat: 17.4435, lng: 78.3772 },
        mapLink: 'https://maps.google.com/?q=17.4435,78.3772',
      },
    },
    vehicle: {
      number: 'TS-09-AB-1234',
      type: 'Mini Truck',
      pickupLocation: 'Depot - Madhapur',
    },
    timeline: [
      { status: 'assigned', timestamp: '2026-02-14T08:00:00', note: 'Assignment created' },
    ],
  },
  // ... more mock assignments as needed
];
