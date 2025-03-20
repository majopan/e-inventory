    import React from 'react';
    import '../styles/MachineStats.css'; // Asegúrate de crear este archivo CSS

    const MachineStats = () => {
    return (
        <div className="stat-card">
        <div className="stat-item">
            <h5>Total Machines</h5>
            <h1>267</h1>
        </div>
        <div className="stat-item">
            <h5>Production Costs</h5>
            <h1>1,137,061</h1>
        </div>
        <div className="stat-item">
            <h5>Waste Produced</h5>
            <h1>789.03</h1>
        </div>
        </div>
    );
    };

    export default MachineStats;