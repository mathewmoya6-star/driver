import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-button"></div>
    </div>
  );
};

export default LoadingSpinner;
