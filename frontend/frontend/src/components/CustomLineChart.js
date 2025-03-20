import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { x: 5, y: 50 },
  { x: 10, y: 100 },
  { x: 15, y: 150 },
  { x: 20, y: 100 },
  { x: 25, y: 50 },
];

const CustomLineChart = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: 300, 
      backgroundColor: '#353a50', // Fondo del contenedor
      borderRadius: '10px', // Bordes redondeados
      padding: '20px', // Espaciado interno
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra suave
    }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#444" // Color de la cuadrícula
          />
          <XAxis 
            dataKey="x" 
            stroke="#61dafb" // Color del eje X
            tick={{ fill: '#fff' }} // Color del texto en el eje X
          />
          <YAxis 
            stroke="#61dafb" // Color del eje Y
            tick={{ fill: '#fff' }} // Color del texto en el eje Y
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#353a50', // Fondo del tooltip
              border: '1px solid #61dafb', // Borde del tooltip
              borderRadius: '5px', // Bordes redondeados del tooltip
              color: '#fff', // Color del texto del tooltip
            }}
          />
          <Legend 
            wrapperStyle={{
              color: '#fff', // Color del texto de la leyenda
              paddingTop: '10px', // Espaciado superior de la leyenda
            }}
          />
          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="#8884d8" // Color de la línea: #8884d8
            strokeWidth={2} // Grosor de la línea
            activeDot={{ 
              r: 8, // Tamaño del punto activo
              fill: '#ffc658', // Color del punto activo: #522db2
              stroke: '#82ca9d', // Borde del punto activo: #ff8900
            }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;