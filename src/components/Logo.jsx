import React from 'react';
import logo from '../assets/NoFoodWaste_Logo_Orange.png'; 

/**
 * Official logo. Use /logo.png consistently across Login, Sidebar, Dashboard header.
 * Responsive sizing: h-20 md:h-24 lg:h-32 (max ~8rem on desktop). Never stretches.
 * @param {string} [className] - Optional extra classes (e.g. "mb-4")
 */
export const Logo = ({ className = '' }) => {
  const responsiveClass = 'h-20 md:h-24 lg:h-32 w-auto object-contain';
  const combined = className ? `${responsiveClass} ${className}` : responsiveClass;

  return (
    <img
      src={logo}
      alt="NoFoodWaste"
      className={combined}
    />
  );
};
