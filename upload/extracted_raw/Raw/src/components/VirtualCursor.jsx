import React from 'react';

const VirtualCursor = ({ x, y, isPinching }) => {
  if (x === null || y === null) return null;
  
  return (
    <div 
      className={`virtual-cursor ${isPinching ? 'pinching' : ''}`}
      style={{ left: `${x}px`, top: `${y}px` }}
    />
  );
};

export default VirtualCursor;