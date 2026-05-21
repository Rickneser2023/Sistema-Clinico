"use client";

import React, { useState } from 'react';
import { mockEspecialidadesStats, mockEvolucionMensual } from '../lib/mockData';

// 1. GRAFICO DE CRECIMIENTO DE PACIENTES (LINE CHART SVG)
export function PatientGrowthChart() {
  const data = mockEvolucionMensual;
  const maxVal = 60;
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calcular coordenadas (x, y) de los puntos
  const points = data.map((item, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = height - paddingBottom - (item.pacientes / maxVal) * chartHeight;
    return { x, y, label: item.mes, value: item.pacientes };
  });

  // Generar cadena del path de la línea
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  // Generar cadena del path del área bajo la línea
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z` 
    : "";

  // Estado para el punto seleccionado en hover
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          width="100%" 
          height="100%" 
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas de cuadrícula horizontal */}
          {[0, 20, 40, 60].map((val) => {
            const y = height - paddingBottom - (val / maxVal) * chartHeight;
            return (
              <g key={val}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  className="svg-grid-line"
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fill="var(--secondary-light)" 
                  fontSize="10"
                  fontWeight="500"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Área de Relleno Gradiente */}
          {areaPath && (
            <path 
              d={areaPath} 
              fill="url(#chartGradient)" 
              className="svg-area-path" 
            />
          )}

          {/* Línea del Gráfico */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--primary-color)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="svg-line-path"
            />
          )}

          {/* Puntos y Etiquetas */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Círculo del punto */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredPoint && hoveredPoint.label === p.label ? "6" : "4.5"} 
                fill="white" 
                stroke="var(--primary-color)" 
                strokeWidth="3" 
                className="chart-dot"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, value: p.value, label: p.label })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              
              {/* Etiqueta del Mes en el eje X */}
              <text 
                x={p.x} 
                y={height - 10} 
                textAnchor="middle" 
                fill="var(--secondary-light)" 
                fontSize="11"
                fontWeight="600"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip Dinámico */}
        {hoveredPoint && (
          <div 
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'var(--secondary-color)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 600,
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-md)',
              whiteSpace: 'nowrap',
              zIndex: 20,
              transition: 'left 0.1s ease, top 0.1s ease'
            }}
          >
            {hoveredPoint.label}: {hoveredPoint.value} pacientes
          </div>
        )}
      </div>
      <div className="chart-legend" style={{ justifyContent: 'center' }}>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--primary-color)' }}></span>
          <span>Nuevos pacientes mensuales (2026)</span>
        </div>
      </div>
    </div>
  );
}

// 2. DISTRIBUCIÓN POR ESPECIALIDAD (BAR CHART)
export function SpecialtyDistributionChart() {
  const stats = mockEspecialidadesStats;
  const maxVal = Math.max(...stats.map(s => s.cantidad));

  return (
    <div className="bar-chart-container" style={{ width: '100%', height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
      <div className="bar-chart" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px' }}>
        {stats.map((item, index) => {
          // Porcentaje de la barra respecto al máximo valor
          const heightPercent = `${(item.cantidad / maxVal) * 80 + 10}%`; // Garantizar un mínimo de altura del 10%
          
          return (
            <div key={index} className="bar-wrapper">
              <div 
                className="bar-visual" 
                style={{ 
                  height: heightPercent, 
                  backgroundColor: item.color,
                  width: '100%',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                <div className="bar-visual-tooltip">
                  {item.cantidad} pacientes
                </div>
              </div>
              <div 
                className="bar-label" 
                title={item.nombre}
                style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--secondary-light)', 
                  fontWeight: 600,
                  marginTop: '8px',
                  width: '100%',
                  textAlign: 'center',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.nombre.split(' ')[0]} {/* Mostrar solo la primera palabra para evitar solapamiento */}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Leyenda Detallada */}
      <div className="chart-legend" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '12px' }}>
        {stats.map((item, idx) => (
          <div key={idx} className="legend-item" style={{ fontSize: '0.7rem', fontWeight: 500 }}>
            <span className="legend-dot" style={{ backgroundColor: item.color, width: '7px', height: '7px' }}></span>
            <span style={{ color: 'var(--secondary-light)' }}>{item.nombre}: </span>
            <span style={{ fontWeight: 600, color: 'var(--secondary-color)', marginLeft: '2px' }}>{item.cantidad}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
