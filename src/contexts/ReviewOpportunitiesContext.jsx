import React, { createContext, useState, useCallback } from 'react';

export const ReviewOpportunitiesContext = createContext();

export const ReviewOpportunitiesProvider = ({ children }) => {
  const [reviewOpportunitiesMetadata, setReviewOpportunitiesMetadata] = useState({
    pickupLocations: [],
    hungerSpots: [],
    drivers: [],
    vehicles: [],
  });

  const updateReviewOpportunitiesMetadata = useCallback((newMetadata) => {
    setReviewOpportunitiesMetadata((prev) => ({
      ...prev,
      ...newMetadata,
    }));
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
