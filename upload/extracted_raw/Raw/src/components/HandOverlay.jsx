import React, { useRef, useEffect } from 'react';

const HandOverlay = ({ videoRef }) => {
  const canvasRef = useRef(null);

  // Optional: You can draw hand landmarks here if desired
  return (
    <div className="camera-feed">
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} />
    </div>
  );
};

export default HandOverlay;