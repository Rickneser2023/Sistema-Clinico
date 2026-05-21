"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import { mockPacientes } from '@/lib/mockData';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  // Buscar al paciente correspondiente en los datos ficticios
  const patient = mockPacientes.find(p => p.id.toString() === patientId);

  // Si no se encuentra el paciente
  if (!patient) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--color-critico)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary-color)' }}>Paciente No Encontrado</h3>
          <p style={{ color: 'var(--secondary-light)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            El ID de paciente #{patientId} no existe en el sistema.
          </p>
          <Link href="/pacientes" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Regresar al Listado
          </Link>
        </div>
      </Card>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Estable': return 'badge badge-estable';
      case 'En Observación': return 'badge badge-observacion';
      case 'Crítico': return 'badge badge-critico';
      default: return 'badge';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Botón Volver y Nueva Consulta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/pacientes" className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver a Pacientes
        </Link>
        
        <Link 
          href={`/nueva-historia?patientId=${patient.id}`} 
          className="btn btn-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Registrar Nueva Consulta
        </Link>
      </div>

      {/* Tarjeta de Información de Perfil del Paciente */}
      <Card title="Ficha del Paciente" subtitle={`ID Registro: #${patient.id.toString().padStart(4, '0')}`}>
        <div className="patient-profile-card">
          {/* Columna Izquierda: Avatar Grande */}
          <div className="patient-avatar-box">
            <div className="patient-large-avatar">
              {patient.nombre.charAt(0)}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.25rem 0' }}>{patient.nombre}</h2>
            <span className={getStatusBadgeClass(patient.estado)} style={{ marginTop: '0.25rem' }}>
              {patient.estado}
            </span>
          </div>

          {/* Columna Derecha: Detalles Físicos y de Contacto */}
          <div className="patient-details-grid">
            <div className="patient-detail-item">
              <span className="detail-label">Edad y Género</span>
              <span className="detail-value">{patient.edad} años, {patient.genero}</span>
            </div>

            <div className="patient-detail-item">
              <span className="detail-label">Grupo Sanguíneo</span>
              <span className="detail-value" style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                {patient.tipoSangre || 'Sin clasificar'}
              </span>
            </div>

            <div className="patient-detail-item">
              <span className="detail-label">Teléfono</span>
              <span className="detail-value">{patient.telefono}</span>
            </div>

            <div className="patient-detail-item">
              <span className="detail-label">Correo Electrónico</span>
              <span className="detail-value" style={{ fontSize: '0.85rem' }}>{patient.email}</span>
            </div>

            <div className="patient-detail-item" style={{ gridColumn: 'span 2' }}>
              <span className="detail-label">Dirección Particular</span>
              <span className="detail-value">{patient.direccion}</span>
            </div>

            <div className="patient-detail-item" style={{ gridColumn: 'span 2' }}>
              <span className="detail-label" style={{ color: 'var(--color-critico)' }}>Alergias</span>
              <span className="detail-value" style={{ color: patient.alergias !== 'Ninguna conocida' ? 'var(--color-critico)' : 'inherit', fontWeight: patient.alergias !== 'Ninguna conocida' ? 600 : 400 }}>
                {patient.alergias}
              </span>
            </div>

            <div className="patient-detail-item" style={{ gridColumn: 'span 2' }}>
              <span className="detail-label">Antecedentes Médicos Relevantes</span>
              <span className="detail-value" style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                {patient.antecedentes}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Historial Clínico (Línea de Tiempo) */}
      <Card title="Historial Clínico de Consultas" subtitle={`Historial de entradas y diagnósticos (${patient.historiasClinicas.length})`}>
        {patient.historiasClinicas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--secondary-light)' }}>
            <p>No hay registros clínicos en el historial de este paciente.</p>
          </div>
        ) : (
          <div className="timeline">
            {patient.historiasClinicas.map((entrada) => (
              <div key={entrada.id} className="timeline-item">
                <div className="timeline-badge"></div>
                
                <div className="timeline-header">
                  <span className="timeline-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {entrada.fecha}
                  </span>
                  <span className="timeline-doctor">{entrada.medico}</span>
                </div>

                <div className="timeline-body">
                  {/* Signos Vitales de esa consulta */}
                  {(entrada.presionArt || entrada.pulso || entrada.temperatura || entrada.peso) && (
                    <div className="vitals-grid">
                      {entrada.presionArt && (
                        <div className="vital-tag">
                          <span className="vital-icon">PA</span>
                          <span>{entrada.presionArt}</span>
                        </div>
                      )}
                      {entrada.pulso && (
                        <div className="vital-tag">
                          <span className="vital-icon">FC</span>
                          <span>{entrada.pulso} lpm</span>
                        </div>
                      )}
                      {entrada.temperatura && (
                        <div className="vital-tag">
                          <span className="vital-icon">T°</span>
                          <span>{entrada.temperatura} °C</span>
                        </div>
                      )}
                      {entrada.peso && (
                        <div className="vital-tag">
                          <span className="vital-icon">Peso</span>
                          <span>{entrada.peso} kg</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="timeline-block">
                    <span className="timeline-block-title">Motivo de Consulta</span>
                    <p className="timeline-block-text" style={{ fontWeight: 600 }}>{entrada.motivo}</p>
                  </div>

                  <div className="timeline-block">
                    <span className="timeline-block-title">Anamnesis y Examen Físico</span>
                    <p className="timeline-block-text" style={{ fontSize: '0.85rem' }}>{entrada.sintomas}</p>
                  </div>

                  <div className="timeline-block">
                    <span className="timeline-block-title" style={{ color: 'var(--primary-color)' }}>Diagnóstico</span>
                    <p className="timeline-block-text" style={{ fontWeight: 500 }}>{entrada.diagnostico}</p>
                  </div>

                  <div className="timeline-block">
                    <span className="timeline-block-title" style={{ color: 'var(--accent-color)' }}>Tratamiento y Receta</span>
                    <p className="timeline-block-text" style={{ 
                      fontSize: '0.85rem', 
                      backgroundColor: 'white', 
                      padding: '0.5rem 0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      borderLeft: '3px solid var(--accent-color)',
                      whiteSpace: 'pre-line' 
                    }}>
                      {entrada.tratamiento}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
