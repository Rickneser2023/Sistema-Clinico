"use client";

import React, { useState } from 'react';
import { mockCalendarioCitas, CeldaCalendario } from '@/lib/mockData';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function getCeldaClase(estado: CeldaCalendario['estado']) {
  if (estado === 'Disponible') return 'calendar-cell-available';
  if (estado === 'Ocupado') return 'calendar-cell-occupied';
  return 'calendar-cell-pause';
}

function getCeldaLabel(estado: CeldaCalendario['estado']) {
  if (estado === 'Disponible') return 'Libre';
  if (estado === 'Ocupado') return 'Ocupado';
  return 'Pausa';
}

export default function AgendaPage() {
  const celdas = mockCalendarioCitas;
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const getCell = (dia: string, hora: string): CeldaCalendario | undefined =>
    celdas.find(c => c.dia === dia && c.hora === hora);

  const handleCellClick = (celda: CeldaCalendario | undefined, dia: string, hora: string) => {
    if (!celda || celda.estado === 'Pausa médica') {
      alert('Este bloque corresponde a una pausa médica y no puede agendarse.');
      return;
    }
    if (celda.estado === 'Ocupado') {
      alert(`Bloque ${dia} ${hora} ya está reservado.\n${celda.info || ''}`);
      return;
    }
    alert(`¡Agendar cita aquí!\nDía: ${dia}\nHora: ${hora}`);
  };

  const totalDisponibles = celdas.filter(c => c.estado === 'Disponible').length;
  const totalOcupados = celdas.filter(c => c.estado === 'Ocupado').length;
  const totalPausas = celdas.filter(c => c.estado === 'Pausa médica').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Leyenda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Disponible', count: totalDisponibles, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { label: 'Ocupado', count: totalOcupados, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
            { label: 'Pausa', count: totalPausas, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: item.bg, border: `2px solid ${item.color}`, display: 'inline-block' }} />
              <span style={{ color: 'var(--secondary-color)' }}>{item.label} ({item.count})</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--secondary-light)', fontWeight: 500 }}>
          Haz clic en una celda disponible para agendar
        </div>
      </div>

      {/* Grid Calendario */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(5, minmax(130px, 1fr))', minWidth: '720px' }}>
            <div className="calendar-header-cell" />
            {DIAS.map(dia => <div key={dia} className="calendar-header-cell">{dia}</div>)}

            {HORAS.map(hora => (
              <React.Fragment key={hora}>
                <div className="calendar-hour-cell">{hora}</div>
                {DIAS.map(dia => {
                  const celda = getCell(dia, hora);
                  const estado = celda?.estado ?? 'Disponible';
                  return (
                    <div
                      key={`${dia}-${hora}`}
                      className={`calendar-cell ${getCeldaClase(estado)}`}
                      style={{
                        cursor: estado === 'Pausa médica' ? 'not-allowed' : 'pointer',
                        opacity: hoveredCell === `${dia}-${hora}` ? 0.85 : 1,
                      }}
                      onClick={() => handleCellClick(celda, dia, hora)}
                      onMouseEnter={() => setHoveredCell(`${dia}-${hora}`)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={celda?.info || `${estado}`}
                    >
                      <span className="calendar-cell-status">{getCeldaLabel(estado)}</span>
                      {celda?.info && estado !== 'Disponible' && (
                        <span className="calendar-cell-info">{celda.info}</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 500 }}>
        💡 Haz clic en cualquier celda verde (Libre) para agendar. Las celdas rojas ya tienen reserva activa.
      </div>
    </div>
  );
}
