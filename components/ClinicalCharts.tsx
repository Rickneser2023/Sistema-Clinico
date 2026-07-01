"use client";

import React, { useState } from 'react';
import {
  mockEspecialidadesStats,
  mockEvolucionMensual,
  mockRentabilidadEspecialidades,
  mockIngresos6Meses,
  mockOcupacionConsultorios
} from '../lib/mockData';

// Tipos para datos de gráficos
export interface MonthlyDataPoint {
  mes: string;
  pacientes: number;
}

export interface SpecialtyDataPoint {
  nombre: string;
  cantidad: number;
  color: string;
}

export interface RevenueDataPoint {
  mes: string;
  monto: number;
}

export interface ProfitabilityDataPoint {
  especialidad: string;
  ingresos: number;
  color: string;
}

export interface OccupancyDataPoint {
  nombre: string;
  porcentaje: number;
  color: string;
}

// 1. GRAFICO DE CRECIMIENTO DE PACIENTES (LINE CHART SVG)
export function PatientGrowthChart({ data }: { data?: MonthlyDataPoint[] }) {
  const chartData = data && data.length > 0 ? data : mockEvolucionMensual;
  const maxVal = Math.max(...chartData.map(d => d.pacientes), 1);
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = chartData.map((item, index) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = height - paddingBottom - (item.pacientes / maxVal) * chartHeight;
    return { x, y, label: item.mes, value: item.pacientes };
  });

  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

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

          {[0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal].map((val, i) => {
            const y = height - paddingBottom - (val / maxVal) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
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

          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chartGradient)"
            />
          )}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary-color)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint && hoveredPoint.label === p.label ? "6" : "4.5"}
                fill="white"
                stroke="var(--primary-color)"
                strokeWidth="3"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, value: p.value, label: p.label })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
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
export function SpecialtyDistributionChart({ data }: { data?: SpecialtyDataPoint[] }) {
  const stats = data && data.length > 0 ? data : mockEspecialidadesStats;
  const maxVal = Math.max(...stats.map(s => s.cantidad));

  return (
    <div className="bar-chart-container" style={{ width: '100%', height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
      <div className="bar-chart" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px' }}>
        {stats.map((item, index) => {
          const heightPercent = `${(item.cantidad / maxVal) * 80 + 10}%`;
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
                {item.nombre.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>

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

// 3. GRAFICO DE DONUT (OCUPACIÓN DE CONSULTORIOS)
export function DonutChart({ data }: { data?: OccupancyDataPoint[] }) {
  const chartData = data && data.length > 0 ? data : mockOcupacionConsultorios;
  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const ocupadoPct = chartData.find(d => d.nombre === 'Ocupado')?.porcentaje || 0;
  const dashOcupado = (ocupadoPct / 100) * circumference;
  const dashDisponible = circumference - dashOcupado;

  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', height: '100%', minHeight: '180px' }}>
      <div style={{ position: 'relative', width: '130px', height: '130px' }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--primary-color)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashOcupado} ${dashDisponible}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.5s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredSegment('Ocupado')}
            onMouseLeave={() => setHoveredSegment(null)}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)'
        }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary-color)', display: 'block' }}>
            {ocupadoPct}%
          </span>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--secondary-light)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Ocupación
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {chartData.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              opacity: hoveredSegment && hoveredSegment !== item.nombre ? 0.4 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: item.nombre === 'Ocupado' ? 'var(--primary-color)' : '#cbd5e1'
            }} />
            <span style={{ color: 'var(--secondary-light)' }}>{item.nombre}:</span>
            <span style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{item.porcentaje}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. GRAFICO DE BARRAS HORIZONTALES (RENTABILIDAD ESPECIALIDADES)
export function HorizontalBarChart({ data }: { data?: ProfitabilityDataPoint[] }) {
  const chartData = data && data.length > 0 ? data : mockRentabilidadEspecialidades;
  const maxVal = Math.max(...chartData.map(d => d.ingresos));

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      {chartData.map((item, idx) => {
        const pctWidth = (item.ingresos / maxVal) * 100;
        return (
          <div
            key={idx}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--secondary-color)' }}>{item.especialidad}</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{formatCurrency(item.ingresos)}</span>
            </div>

            <div style={{
              width: '100%',
              height: '16px',
              backgroundColor: '#e2e8f0',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${pctWidth}%`,
                height: '100%',
                backgroundColor: item.color,
                borderRadius: '999px',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.75 : 1
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 5. EVOLUCIÓN DE INGRESOS (AREA CHART SVG)
export function RevenueExecutiveChart({ data }: { data?: RevenueDataPoint[] }) {
  const chartData = data && data.length > 0 ? data : mockIngresos6Meses;
  const maxVal = Math.max(...chartData.map(d => d.monto), 1);
  const width = 500;
  const height = 180;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = chartData.map((item, index) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = height - paddingBottom - (item.monto / maxVal) * chartHeight;
    return { x, y, label: item.mes, value: item.monto };
  });

  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  const formatYAxis = (val: number) => {
    if (val === 0) return '$0';
    return `$${(val / 1000000).toFixed(1)}M`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  };

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
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal].map((val, i) => {
            const y = height - paddingBottom - (val / maxVal) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
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
                  fontWeight="600"
                >
                  {formatYAxis(val)}
                </text>
              </g>
            );
          })}

          {areaPath && (
            <path
              d={areaPath}
              fill="url(#revenueGradient)"
            />
          )}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint && hoveredPoint.label === p.label ? "6" : "4.5"}
                fill="white"
                stroke="#10b981"
                strokeWidth="3"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, value: p.value, label: p.label })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
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
              zIndex: 20
            }}
          >
            {hoveredPoint.label}: {formatCurrency(hoveredPoint.value)}
          </div>
        )}
      </div>

      <div className="chart-legend" style={{ justifyContent: 'center' }}>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span>Evolución mensual de facturación clínica (Histórico)</span>
        </div>
      </div>
    </div>
  );
}
