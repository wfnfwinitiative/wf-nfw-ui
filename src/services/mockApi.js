const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  USERS: 'nofoodwaste_users',
  DRIVERS: 'nofoodwaste_drivers',
  VEHICLES: 'nofoodwaste_vehicles',
  LOCATIONS: 'nofoodwaste_locations',
  PICKUPS: 'nofoodwaste_pickups',
  SUBMISSIONS: 'nofoodwaste_submissions',
  VERIFICATIONS: 'nofoodwaste_verifications'
};

const getFromStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const initializeMockData = () => {
  if (!localStorage.getItem('nofoodwaste_initialized')) {
    const users = [
      { id: '1', name: 'Admin User', phone: '9876543210', password: 'admin123', role: 'admin', email: 'admin@nofoodwaste.org' },
      { id: '2', name: 'Coordinator One', phone: '9876543211', password: 'coord123', role: 'coordinator', email: 'coord@nofoodwaste.org' },
      { id: '3', name: 'Driver One', phone: '9876543212', password: 'driver123', role: 'driver', email: 'driver@nofoodwaste.org' },
      { id: '4', name: 'Driver Two', phone: '9876543213', password: 'driver123', role: 'driver', email: 'driver2@nofoodwaste.org' },
      { id: '5', name: 'Driver Three', phone: '9876543214', password: 'driver123', role: 'driver', email: 'driver3@nofoodwaste.org' },
      { id: '6', name: 'Chin', phone: '9876543215', password: 'driver123', role: 'driver', email: 'driver4@nofoodwaste.org' },
      { id: '7', name: 'Jin', phone: '9876543216', password: 'driver123', role: 'driver', email: 'driver5@nofoodwaste.org' },
      { id: '8', name: 'bill', phone: '9876655448', password: 'driver123', role: 'driver', email: 'driver5@nofoodwaste.org' },
      { id: '9', name: 'Support Admin', phone: '9876543220', password: 'support123', role: 'supportadmin', email: 'support@nofoodwaste.org' }
    ];

    const drivers = [
      { id: '1', name: 'Rajesh Kumar', phone: '9876543212', licenseNumber: 'DL-01-2020-1234', status: 'active', vehicleId: '1' },
      { id: '2', name: 'Amit Sharma', phone: '9876543213', licenseNumber: 'DL-01-2020-5678', status: 'active', vehicleId: '2' },
      { id: '3', name: 'Bob', phone: '9876543214', licenseNumber: 'DL-01-2020-1111', status: 'active', vehicleId: '3' },
      { id: '4', name: 'Chin', phone: '9876543215', licenseNumber: 'DL-01-2020-2222', status: 'active', vehicleId: '4' },
      { id: '5', name: 'Jin', phone: '9876543216', licenseNumber: 'DL-01-2020-3333', status: 'active', vehicleId: '5' }
    ];

    const vehicles = [
      { id: '1', number: 'DL-01-AB-1234', type: 'Van', capacity: '500kg', status: 'active' },
      { id: '2', number: 'DL-01-CD-5678', type: 'Truck', capacity: '1000kg', status: 'active' },
      { id: '3', number: 'DL-01-CD-1111', type: 'Truck', capacity: '1000kg', status: 'active' },
      { id: '4', number: 'DL-01-CD-2222', type: 'Truck', capacity: '1000kg', status: 'active' },
      { id: '5', number: 'DL-01-CD-3333', type: 'Truck', capacity: '1000kg', status: 'active' }
    ];

    const locations = [
      { id: '1', name: 'Big Bazaar - Lajpat Nagar', type: 'pickup', address: 'Lajpat Nagar, New Delhi', lat: 28.5677, lng: 77.2431, contact: '011-12345678' },
      { id: '2', name: 'Rajeev Gandhi Ashram', type: 'hungerspot', address: 'Kalkaji, New Delhi', lat: 28.5494, lng: 77.2588, contact: '011-87654321' },
      { id: '3', name: 'Wedding Hall - Mayur Vihar', type: 'pickup', address: 'Mayur Vihar, Delhi', lat: 28.6089, lng: 77.2978, contact: '011-11223344' }
    ];

    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
    saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
    saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
    saveToStorage(STORAGE_KEYS.PICKUPS, []);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, []);
    saveToStorage(STORAGE_KEYS.VERIFICATIONS, []);

    localStorage.setItem('nofoodwaste_initialized', 'true');
  }
};

initializeMockData();

export const mockApi = {
  async getUsers() {
    await delay(300);
    return getFromStorage(STORAGE_KEYS.USERS);
  },

  async addUser(userData) {
    await delay(300);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const newUser = { ...userData, id: Date.now().toString() };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async updateUser(id, updates) {
    await delay(300);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveToStorage(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    throw new Error('User not found');
  },

  async deleteUser(id) {
    await delay(300);
    const users = getFromStorage(STORAGE_KEYS.USERS).filter(u => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return true;
  },

  async getDrivers() {
    await delay(300);
    return getFromStorage(STORAGE_KEYS.DRIVERS);
  },

  async addDriver(driverData) {
    await delay(300);
    const drivers = getFromStorage(STORAGE_KEYS.DRIVERS);
    const newDriver = { ...driverData, id: Date.now().toString(), status: 'active' };
    drivers.push(newDriver);
    saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
    return newDriver;
  },

  async updateDriver(id, updates) {
    await delay(300);
    const drivers = getFromStorage(STORAGE_KEYS.DRIVERS);
    const index = drivers.findIndex(d => d.id === id);
    if (index !== -1) {
      drivers[index] = { ...drivers[index], ...updates };
      saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      return drivers[index];
    }
    throw new Error('Driver not found');
  },

  async deleteDriver(id) {
    await delay(300);
    const drivers = getFromStorage(STORAGE_KEYS.DRIVERS).filter(d => d.id !== id);
    saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
    return true;
  },

  async getVehicles() {
    await delay(300);
    return getFromStorage(STORAGE_KEYS.VEHICLES);
  },

  async addVehicle(vehicleData) {
    await delay(300);
    const vehicles = getFromStorage(STORAGE_KEYS.VEHICLES);
    const newVehicle = { ...vehicleData, id: Date.now().toString(), status: 'active' };
    vehicles.push(newVehicle);
    saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
    return newVehicle;
  },

  async updateVehicle(id, updates) {
    await delay(300);
    const vehicles = getFromStorage(STORAGE_KEYS.VEHICLES);
    const index = vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...updates };
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return vehicles[index];
    }
    throw new Error('Vehicle not found');
  },

  async deleteVehicle(id) {
    await delay(300);
    const vehicles = getFromStorage(STORAGE_KEYS.VEHICLES).filter(v => v.id !== id);
    saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
    return true;
  },

  async getLocations(type = null) {
    await delay(300);
    const locations = getFromStorage(STORAGE_KEYS.LOCATIONS);
    return type ? locations.filter(l => l.type === type) : locations;
  },

  async addLocation(locationData) {
    await delay(300);
    const locations = getFromStorage(STORAGE_KEYS.LOCATIONS);
    const newLocation = { ...locationData, id: Date.now().toString() };
    locations.push(newLocation);
    saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
    return newLocation;
  },

  async updateLocation(id, updates) {
    await delay(300);
    const locations = getFromStorage(STORAGE_KEYS.LOCATIONS);
    const index = locations.findIndex(l => l.id === id);
    if (index !== -1) {
      locations[index] = { ...locations[index], ...updates };
      saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
      return locations[index];
    }
    throw new Error('Location not found');
  },

  async deleteLocation(id) {
    await delay(300);
    const locations = getFromStorage(STORAGE_KEYS.LOCATIONS).filter(l => l.id !== id);
    saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
    return true;
  },

  async getPickups(filters = {}) {
    await delay(300);
    let pickups = getFromStorage(STORAGE_KEYS.PICKUPS);
    
    if (filters.status) {
      pickups = pickups.filter(p => p.status === filters.status);
    }
    if (filters.driverId) {
      pickups = pickups.filter(p => p.driverId === filters.driverId);
    }
    
    return pickups;
  },

  async getPickupById(id) {
    await delay(300);
    const pickups = getFromStorage(STORAGE_KEYS.PICKUPS);
    return pickups.find(p => p.id === id);
  },

  async createPickup(pickupData) {
    await delay(300);
    const pickups = getFromStorage(STORAGE_KEYS.PICKUPS);
    const newPickup = {
      ...pickupData,
      id: Date.now().toString(),
      status: 'CREATED',
      createdAt: new Date().toISOString()
    };
    pickups.push(newPickup);
    saveToStorage(STORAGE_KEYS.PICKUPS, pickups);
    return newPickup;
  },

  async updatePickup(id, updates) {
    await delay(300);
    const pickups = getFromStorage(STORAGE_KEYS.PICKUPS);
    const index = pickups.findIndex(p => p.id === id);
    if (index !== -1) {
      pickups[index] = { ...pickups[index], ...updates };
      saveToStorage(STORAGE_KEYS.PICKUPS, pickups);
      return pickups[index];
    }
    throw new Error('Pickup not found');
  },

  async assignDriver(pickupId, driverId) {
    await delay(300);
    return this.updatePickup(pickupId, { driverId, status: 'ASSIGNED', assignedAt: new Date().toISOString() });
  },

  async acceptPickup(pickupId) {
    await delay(300);
    return this.updatePickup(pickupId, { status: 'ACCEPTED', acceptedAt: new Date().toISOString() });
  },

  async submitProof(pickupId, proofData) {
    await delay(500);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    const newSubmission = {
      id: Date.now().toString(),
      pickupId,
      ...proofData,
      submittedAt: new Date().toISOString()
    };
    submissions.push(newSubmission);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    
    await this.updatePickup(pickupId, { status: 'PENDING_VERIFICATION' });
    
    return newSubmission;
  },

  async getSubmissions(pickupId = null) {
    await delay(300);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    return pickupId ? submissions.filter(s => s.pickupId === pickupId) : submissions;
  },

  async getSubmissionById(id) {
    await delay(300);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    return submissions.find(s => s.id === id);
  },

  async verifySubmission(submissionId, action, notes = '') {
    await delay(300);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    const submission = submissions.find(s => s.id === submissionId);
    
    if (!submission) {
      throw new Error('Submission not found');
    }

    const verifications = getFromStorage(STORAGE_KEYS.VERIFICATIONS);
    const verification = {
      id: Date.now().toString(),
      submissionId,
      action,
      notes,
      verifiedAt: new Date().toISOString()
    };
    verifications.push(verification);
    saveToStorage(STORAGE_KEYS.VERIFICATIONS, verification);

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
    await this.updatePickup(submission.pickupId, { status: newStatus, verifiedAt: new Date().toISOString() });

    return verification;
  },

  async getAnalytics() {
    await delay(500);
    const pickups = getFromStorage(STORAGE_KEYS.PICKUPS);
    
    return {
      totalPickups: pickups.length,
      verified: pickups.filter(p => p.status === 'VERIFIED').length,
      pending: pickups.filter(p => p.status === 'PENDING_VERIFICATION').length,
      inProgress: pickups.filter(p => ['ASSIGNED', 'ACCEPTED', 'PICKUP_DONE', 'DELIVERED'].includes(p.status)).length,
      rejected: pickups.filter(p => p.status === 'REJECTED').length,
      byMonth: this.generateMonthlyStats(pickups),
      byDriver: this.generateDriverStats(pickups)
    };
  },

  generateMonthlyStats(pickups) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      pickups: Math.floor(Math.random() * 50) + 10,
      verified: Math.floor(Math.random() * 40) + 5
    }));
  },

  generateDriverStats(pickups) {
    const drivers = getFromStorage(STORAGE_KEYS.DRIVERS);
    return drivers.map(driver => ({
      name: driver.name,
      completed: pickups.filter(p => p.driverId === driver.id && p.status === 'VERIFIED').length,
      pending: pickups.filter(p => p.driverId === driver.id && p.status === 'PENDING_VERIFICATION').length
    }));
  },

  /**
   * Returns dashboard data filtered by date range. Filtering based on submission submittedAt.
   * Charts must consume this only (no raw mock data).
   * @param {string} dateRange - "today" | "7d" | "30d"
   */
  async getFilteredDashboardData(dateRange) {
    await delay(300);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    const pickups = getFromStorage(STORAGE_KEYS.PICKUPS);
    const drivers = getFromStorage(STORAGE_KEYS.DRIVERS);

    const now = new Date();
    let start;
    if (dateRange === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === '7d') {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
    }
    const startIso = start.toISOString();

    const filteredSubmissions = submissions.filter(s => s.submittedAt >= startIso);
    const pickupIds = [...new Set(filteredSubmissions.map(s => s.pickupId))];
    const filteredPickups = pickups.filter(p => pickupIds.includes(p.id));

    const totalPickups = filteredPickups.length;
    const verified = filteredPickups.filter(p => p.status === 'VERIFIED').length;
    const pending = filteredPickups.filter(p => p.status === 'PENDING_VERIFICATION').length;
    const inProgress = filteredPickups.filter(p => ['ASSIGNED', 'ACCEPTED', 'PICKUP_DONE', 'DELIVERED'].includes(p.status)).length;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonthMap = {};
    filteredSubmissions.forEach(s => {
      const d = new Date(s.submittedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!byMonthMap[key]) byMonthMap[key] = { month: monthNames[d.getMonth()], pickups: 0, verified: 0, avgLatencyHours: null, _verifiedHours: [] };
      byMonthMap[key].pickups += 1;
      const pickup = pickups.find(p => p.id === s.pickupId);
      if (pickup && pickup.status === 'VERIFIED') byMonthMap[key].verified += 1;
      if (pickup && pickup.status === 'VERIFIED' && pickup.verifiedAt && pickup.createdAt) {
        const latencyHours = (new Date(pickup.verifiedAt) - new Date(pickup.createdAt)) / (1000 * 60 * 60);
        byMonthMap[key]._verifiedHours.push(latencyHours);
      }
    });
    const byMonth = Object.keys(byMonthMap)
      .sort()
      .map(k => {
        const m = byMonthMap[k];
        const avgLatencyHours = m._verifiedHours.length
          ? m._verifiedHours.reduce((a, b) => a + b, 0) / m._verifiedHours.length
          : null;
        const { _verifiedHours, ...rest } = m;
        return { ...rest, avgLatencyHours: avgLatencyHours != null ? Math.round(avgLatencyHours * 10) / 10 : null };
      });

    const byDriver = drivers.map(driver => ({
      name: driver.name,
      completed: filteredPickups.filter(p => p.driverId === driver.id && p.status === 'VERIFIED').length,
      pending: filteredPickups.filter(p => p.driverId === driver.id && p.status === 'PENDING_VERIFICATION').length
    }));

    return {
      totalPickups,
      verified,
      pending,
      inProgress,
      byMonth,
      byDriver
    };
  },

  /**
   * Mock: POST /mock/feature-flag
   * Request: { feature: string, enabled: boolean }
   * Response: { status: 'success', feature: string, enabled: boolean }
   */
  async updateFeatureFlag(payload) {
    await delay(300);
    return {
      status: 'success',
      feature: payload?.feature ?? 'LLM_FEATURE',
      enabled: Boolean(payload?.enabled)
    };
  }
};
