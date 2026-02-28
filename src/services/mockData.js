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

// =====================================================
// SCHEMA-ALIGNED MOCK DATA
// =====================================================

// Statuses (matches statuses table)
export const mockStatuses = [
  { status_id: 1, status_name: 'created' },
  { status_id: 2, status_name: 'assigned' },
  { status_id: 7, status_name: 'reached' },
  { status_id: 3, status_name: 'picked_up' },
  { status_id: 4, status_name: 'delivered' },
  { status_id: 5, status_name: 'verified' },
  { status_id: 6, status_name: 'cancelled' },
];

// Donors (matches donors table)
export const mockDonors = [
  { 
    donor_id: 1, 
    donor_name: 'Taj Krishna Hotel', 
    city: 'Hyderabad',
    pincode: '500034',
    contact_person: 'Nargis Siddique', 
    mobile_number: '+91 98765 43210',
    address: 'Road No. 1, Banjara Hills, Hyderabad',
    location: '17.4156,78.4347',
    is_active: true,
  },
  { 
    donor_id: 2, 
    donor_name: 'ITC Kohenur', 
    city: 'Hyderabad',
    pincode: '500081',
    contact_person: 'Lakshmi Prasad', 
    mobile_number: '+91 98765 12345',
    address: 'HITEC City Main Road, Madhapur, Hyderabad',
    location: '17.4504,78.3814',
    is_active: true,
  },
  { 
    donor_id: 3, 
    donor_name: 'Taj Coromandel Chennai', 
    city: 'Chennai',
    pincode: '600034',
    contact_person: 'Karthik Subramanian', 
    mobile_number: '+91 99887 76655',
    address: '37 MG Road, Nungambakkam, Chennai',
    location: '13.0604,80.2496',
    is_active: true,
  },
  { 
    donor_id: 4, 
    donor_name: 'Novotel HICC Hyderabad', 
    city: 'Hyderabad',
    pincode: '500081',
    contact_person: 'Srikanth Rao', 
    mobile_number: '+91 98123 45678',
    address: 'HICC Complex, Madhapur, Hyderabad',
    location: '17.4574,78.3726',
    is_active: true,
  },
  { 
    donor_id: 5, 
    donor_name: 'ITC Grand Chola Chennai', 
    city: 'Chennai',
    pincode: '600032',
    contact_person: 'Arun Kumar', 
    mobile_number: '+91 97654 32100',
    address: '63 Mount Road, Guindy, Chennai',
    location: '13.0108,80.2197',
    is_active: true,
  },
  { 
    donor_id: 6, 
    donor_name: 'Marriott Hyderabad', 
    city: 'Hyderabad',
    pincode: '500034',
    contact_person: 'Priya Menon', 
    mobile_number: '+91 99001 22334',
    address: 'Tank Bund Road, Hyderabad',
    location: '17.4239,78.4738',
    is_active: true,
  },
];

// Hunger Spots (schema-aligned)
export const mockHungerSpotsSchema = [
  { 
    hunger_spot_id: 1, 
    spot_name: 'Akshaya Patra - Gachibowli', 
    city: 'Hyderabad',
    pincode: '500032',
    contact_person: 'Srinivas Rao',
    mobile_number: '+91 98765 11111',
    address: 'DLF Cyber City, Gachibowli, Hyderabad',
    location: '17.4435,78.3772',
    capacity_meals: 200,
    is_active: true,
  },
  { 
    hunger_spot_id: 2, 
    spot_name: 'Robin Hood Army - Kondapur', 
    city: 'Hyderabad',
    pincode: '500084',
    contact_person: 'Ramya Krishna',
    mobile_number: '+91 98765 22222',
    address: 'Kondapur Junction, Hyderabad',
    location: '17.4603,78.3527',
    capacity_meals: 150,
    is_active: true,
  },
  { 
    hunger_spot_id: 3, 
    spot_name: 'Roti Bank - Secunderabad', 
    city: 'Hyderabad',
    pincode: '500003',
    contact_person: 'Mahesh Kumar',
    mobile_number: '+91 98765 33333',
    address: 'Platform 1, Secunderabad Station',
    location: '17.4344,78.5013',
    capacity_meals: 300,
    is_active: true,
  },
  { 
    hunger_spot_id: 4, 
    spot_name: 'Anna Annadhanam Trust - T Nagar', 
    city: 'Chennai',
    pincode: '600017',
    contact_person: 'Vijay Kumar',
    mobile_number: '+91 98765 44444',
    address: 'Panagal Park, T Nagar, Chennai',
    location: '13.0418,80.2341',
    capacity_meals: 250,
    is_active: true,
  },
];

// Drivers (users with DRIVER role)
export const mockDrivers = [
  { user_id: 3, name: 'Ravi Shankar', mobile_number: '+91 98765 33333', is_active: true },
  { user_id: 4, name: 'Murali Krishna', mobile_number: '+91 98765 44444', is_active: true },
  { user_id: 6, name: 'Ganesh Babu', mobile_number: '+91 98765 66666', is_active: true },
];

// Vehicles (schema-aligned)
export const mockVehiclesSchema = [
  { vehicle_id: 1, vehicle_no: 'TS-09-AB-1234', notes: 'Mini Truck - 500 kg capacity' },
  { vehicle_id: 2, vehicle_no: 'TS-09-CD-5678', notes: 'Van - 200 kg capacity' },
  { vehicle_id: 3, vehicle_no: 'TN-07-EF-9012', notes: 'Mini Truck - 500 kg capacity' },
  { vehicle_id: 4, vehicle_no: 'TS-09-GH-3456', notes: 'Large Truck - 1000 kg capacity' },
  { vehicle_id: 5, vehicle_no: 'TN-07-IJ-7890', notes: 'Van - 200 kg capacity' },
];

// Opportunities with items (main pickup data)
export const mockOpportunities = [
  {
    opportunity_id: 1,
    donor_id: 1,
    hunger_spot_id: 1,
    status_id: 2, // assigned
    driver_id: 3,
    vehicle_id: 1,
    creator_id: 2,
    assignee_id: 3,
    feeding_count: 50,
    pickup_eta: '2026-02-27T10:00:00',
    notes: 'Please use service entrance',
    created_at: '2026-02-27T08:00:00',
    // Denormalized for display
    donor: { donor_id: 1, donor_name: 'Taj Krishna Hotel', contact_person: 'Nargis Siddique', mobile_number: '+91 98765 43210', address: 'Road No. 1, Banjara Hills, Hyderabad', location: '17.4156,78.4347' },
    hunger_spot: { hunger_spot_id: 1, spot_name: 'Akshaya Patra - Gachibowli', contact_person: 'Srinivas Rao', mobile_number: '+91 98765 11111', address: 'DLF Cyber City, Gachibowli, Hyderabad', location: '17.4435,78.3772' },
    driver: { user_id: 3, name: 'Ravi Shankar', mobile_number: '+91 98765 33333' },
    vehicle: { vehicle_id: 1, vehicle_no: 'TS-09-AB-1234', notes: 'Mini Truck - 500 kg capacity' },
    status: { status_id: 2, status_name: 'assigned' },
    items: [
      { opportunity_item_id: 1, food_name: 'Biryani', quality: 'Good', quantity_value: 25, quantity_unit: 'kg' },
      { opportunity_item_id: 2, food_name: 'Raita', quality: 'Good', quantity_value: 10, quantity_unit: 'kg' },
    ],
  },
  {
    opportunity_id: 2,
    donor_id: 2,
    hunger_spot_id: 2,
    status_id: 3, // picked_up
    driver_id: 4,
    vehicle_id: 2,
    creator_id: 2,
    assignee_id: 4,
    feeding_count: 30,
    pickup_eta: '2026-02-27T11:30:00',
    notes: null,
    created_at: '2026-02-27T09:00:00',
    donor: { donor_id: 2, donor_name: 'ITC Kohenur', contact_person: 'Lakshmi Prasad', mobile_number: '+91 98765 12345', address: 'HITEC City Main Road, Madhapur, Hyderabad', location: '17.4504,78.3814' },
    hunger_spot: { hunger_spot_id: 2, spot_name: 'Robin Hood Army - Kondapur', contact_person: 'Ramya Krishna', mobile_number: '+91 98765 22222', address: 'Kondapur Junction, Hyderabad', location: '17.4603,78.3527' },
    driver: { user_id: 4, name: 'Murali Krishna', mobile_number: '+91 98765 44444' },
    vehicle: { vehicle_id: 2, vehicle_no: 'TS-09-CD-5678', notes: 'Van - 200 kg capacity' },
    status: { status_id: 3, status_name: 'picked_up' },
    items: [
      { opportunity_item_id: 3, food_name: 'Pulao', quality: 'Excellent', quantity_value: 15, quantity_unit: 'kg' },
      { opportunity_item_id: 4, food_name: 'Dal Makhani', quality: 'Good', quantity_value: 8, quantity_unit: 'kg' },
      { opportunity_item_id: 5, food_name: 'Naan', quality: 'Good', quantity_value: 50, quantity_unit: 'pieces' },
    ],
  },
  {
    opportunity_id: 3,
    donor_id: 3,
    hunger_spot_id: 4,
    status_id: 1, // created (not yet assigned)
    driver_id: null,
    vehicle_id: null,
    creator_id: 2,
    assignee_id: null,
    feeding_count: 45,
    pickup_eta: '2026-02-27T14:00:00',
    notes: 'Vegetarian items only',
    created_at: '2026-02-27T10:00:00',
    donor: { donor_id: 3, donor_name: 'Taj Coromandel Chennai', contact_person: 'Karthik Subramanian', mobile_number: '+91 99887 76655', address: '37 MG Road, Nungambakkam, Chennai', location: '13.0604,80.2496' },
    hunger_spot: { hunger_spot_id: 4, spot_name: 'Anna Annadhanam Trust - T Nagar', contact_person: 'Vijay Kumar', mobile_number: '+91 98765 44444', address: 'Panagal Park, T Nagar, Chennai', location: '13.0418,80.2341' },
    driver: null,
    vehicle: null,
    status: { status_id: 1, status_name: 'created' },
    items: [
      { opportunity_item_id: 6, food_name: 'Idli', quality: 'Fresh', quantity_value: 100, quantity_unit: 'pieces' },
      { opportunity_item_id: 7, food_name: 'Sambar', quality: 'Good', quantity_value: 10, quantity_unit: 'liters' },
    ],
  },
  {
    opportunity_id: 4,
    donor_id: 4,
    hunger_spot_id: 3,
    status_id: 4, // delivered
    driver_id: 6,
    vehicle_id: 4,
    creator_id: 2,
    assignee_id: 6,
    feeding_count: 60,
    pickup_eta: '2026-02-27T08:00:00',
    notes: null,
    created_at: '2026-02-27T06:00:00',
    donor: { donor_id: 4, donor_name: 'Novotel HICC Hyderabad', contact_person: 'Srikanth Rao', mobile_number: '+91 98123 45678', address: 'HICC Complex, Madhapur, Hyderabad', location: '17.4574,78.3726' },
    hunger_spot: { hunger_spot_id: 3, spot_name: 'Roti Bank - Secunderabad', contact_person: 'Mahesh Kumar', mobile_number: '+91 98765 33333', address: 'Platform 1, Secunderabad Station', location: '17.4344,78.5013' },
    driver: { user_id: 6, name: 'Ganesh Babu', mobile_number: '+91 98765 66666' },
    vehicle: { vehicle_id: 4, vehicle_no: 'TS-09-GH-3456', notes: 'Large Truck - 1000 kg capacity' },
    status: { status_id: 4, status_name: 'delivered' },
    items: [
      { opportunity_item_id: 8, food_name: 'Hyderabadi Biryani', quality: 'Excellent', quantity_value: 30, quantity_unit: 'kg' },
      { opportunity_item_id: 9, food_name: 'Mirchi Ka Salan', quality: 'Good', quantity_value: 5, quantity_unit: 'kg' },
    ],
  },
];

// Helper to get opportunities for a specific driver
export const getDriverOpportunities = (driverId) => {
  return mockOpportunities.filter(opp => opp.driver_id === driverId);
};

// Helper to get unassigned opportunities
export const getUnassignedOpportunities = () => {
  return mockOpportunities.filter(opp => opp.driver_id === null);
};

// Helper to get all active opportunities (for coordinator view)
export const getAllActiveOpportunities = () => {
  return mockOpportunities.filter(opp => opp.status_id !== 5 && opp.status_id !== 6);
};
