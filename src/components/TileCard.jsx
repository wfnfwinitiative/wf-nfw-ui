import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TileCard = ({ icon: Icon, title, description, onClick, to, badge, color = 'orange' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };

  const colorClasses = {
    orange: 'from-ngo-orange to-orange-600 hover:shadow-ngo-orange/30',
    green: 'from-ngo-green to-green-600 hover:shadow-ngo-green/30',
    blue: 'from-blue-500 to-blue-600 hover:shadow-blue-500/30',
    purple: 'from-purple-500 to-purple-600 hover:shadow-purple-500/30'
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group p-4 md:p-6 border border-gray-100"
    >
      {badge && (
        <div className="absolute top-4 right-4 bg-ngo-orange text-white text-xs font-semibold px-3 py-1 rounded-full">
          {badge}
        </div>
      )}
      
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-sm md:text-base font-semibold text-ngo-dark mb-2">{title}</h3>
      <p className="text-ngo-gray text-sm leading-relaxed">{description}</p>

      <div className="mt-4 flex items-center text-ngo-orange font-medium text-sm group-hover:gap-2 transition-all">
        <span>Open</span>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};
