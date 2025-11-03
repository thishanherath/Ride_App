import React from 'react';

const DriverAcceptedStatus = ({ driverName, acceptedAt, showAnimation, onAnimationComplete, className = '' }) => {
  return (
    <div className={`driver-accepted-status ${className}`}>
      <h2>Driver Accepted Request</h2>
      {driverName && <p>{driverName} has accepted your ride request</p>}
    </div>
  );
};

export default DriverAcceptedStatus;