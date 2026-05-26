"use client";

import React, { useState } from 'react';
import Card from '@/components/Card';

type TabType = 'consultas' | 'citas';

export default function PatientTabsClient({ historias, citas, patientName }: { historias: any[], citas: any[], patientName: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('consultas');

  const handleEvolucion = () => {
    const resumen = historias.length > 0
      ? `Última consulta: ${new Date(historias[0].fecha).toLocaleDateString()}\nDiagnóstico: ${historias[0].diagnostico}`
      : 'Sin consultas previas registradas.';
    alert(`📋 Resumen de Evolución Clínica\nPaciente: ${patientName}\n\n${resumen}\n\n(Funcionalidad completa en desarrollo)`);
  };

  return (
    <Card title="Historial Clínico" subtitle="Registro histórico de atenciones">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-outline btn-sm" onClick={handleEvolucion}>
            Ver Evolución Rápida
        </button>
      </div>
      <div className="tab-container">
        {/* Cabecera de pestañas */}
        <div className="tab-headers">
          <button
            className={`tab-header ${activeTab === 'consultas' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultas')}
          >
            Consultas previas ({historias.length})
          </button>
          <button
            className={`tab-header ${activeTab === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveTab('citas')}
          >
            Citas Agendadas ({citas.length})
          </button>
        </div>

        {/* Pestaña: Consultas Previas (timeline) */}
        {activeTab === 'consultas' && (
          historias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--secondary-light)' }}>
              No hay registros clínicos aún.
            </div>
          ) : (
            <div className="timeline">
              {historias.map((entrada: any) => (
                <div key={entrada.id} className="timeline-item">
                  <div className="timeline-badge"></div>
                  <div className="timeline-header">
                    <span className="timeline-date">
                      {entrada.fecha}
                    </span>
                    <span className="timeline-doctor">
                      Atendido por: {entrada.medico?.user?.nombre || "Médico Desconocido"}
                    </span>
                  </div>
                  <div className="timeline-body">
                    {(entrada.presion || entrada.pulso || entrada.temperatura || entrada.peso) && (
                      <div className="vitals-grid">
                        {entrada.presion && <div className="vital-tag"><span className="vital-icon">PA</span><span>{entrada.presion}</span></div>}
                        {entrada.pulso && <div className="vital-tag"><span className="vital-icon">FC</span><span>{entrada.pulso.toString()} lpm</span></div>}
                        {entrada.temperatura && <div className="vital-tag"><span className="vital-icon">T°</span><span>{entrada.temperatura.toString()} °C</span></div>}
                        {entrada.peso && <div className="vital-tag"><span className="vital-icon">Peso</span><span>{entrada.peso.toString()} kg</span></div>}
                      </div>
                    )}
                    <div className="timeline-block">
                      <span className="timeline-block-title">Motivo</span>
                      <p className="timeline-block-text" style={{ fontWeight: 600 }}>{entrada.motivo}</p>
                    </div>
                    <div className="timeline-block">
                      <span className="timeline-block-title">Síntomas</span>
                      <p className="timeline-block-text" style={{ fontSize: '0.85rem' }}>{entrada.sintomas}</p>
                    </div>
                    {entrada.diagnostico && (
                      <div className="timeline-block">
                        <span className="timeline-block-title" style={{ color: 'var(--primary-color)' }}>Diagnóstico</span>
                        <p className="timeline-block-text">{entrada.diagnostico}</p>
                      </div>
                    )}
                    {entrada.planTratamiento && (
                      <div className="timeline-block">
                        <span className="timeline-block-title" style={{ color: 'var(--accent-color)' }}>Tratamiento</span>
                        <p className="timeline-block-text" style={{ fontSize: '0.85rem', backgroundColor: 'white', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-color)', whiteSpace: 'pre-line' }}>
                          {entrada.planTratamiento}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Pestaña: Citas */}
        {activeTab === 'citas' && (
          citas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--secondary-light)' }}>
              No hay citas programadas.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita: any) => (
                    <tr key={cita.id}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {cita.fechaHora}
                      </td>
                      <td style={{ fontWeight: 700 }}>{cita.motivo}</td>
                      <td>
                        <span className={`badge ${cita.estado === 'COMPLETADA' ? 'badge-estable' : cita.estado === 'PROGRAMADA' ? 'badge-observacion' : 'badge-critico'}`}>
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </Card>
  );
}
