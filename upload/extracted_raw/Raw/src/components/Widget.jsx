import React from 'react';

const Widget = ({ widget }) => {
  return (
    <div className="widget">
      <div className="widget-header">
        <span>{widget.title}</span>
        <span style={{ color: '#ff00ff' }}>●</span>
      </div>
      <div className="widget-content">
        {widget.type === 'chart' && <div>📈 Chart Data Visualization</div>}
        {widget.type === 'stat' && <div>📊 1,024 Active Users</div>}
      </div>
    </div>
  );
};

export default Widget;