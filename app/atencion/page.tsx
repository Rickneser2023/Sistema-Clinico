"use client";

import React, { useState } from 'react';
import { mockKanbanAtencion, KanbanPaciente } from '@/lib/mockData';

const COLUMNAS = [
  {
    id: 'ESPERA',
    label: 'En Espera',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    id: 'CONSULTA',
    label: 'En Consulta',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ),
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'ATENDIDO',
    label: 'Atendido',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    ),
    color: '#10b981',
    bg: '#f0fdf4',
    border: '#a7f3d0',
  },
  {
    id: 'FACTURADO',
    label: 'Facturado',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    color: '#8b5cf6',
    bg: '#faf5ff',
    border: '#ddd6fe',
  },
];

export default function AtencionPage() {
  const [pacientes, setPacientes] = useState<KanbanPaciente[]>(mockKanbanAtencion);

  const avanzar = (id: number) => {
    const orden: KanbanPaciente['estado'][] = ['ESPERA', 'CONSULTA', 'ATENDIDO', 'FACTURADO'];
    setPacientes(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const idx = orden.indexOf(p.estado);
        if (idx < orden.length - 1) return { ...p, estado: orden[idx + 1] };
        return p;
      })
    );
  };

  const verHistoria = (nombre: string) => {
    alert(`Ver Historia Clínica de: ${nombre}\n(Funcionalidad en desarrollo)`);
  };

  const totalEspera = pacientes.filter(p => p.estado === 'ESPERA').length;
  const totalConsulta = pacientes.filter(p => p.estado === 'CONSULTA').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Resumen de estado */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: '180px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary-color)', lineHeight: 1 }}>{totalEspera}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--secondary-light)', fontWeight: 500 }}>En Espera</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '180px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary-color)', lineHeight: 1 }}>{totalConsulta}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--secondary-light)', fontWeight: 500 }}>En Consulta</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '180px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary-color)', lineHeight: 1 }}>{pacientes.filter(p => p.estado === 'ATENDIDO').length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--secondary-light)', fontWeight: 500 }}>Atendidos Hoy</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '180px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary-color)', lineHeight: 1 }}>{pacientes.filter(p => p.estado === 'FACTURADO').length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--secondary-light)', fontWeight: 500 }}>Facturados</div>
          </div>
        </div>
      </div>

      {/* Tablero Kanban */}
      <div className="kanban-board">
        {COLUMNAS.map(col => {
          const tarjetas = pacientes.filter(p => p.estado === col.id);
          return (
            <div key={col.id} className="kanban-column" style={{ borderTop: `3px solid ${col.color}` }}>
              <div className="kanban-column-header">
                <span className="kanban-column-title" style={{ color: col.color }}>
                  {col.icon}
                  {col.label}
                </span>
                <span className="kanban-column-count" style={{ backgroundColor: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
                  {tarjetas.length}
                </span>
              </div>

              <div className="kanban-card-list">
                {tarjetas.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem 1rem',
                    color: 'var(--secondary-light)',
                    fontSize: '0.8rem',
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    Sin pacientes
                  </div>
                )}
                {tarjetas.map(p => (
                  <div key={p.id} className="kanban-card" style={{ borderLeft: `3px solid ${col.color}` }}>
                    <div className="kanban-card-patient">{p.pacienteNombre}</div>
                    <div className="kanban-card-meta">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '3px' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Llegó: {p.horaLlegada}
                      </span>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '3px' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        {p.medicoAsignado}
                      </span>
                      <span style={{ fontStyle: 'italic' }}>{p.motivo}</span>
                    </div>
                    <div className="kanban-card-actions">
                      {col.id !== 'FACTURADO' && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => avanzar(p.id)}
                        >
                          {col.id === 'ESPERA' ? 'Iniciar Consulta' : col.id === 'CONSULTA' ? 'Finalizar' : 'Facturar'}
                        </button>
                      )}
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                        onClick={() => verHistoria(p.pacienteNombre)}
                      >
                        Ver Historia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
