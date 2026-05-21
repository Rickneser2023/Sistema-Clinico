"use client";

import React, { useState } from 'react';
import Card from '@/components/Card';
import { mockMedicos, mockConsultorios } from '@/lib/mockData';

export default function MedicosPage() {
  const medicos = mockMedicos;
  const consultorios = mockConsultorios;
  const [filtroTurno, setFiltroTurno] = useState<'Todos' | 'Mañana' | 'Tarde'>('Todos');

  const medicosFiltrados = filtroTurno === 'Todos'
    ? medicos
    : medicos.filter(m => m.turno === filtroTurno);

  const handleEditar = (nombre: string) => {
    alert(`Editar datos de: ${nombre}\n(Funcionalidad en desarrollo)`);
  };

  const handleToggleEstado = (nombre: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    alert(`${nombre} cambiado a: ${nuevoEstado}\n(Solo demostración)`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Resumen rápido */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Médicos Activos', valor: medicos.filter(m => m.estado === 'Activo').length, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Médicos Inactivos', valor: medicos.filter(m => m.estado === 'Inactivo').length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Boxes Libres', valor: consultorios.filter(c => c.estado === 'Libre').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Boxes Ocupados', valor: consultorios.filter(c => c.estado === 'Ocupado').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(item => (
          <div key={item.label} className="card" style={{ flex: 1, minWidth: '160px', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.valor}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary-light)', textAlign: 'center' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Layout: tabla + panel de boxes */}
      <div className="staff-container">

        {/* Tabla de Médicos */}
        <Card title="Personal Médico" subtitle="Turnos activos y estado del equipo clínico">
          {/* Filtro de turno */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {(['Todos', 'Mañana', 'Tarde'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFiltroTurno(t)}
                className={filtroTurno === t ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="table-responsive">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Consultorio</th>
                  <th>Turno</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicosFiltrados.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 700 }}>{m.nombre}</td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>{m.especialidad}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{m.consultorio}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          backgroundColor: m.turno === 'Mañana' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)',
                          color: m.turno === 'Mañana' ? '#b45309' : '#4f46e5',
                        }}
                      >
                        {m.turno === 'Mañana' ? '🌅 Mañana' : '🌙 Tarde'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${m.estado === 'Activo' ? 'badge-estable' : 'badge-critico'}`}>
                        {m.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                          onClick={() => handleEditar(m.nombre)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.25rem 0.55rem',
                            color: m.estado === 'Activo' ? 'var(--color-critico)' : 'var(--color-estable)',
                            borderColor: m.estado === 'Activo' ? 'var(--color-critico)' : 'var(--color-estable)',
                          }}
                          onClick={() => handleToggleEstado(m.nombre, m.estado)}
                        >
                          {m.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Panel de Consultorios */}
        <div>
          <Card title="Estado de Consultorios" subtitle="Mapa de ocupación en tiempo real">
            <div className="office-grid">
              {consultorios.map(c => (
                <div
                  key={c.id}
                  className={`office-card ${c.estado === 'Libre' ? 'libre' : 'ocupado'}`}
                >
                  <div className="office-info">
                    <span className="office-name">{c.nombre}</span>
                    {c.medicoActual ? (
                      <span className="office-doctor">👨‍⚕️ {c.medicoActual}</span>
                    ) : (
                      <span className="office-doctor" style={{ color: 'var(--color-estable)' }}>Disponible para asignar</span>
                    )}
                  </div>
                  <span className={`badge ${c.estado === 'Libre' ? 'badge-estable' : 'badge-observacion'}`}>
                    {c.estado}
                  </span>
                </div>
              ))}
            </div>

            {/* Leyenda gráfica */}
            <div style={{ marginTop: '1.5rem', padding: '0.875rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>Resumen de Ocupación</div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(consultorios.filter(c => c.estado === 'Ocupado').length / consultorios.length) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: '999px',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--secondary-light)', marginTop: '0.35rem', fontWeight: 600 }}>
                <span>{consultorios.filter(c => c.estado === 'Ocupado').length} ocupados</span>
                <span>{consultorios.filter(c => c.estado === 'Libre').length} libres</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
