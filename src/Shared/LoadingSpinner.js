import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="overlay">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingSpinner;
