import React from 'react';
import './ErrorOverlay.css';

const ErrorOverlay = ({ error, onCloseError }) => {
  return (
    <div className="error-overlay">
      <div className="error-content">
        <h3 className="error-heading">Error</h3>
        <p className="error-message">{error}</p>
        <button className="close-button" onClick={onCloseError}>
          Close
        </button>
        
      </div>
    </div>
  );
};

export default ErrorOverlay;
