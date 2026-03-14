import React from 'react';
import logo from '../assets/NoFoodWaste_Logo_Orange.png'; 

/**
 * Official logo. Use /logo.png consistently across Login, Sidebar, Dashboard header.
 * Responsive sizing: h-20 md:h-24 lg:h-32 (max ~8rem on desktop). Never stretches.
 * @param {string} [className] - Optional extra classes (e.g. "mb-4")
 */
export const Logo = ({ className = '' }) => {
  const defaultClass = 'w-auto object-contain';
  const combined = className ? `${defaultClass} ${className}` : `h-12 md:h-14 ${defaultClass}`;

  return (
    <img
      src={logo}
      alt="NoFoodWaste"
      className={combined}
    />
  );
};
