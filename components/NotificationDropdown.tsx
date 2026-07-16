"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { getProximasCitas, CitaProxima } from '@/app/actions/notificaciones';
import Link from 'next/link';

export default function NotificationDropdown() {
  const [citas, setCitas] = useState<CitaProxima[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchCitas = useCallback(async () => {
    const data = await getProximasCitas();
    setCitas(data);
  }, []);

  useEffect(() => {
    fetchCitas();
    const interval = setInterval(fetchCitas, 60000);
    return () => clearInterval(interval);
  }, [fetchCitas]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatHora = (d: Date) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const timeRemaining = (d: Date) => {
    const diff = new Date(d).getTime() - Date.now();
    const min = Math.round(diff / 60000);
    if (min <= 0) return 'Ahora';
    return `En ${min} min`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn-icon"
        onClick={() => setOpen(!open)}
        aria-label="Ver notificaciones"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        {citas.length > 0 && (
          <span className="btn-icon-badge" style={{
            width: '18px',
            height: '18px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            lineHeight: 1
          }}>
            {citas.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '380px',
          maxHeight: '420px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--secondary-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Próximas Citas</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: citas.length > 0 ? 'var(--color-estable)' : 'var(--secondary-light)',
              backgroundColor: citas.length > 0 ? 'var(--bg-estable)' : 'var(--bg-app)',
              padding: '2px 10px',
              borderRadius: '999px'
            }}>
              {citas.length > 0 ? `${citas.length} pendiente${citas.length !== 1 ? 's' : ''}` : 'Ninguna'}
            </span>
          </div>

          {citas.length === 0 ? (
            <div style={{
              padding: '2.5rem 1.25rem',
              textAlign: 'center',
              color: 'var(--secondary-light)',
              fontSize: '0.875rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: '0.75rem' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p style={{ margin: 0 }}>No hay citas próximas en los próximos 30 minutos.</p>
            </div>
          ) : (
            <div style={{ padding: '0.5rem 0' }}>
              {citas.map(c => (
                <Link
                  key={c.id}
                  href={`/pacientes/${c.pacienteId}`}
                  style={{
                    display: 'block',
                    padding: '0.85rem 1.25rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s ease',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-slot-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setOpen(false)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.35rem'
                  }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--secondary-color)'
                    }}>
                      {c.pacienteNombre} {c.pacienteApellido}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--primary-color)',
                      whiteSpace: 'nowrap',
                      marginLeft: '0.5rem'
                    }}>
                      {timeRemaining(c.horaInicio)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--secondary-light)'
                  }}>
                    <span>{formatHora(c.horaInicio)} - {formatHora(c.horaFin)}</span>
                    <span>Dr. {c.medicoNombre}</span>
                    <span>Box {c.boxNombre}</span>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--secondary-light)',
                    marginTop: '0.25rem'
                  }}>
                    {c.estado}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
