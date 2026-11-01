// src/components/common/LoadingSpinner.js
import React from 'react';
import { HiSparkles } from 'react-icons/hi';

const LoadingSpinner = ({ fullScreen = true }) => {
  if (!fullScreen) return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center z-50">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-primary-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-orange-gradient flex items-center justify-center">
          <HiSparkles className="text-white text-sm" />
        </div>
      </div>
      <p className="font-display font-bold text-xl gradient-text">FESTIVA</p>
      <p className="text-gray-500 text-sm mt-1">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
