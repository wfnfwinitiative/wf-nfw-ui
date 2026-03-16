import React, { createContext, useState, useCallback } from 'react';

export const ReviewOpportunitiesContext = createContext();

export const ReviewOpportunitiesProvider = ({ children }) => {
  const [reviewOpportunitiesMetadata, setReviewOpportunitiesMetadata] = useState({
    pickupLocations: [],
    hungerSpots: [],
    drivers: [],
    vehicles: [],
    statuses: [],
    statusMap: {},
  });

  const updateReviewOpportunitiesMetadata = useCallback((newMetadata) => {
    setReviewOpportunitiesMetadata((prev) => {
      const updated = { ...prev, ...newMetadata };
      // Compute statusMap if statuses are provided and is an array
      if (Array.isArray(newMetadata.statuses)) {
        updated.statusMap = newMetadata.statuses.reduce((map, status) => {
          map[status.status_id] = status.status_name;
          return map;
        }, {});
      }
      return updated;
    });
  }, []);

  const value = {
    metadata: reviewOpportunitiesMetadata,
    updateMetadata: updateReviewOpportunitiesMetadata,
  };

  return (
    <ReviewOpportunitiesContext.Provider value={value}>
      {children}
    </ReviewOpportunitiesContext.Provider>
  );
};

export const useReviewOpportunitiesMetadata = () => {
  const context = React.useContext(ReviewOpportunitiesContext);
  if (!context) {
    throw new Error('useReviewOpportunitiesMetadata must be used within ReviewOpportunitiesProvider');
  }
  return context;
};
