"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import { mockPacientes } from '@/lib/mockData';

type TabType = 'consultas' | 'examenes' | 'recetas';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('consultas');

  const patient = mockPacientes.find(p => p.id.toString() === patientId);

  if (!patient) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--color-critico)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary-color)' }}>Paciente No Encontrado</h3>
          <p style={{ color: 'var(--secondary-light)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            El ID #{patientId} no existe en el sistema.
          </p>
          <Link href="/pacientes" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
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

  const handleEvolucion = () => {
    const resumen = patient.historiasClinicas.length > 0
      ? `Última consulta: ${patient.historiasClinicas[0].fecha}\nDiagnóstico: ${patient.historiasClinicas[0].diagnostico}`
      : 'Sin consultas previas registradas.';
    alert(`📋 Resumen de Evolución Clínica\nPaciente: ${patient.nombre}\n\n${resumen}\n\n(Funcionalidad completa en desarrollo)`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Barra de navegación y acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link href="/pacientes" className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver a Pacientes
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleEvolucion}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Ver Evolución
          </button>
          <Link href={`/nueva-historia?patientId=${patient.id}`} className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva Consulta
          </Link>
        </div>
      </div>

      {/* Alertas de Salud */}
      {(patient.alergias !== 'Ninguna conocida' || patient.diabetes || patient.hipertension) && (
        <div className="health-alerts-panel">
          {patient.alergias !== 'Ninguna conocida' && (
            <div className="health-alert health-alert-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              ⚠️ ALERGIAS: {patient.alergias}
            </div>
          )}
          {patient.diabetes && (
            <div className="health-alert health-alert-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              🩸 Diabetes Mellitus — Control glucémico activo
            </div>
          )}
          {patient.hipertension && (
            <div className="health-alert health-alert-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ❤️ Hipertensión Arterial — Monitorear presión
            </div>
          )}
        </div>
      )}

      {/* Ficha del Paciente */}
      <Card title="Ficha del Paciente" subtitle={`ID Registro: #${patient.id.toString().padStart(4, '0')}`}>
        <div className="patient-profile-card">
          <div className="patient-avatar-box">
            <div className="patient-large-avatar">{patient.nombre.charAt(0)}</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.25rem 0' }}>{patient.nombre}</h2>
            <span className={getStatusBadgeClass(patient.estado)} style={{ marginTop: '0.25rem' }}>
              {patient.estado}
            </span>
          </div>
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
              <span className="detail-label">Antecedentes Médicos Relevantes</span>
              <span className="detail-value" style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                {patient.antecedentes}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Módulo con pestañas: Consultas / Exámenes / Recetas */}
      <Card title="Historia Clínica" subtitle="Consultas anteriores, exámenes y recetas médicas">
        <div className="tab-container">
          {/* Cabecera de pestañas */}
          <div className="tab-headers">
            <button
              className={`tab-header ${activeTab === 'consultas' ? 'active' : ''}`}
              onClick={() => setActiveTab('consultas')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '5px' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Consultas previas ({patient.historiasClinicas.length})
            </button>
            <button
              className={`tab-header ${activeTab === 'examenes' ? 'active' : ''}`}
              onClick={() => setActiveTab('examenes')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '5px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Exámenes ({patient.examenes.length})
            </button>
            <button
              className={`tab-header ${activeTab === 'recetas' ? 'active' : ''}`}
              onClick={() => setActiveTab('recetas')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '5px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Recetas ({patient.recetas.length})
            </button>
          </div>

          {/* Pestaña: Consultas Previas (timeline) */}
          {activeTab === 'consultas' && (
            patient.historiasClinicas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--secondary-light)' }}>
                No hay registros clínicos aún.
              </div>
            ) : (
              <div className="timeline">
                {patient.historiasClinicas.map(entrada => (
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
                      {(entrada.presionArt || entrada.pulso || entrada.temperatura || entrada.peso) && (
                        <div className="vitals-grid">
                          {entrada.presionArt && <div className="vital-tag"><span className="vital-icon">PA</span><span>{entrada.presionArt}</span></div>}
                          {entrada.pulso && <div className="vital-tag"><span className="vital-icon">FC</span><span>{entrada.pulso} lpm</span></div>}
                          {entrada.temperatura && <div className="vital-tag"><span className="vital-icon">T°</span><span>{entrada.temperatura} °C</span></div>}
                          {entrada.peso && <div className="vital-tag"><span className="vital-icon">Peso</span><span>{entrada.peso} kg</span></div>}
                        </div>
                      )}
                      <div className="timeline-block">
                        <span className="timeline-block-title">Motivo</span>
                        <p className="timeline-block-text" style={{ fontWeight: 600 }}>{entrada.motivo}</p>
                      </div>
                      <div className="timeline-block">
                        <span className="timeline-block-title">Síntomas / Anamnesis</span>
                        <p className="timeline-block-text" style={{ fontSize: '0.85rem' }}>{entrada.sintomas}</p>
                      </div>
                      <div className="timeline-block">
                        <span className="timeline-block-title" style={{ color: 'var(--primary-color)' }}>Diagnóstico</span>
                        <p className="timeline-block-text">{entrada.diagnostico}</p>
                      </div>
                      <div className="timeline-block">
                        <span className="timeline-block-title" style={{ color: 'var(--accent-color)' }}>Tratamiento</span>
                        <p className="timeline-block-text" style={{ fontSize: '0.85rem', backgroundColor: 'white', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-color)', whiteSpace: 'pre-line' }}>
                          {entrada.tratamiento}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Pestaña: Exámenes */}
          {activeTab === 'examenes' && (
            patient.examenes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--secondary-light)' }}>
                No hay exámenes registrados.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo de Examen</th>
                      <th>Resultado</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.examenes.map((ex, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{ex.fecha}</td>
                        <td style={{ fontWeight: 700 }}>{ex.tipo}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--secondary-light)', maxWidth: '320px' }}>{ex.resultado}</td>
                        <td>
                          <span className={`badge ${ex.estado === 'Normal' ? 'badge-estable' : 'badge-critico'}`}>
                            {ex.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Pestaña: Recetas */}
          {activeTab === 'recetas' && (
            patient.recetas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--secondary-light)' }}>
                No hay recetas activas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patient.recetas.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      borderLeft: '4px solid var(--accent-color)',
                      backgroundColor: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--secondary-color)', fontSize: '0.95rem' }}>
                      💊 {rec.medicamento}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary-light)' }}>
                      <strong>Posología:</strong> {rec.dosis}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary-light)' }}>
                      <strong>Duración:</strong> {rec.duracion}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
