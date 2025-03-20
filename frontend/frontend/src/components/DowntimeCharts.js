import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaShare, FaSync } from 'react-icons/fa'; // Íconos de compartir y refrescar
import '../styles/DowntimeCharts.css';

const DowntimeCharts = () => {
  // Datos para la gráfica de causas de tiempo de inactividad
  const downtimeData = [
    { name: 'Broken Machine', value: 25 },
    { name: 'Human Error', value: 8 },
    { name: 'Personal Breaks', value: 12 },
  ];

  // Colores para las secciones de la gráfica
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="downtime-charts-container">
      <h3>Downtime Causes</h3>
      <div className="charts-wrapper">
        {/* Gráfica de pastel */}
        <div className="chart-container">
  <ResponsiveContainer width="100%" height={222}> {/* Aumenta la altura aquí */}
    <PieChart>
      <Pie
        data={downtimeData}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
        label={({
          cx,
          cy,
          midAngle,
          innerRadius,
          outerRadius,
          value,
          index,
        }) => {
          const RADIAN = Math.PI / 180;
          const radius = 25 + innerRadius + (outerRadius - innerRadius);
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          return (
            <text
              x={x}
              y={y}
              fill="#fff" // Color del texto
              textAnchor={x > cx ? 'start' : 'end'}
              dominantBaseline="central"
              style={{ fontSize: '14px', fontWeight: 'bold' }} // Estilo del texto
            >
              {value}%
            </text>
          );
        }}
      >
        {downtimeData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>

        {/* Lista de causas con puntos */}
        <div className="causes-list">
          <div className="cause-item">
            <span className="dot" style={{ backgroundColor: '#8884d8' }}></span>
            <span className="cause-value">25%</span>
            <span className="cause-label">Broken Machine</span>
          </div>
          <div className="cause-item">
            <span className="dot" style={{ backgroundColor: '#82ca9d' }}></span>
            <span className="cause-value">8%</span>
            <span className="cause-label">Human Error</span>
          </div>
          <div className="cause-item">
            <span className="dot" style={{ backgroundColor: '#ffc658' }}></span>
            <span className="cause-value">12%</span>
            <span className="cause-label">Personal Breaks</span>
          </div>
        </div>

        {/* Porcentajes con íconos */}
        <div className="percentage-container">
          <div className="percentage-item">
            <FaShare className="percentage-icon" />
            <span className="percentage-value">78%</span>
          </div>
          <div className="percentage-item">
            <FaSync className="percentage-icon" />
            <span className="percentage-value">22%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DowntimeCharts;