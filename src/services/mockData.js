// Mock data for development and demonstration
// Based on Hyderabad and Chennai locations

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
  {
    id: 2,
    status: 'reached',
    pickup: {
      organizationName: 'ITC Kohenur',
      contactPerson: 'Lakshmi Prasad',
      contactNumber: '+91 98765 12345',
      location: {
        address: 'HITEC City Main Road, Madhapur, Hyderabad',
        coordinates: { lat: 17.4504, lng: 78.3814 },
        mapLink: 'https://maps.google.com/?q=17.4504,78.3814',
      },
      scheduledTime: '2026-02-14T11:30:00',
      estimatedQuantity: '30 kg',
    },
    delivery: {
      hungerSpotName: 'Robin Hood Army - Kondapur',
      locationName: 'Kondapur Junction',
      location: {
        address: 'Kondapur Main Road, Hyderabad',
        coordinates: { lat: 17.4603, lng: 78.3527 },
        mapLink: 'https://maps.google.com/?q=17.4603,78.3527',
      },
    },
    vehicle: {
      number: 'TS-09-CD-5678',
      type: 'Van',
      pickupLocation: 'Depot - Kukatpally',
    },
    timeline: [
      { status: 'assigned', timestamp: '2026-02-14T09:00:00', note: 'Assignment created' },
      { status: 'reached', timestamp: '2026-02-14T11:15:00', note: 'Driver reached pickup location' },
    ],
  },
  {
    id: 3,
    status: 'submitted',
    pickup: {
      organizationName: 'Taj Coromandel Chennai',
      contactPerson: 'Karthik Subramanian',
      contactNumber: '+91 99887 76655',
      location: {
        address: '37 MG Road, Nungambakkam, Chennai',
        coordinates: { lat: 13.0604, lng: 80.2496 },
        mapLink: 'https://maps.google.com/?q=13.0604,80.2496',
      },
      scheduledTime: '2026-02-14T09:00:00',
      estimatedQuantity: '45 kg',
    },
    delivery: {
      hungerSpotName: 'Anna Annadhanam Trust - T Nagar',
      locationName: 'T Nagar Bus Stand',
      location: {
        address: 'Panagal Park, T Nagar, Chennai',
        coordinates: { lat: 13.0418, lng: 80.2341 },
        mapLink: 'https://maps.google.com/?q=13.0418,80.2341',
      },
    },
    vehicle: {
      number: 'TN-07-EF-9012',
      type: 'Mini Truck',
      pickupLocation: 'Depot - Anna Nagar',
    },
    submittedDetails: {
      foodName: 'Idli, Sambar, Chutneys',
      quantityCollected: '42 kg',
      pickupTime: '2026-02-14T09:30:00',
      estimatedDeliveryTime: '2026-02-14T10:30:00',
      images: [
        'https://drive.google.com/file/d/abc123',
        'https://drive.google.com/file/d/def456',
      ],
    },
    timeline: [
      { status: 'assigned', timestamp: '2026-02-14T07:00:00', note: 'Assignment created' },
      { status: 'reached', timestamp: '2026-02-14T08:45:00', note: 'Driver reached pickup location' },
      { status: 'submitted', timestamp: '2026-02-14T09:30:00', note: 'Pickup details submitted' },
    ],
  },
  {
    id: 4,
    status: 'delivered',
    pickup: {
      organizationName: 'Novotel HICC Hyderabad',
      contactPerson: 'Srikanth Rao',
      contactNumber: '+91 98123 45678',
      location: {
        address: 'HICC Complex, Madhapur, Hyderabad',
        coordinates: { lat: 17.4574, lng: 78.3726 },
        mapLink: 'https://maps.google.com/?q=17.4574,78.3726',
      },
      scheduledTime: '2026-02-14T08:00:00',
      estimatedQuantity: '60 kg',
    },
    delivery: {
      hungerSpotName: 'Roti Bank - Secunderabad',
      locationName: 'Secunderabad Railway Station',
      location: {
        address: 'Platform 1, Secunderabad Station',
        coordinates: { lat: 17.4344, lng: 78.5013 },
        mapLink: 'https://maps.google.com/?q=17.4344,78.5013',
      },
    },
    vehicle: {
      number: 'TS-09-GH-3456',
      type: 'Large Truck',
      pickupLocation: 'Depot - Ameerpet',
    },
    submittedDetails: {
      foodName: 'Hyderabadi Biryani, Raita, Mirchi Ka Salan',
      quantityCollected: '58 kg',
      pickupTime: '2026-02-14T08:15:00',
      estimatedDeliveryTime: '2026-02-14T09:30:00',
      actualDeliveryTime: '2026-02-14T09:25:00',
      images: [
        'https://drive.google.com/file/d/ghi789',
      ],
    },
    timeline: [
      { status: 'assigned', timestamp: '2026-02-14T06:00:00', note: 'Assignment created' },
      { status: 'reached', timestamp: '2026-02-14T07:45:00', note: 'Driver reached pickup location' },
      { status: 'submitted', timestamp: '2026-02-14T08:15:00', note: 'Pickup details submitted' },
      { status: 'delivered', timestamp: '2026-02-14T09:25:00', note: 'Food delivered to hunger spot' },
    ],
  },
  {
    id: 5,
    status: 'verified',
    pickup: {
      organizationName: 'ITC Grand Chola Chennai',
      contactPerson: 'Arun Kumar',
      contactNumber: '+91 97654 32100',
      location: {
        address: '63 Mount Road, Guindy, Chennai',
        coordinates: { lat: 13.0108, lng: 80.2197 },
        mapLink: 'https://maps.google.com/?q=13.0108,80.2197',
      },
      scheduledTime: '2026-02-13T14:00:00',
      estimatedQuantity: '35 kg',
    },
    delivery: {
      hungerSpotName: 'Karunai Illam - Adyar',
      locationName: 'Adyar Bus Depot',
      location: {
        address: 'LB Road, Adyar, Chennai',
        coordinates: { lat: 13.0012, lng: 80.2565 },
        mapLink: 'https://maps.google.com/?q=13.0012,80.2565',
      },
    },
    vehicle: {
      number: 'TN-07-IJ-7890',
      type: 'Van',
      pickupLocation: 'Depot - Velachery',
    },
    submittedDetails: {
      foodName: 'Chettinad Rice, Rasam, Poriyal',
      quantityCollected: '33 kg',
      pickupTime: '2026-02-13T14:20:00',
      estimatedDeliveryTime: '2026-02-13T15:30:00',
      actualDeliveryTime: '2026-02-13T15:15:00',
      images: [
        'https://drive.google.com/file/d/jkl012',
        'https://drive.google.com/file/d/mno345',
      ],
    },
    timeline: [
      { status: 'assigned', timestamp: '2026-02-13T12:00:00', note: 'Assignment created' },
      { status: 'reached', timestamp: '2026-02-13T13:45:00', note: 'Driver reached pickup location' },
      { status: 'submitted', timestamp: '2026-02-13T14:20:00', note: 'Pickup details submitted' },
      { status: 'delivered', timestamp: '2026-02-13T15:15:00', note: 'Food delivered to hunger spot' },
      { status: 'verified', timestamp: '2026-02-13T15:30:00', note: 'Verified by coordinator' },
    ],
  },
];

export const mockAnalytics = {
  totalFoodSaved: '2,450 kg',
  hungerSpotsServed: 45,
  activeDrivers: 12,
  totalDeliveries: 156,
  thisWeek: {
    foodSaved: '320 kg',
    deliveries: 24,
  },
  thisMonth: {
    foodSaved: '1,200 kg',
    deliveries: 89,
  },
};

export const mockHungerSpots = [
  { id: 1, name: 'Akshaya Patra - Gachibowli', address: 'DLF Cyber City, Gachibowli, Hyderabad' },
  { id: 2, name: 'Robin Hood Army - Kondapur', address: 'Kondapur Junction, Hyderabad' },
  { id: 3, name: 'Roti Bank - Secunderabad', address: 'Secunderabad Railway Station, Hyderabad' },
  { id: 4, name: 'Anna Annadhanam Trust - T Nagar', address: 'Panagal Park, T Nagar, Chennai' },
  { id: 5, name: 'Karunai Illam - Adyar', address: 'LB Road, Adyar, Chennai' },
  { id: 6, name: 'Seva Kitchen - Ameerpet', address: 'Ameerpet Metro Station, Hyderabad' },
  { id: 7, name: 'Food For All - Jubilee Hills', address: 'Road No. 36, Jubilee Hills, Hyderabad' },
  { id: 8, name: 'Chennai Food Bank - Egmore', address: 'Egmore Railway Station, Chennai' },
];

export const mockVehicles = [
  { id: 1, number: 'TS-09-AB-1234', type: 'Mini Truck', capacity: '500 kg' },
  { id: 2, number: 'TS-09-CD-5678', type: 'Van', capacity: '200 kg' },
  { id: 3, number: 'TN-07-EF-9012', type: 'Mini Truck', capacity: '500 kg' },
  { id: 4, number: 'TS-09-GH-3456', type: 'Large Truck', capacity: '1000 kg' },
  { id: 5, number: 'TN-07-IJ-7890', type: 'Van', capacity: '200 kg' },
  { id: 6, number: 'TS-09-KL-2468', type: 'Mini Truck', capacity: '500 kg' },
];

export const mockOrganizations = [
  { id: 1, name: 'Taj Krishna Hotel', contact: 'Venkat Reddy', phone: '+91 98765 43210', city: 'Hyderabad' },
  { id: 2, name: 'ITC Kohenur', contact: 'Lakshmi Prasad', phone: '+91 98765 12345', city: 'Hyderabad' },
  { id: 3, name: 'Taj Coromandel', contact: 'Karthik Subramanian', phone: '+91 99887 76655', city: 'Chennai' },
  { id: 4, name: 'Novotel HICC', contact: 'Srikanth Rao', phone: '+91 98123 45678', city: 'Hyderabad' },
  { id: 5, name: 'ITC Grand Chola', contact: 'Arun Kumar', phone: '+91 97654 32100', city: 'Chennai' },
  { id: 6, name: 'Marriott Hyderabad', contact: 'Priya Menon', phone: '+91 99001 22334', city: 'Hyderabad' },
  { id: 7, name: 'The Leela Palace Chennai', contact: 'Ramesh Iyer', phone: '+91 98456 78901', city: 'Chennai' },
];

export const mockUsers = [
  { id: 1, name: 'Rajesh Kumar', email: 'admin@nofoodwaste.org', role: 'admin', status: 'active' },
  { id: 2, name: 'Sunita Reddy', email: 'sunita@nofoodwaste.org', role: 'coordinator', status: 'active' },
  { id: 3, name: 'Ravi Shankar', email: 'ravi@nofoodwaste.org', role: 'driver', status: 'active' },
  { id: 4, name: 'Murali Krishna', email: 'murali@nofoodwaste.org', role: 'driver', status: 'active' },
  { id: 5, name: 'Anitha Kumari', email: 'anitha@nofoodwaste.org', role: 'coordinator', status: 'inactive' },
  { id: 6, name: 'Ganesh Babu', email: 'ganesh@nofoodwaste.org', role: 'driver', status: 'active' },
];

export const mockRecentActivity = [
  { id: 1, type: 'delivery', message: 'Food delivered to Roti Bank - Secunderabad', time: '10 minutes ago', user: 'Ravi Shankar' },
  { id: 2, type: 'pickup', message: 'Pickup created from Taj Krishna Hotel', time: '25 minutes ago', user: 'Sunita Reddy' },
  { id: 3, type: 'verification', message: 'Delivery verified at Karunai Illam - Adyar', time: '1 hour ago', user: 'Sunita Reddy' },
  { id: 4, type: 'assignment', message: 'New assignment created for Murali', time: '2 hours ago', user: 'Rajesh Kumar' },
  { id: 5, type: 'user', message: 'New driver Ganesh registered', time: '3 hours ago', user: 'Rajesh Kumar' },
  { id: 6, type: 'pickup', message: 'Pickup completed at ITC Grand Chola Chennai', time: '4 hours ago', user: 'Ganesh Babu' },
];
