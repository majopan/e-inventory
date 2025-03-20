import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Grafica.css';

const data = [
    { name: 'Quarter 1', Series1: 18, Series2: 13, Series3: 21 },
    { name: 'Quarter 2', Series1: 26, Series2: 23, Series3: 14 },
    { name: 'Quarter 3', Series1: 16, Series2: 19, Series3: 30 },
    { name: 'Quarter 4', Series1: 35, Series2: 28, Series3: 26 },
];

const BarChartComponent = () => {
    return (
        <div className="chart-wrapper">
            <div className="barchart-container">
                <h3>Quarterly Data Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Series1" fill="#8884d8" /> {/* Color: #8884d8 */}
                        <Bar dataKey="Series2" fill="#82ca9d" /> {/* Color: #82ca9d */}
                        <Bar dataKey="Series3" fill="#ffc658" /> {/* Color: #ffc658 */}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarChartComponent;