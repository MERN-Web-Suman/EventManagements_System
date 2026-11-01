// src/components/common/SkeletonCard.js
import React from 'react';

export const SkeletonCard = () => (
  <div className="glass rounded-2xl overflow-hidden">
    <div className="skeleton h-48 w-full"></div>
    <div className="p-5 space-y-3">
      <div className="skeleton h-4 w-20 rounded-full"></div>
      <div className="skeleton h-6 w-3/4 rounded-lg"></div>
      <div className="skeleton h-4 w-full rounded-lg"></div>
      <div className="skeleton h-4 w-2/3 rounded-lg"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="skeleton h-6 w-20 rounded-lg"></div>
        <div className="skeleton h-9 w-28 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;
