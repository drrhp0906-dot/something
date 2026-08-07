import React from 'react';
import GridLayout from 'react-grid-layout';
import Widget from './Widget';

const Dashboard = ({ widgets, layout, setLayout }) => {
  return (
    <div className="dashboard-container">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={window.innerWidth}
        margin={[10, 10]}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        compactType="vertical"
      >
        {widgets.map((w) => (
          <div key={w.id}>
            <Widget widget={w} />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

export default Dashboard;