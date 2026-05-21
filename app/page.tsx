"use client";

import React from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { PatientGrowthChart, SpecialtyDistributionChart } from '@/components/ClinicalCharts';
import { mockDashboardStats, mockCitas } from '@/lib/mockData';

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const citas = mockCitas;

  const handleAction = (action: string, patientName: string) => {
    alert(`[Simulación] Acción "${action}" ejecutada para el paciente: ${patientName}. Funcionalidad en desarrollo.`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETADA': return 'badge badge-completada';
      case 'EN_CURSO': return 'badge badge-en-curso';
      case 'PENDIENTE': return 'badge badge-pendiente';
      default: return 'badge';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. KPIs Grid */}
      <section className="kpi-grid" aria-label="Indicadores clave de rendimiento">
        {/* KPI: Total Pacientes */}
        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.totalPacientes}</span>
            <span className="kpi-label">Pacientes Activos</span>
            <span className="kpi-trend up">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              +12% este mes
            </span>
          </div>
        </div>

        {/* KPI: Historias Clínicas */}
        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.totalHistoriasClinicas}</span>
            <span className="kpi-label">Historias Clínicas</span>
            <span className="kpi-trend up" style={{ color: 'var(--accent-color)' }}>
              Total acumulado
            </span>
          </div>
        </div>

        {/* KPI: Citas de Hoy */}
        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-pendiente)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.citasHoy}</span>
            <span className="kpi-label">Citas Programadas</span>
            <span className="kpi-trend" style={{ color: 'var(--color-pendiente)', fontWeight: 600 }}>
              {stats.citasCompletadasHoy} atendidas hoy
            </span>
          </div>
        </div>

        {/* KPI: Ocupación */}
        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--bg-observacion)', color: 'var(--color-observacion)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.tasaOcupacionCitas}</span>
            <span className="kpi-label">Eficiencia de Agenda</span>
            <span className="kpi-trend up" style={{ color: 'var(--color-observacion)' }}>
              Optimización óptima
            </span>
          </div>
        </div>
      </section>

      {/* 2. Charts Row */}
      <section className="charts-row" aria-label="Gráficos analíticos">
        <Card 
          title="Nuevos Pacientes Registrados" 
          subtitle="Evolución mensual durante el primer semestre del 2026"
        >
          <div style={{ marginTop: '1rem', height: '220px' }}>
            <PatientGrowthChart />
          </div>
        </Card>

        <Card 
          title="Consultas por Especialidad" 
          subtitle="Distribución de la demanda médica actual"
        >
          <div style={{ marginTop: '1rem', height: '220px' }}>
            <SpecialtyDistributionChart />
          </div>
        </Card>
      </section>

      {/* 3. Dashboard Details Grid */}
      <section className="dashboard-grid" aria-label="Detalles de agenda y acciones rápidas">
        {/* Agenda de Citas */}
        <Card 
          title="Agenda de Consultas (Hoy)" 
          subtitle="Cronograma y estados de atención para el día de hoy"
        >
          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Médico Tratante</th>
                  <th>Motivo de Consulta</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{cita.hora}</td>
                    <td style={{ fontWeight: 600 }}>{cita.pacienteNombre}</td>
                    <td className="text-muted">{cita.medico}</td>
                    <td>{cita.motivo}</td>
                    <td>
                      <span className={getStatusBadgeClass(cita.estado)}>
                        {cita.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        {cita.estado === 'PENDIENTE' && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => handleAction('Llamar a Consulta / Atender', cita.pacienteNombre)}
                          >
                            Atender
                          </button>
                        )}
                        {cita.estado === 'EN_CURSO' && (
                          <button 
                            className="btn btn-outline-primary btn-sm" 
                            onClick={() => handleAction('Finalizar Consulta', cita.pacienteNombre)}
                          >
                            Finalizar
                          </button>
                        )}
                        <Link 
                          href={`/pacientes/${cita.pacienteId}`} 
                          className="btn btn-secondary btn-sm"
                        >
                          Historial
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Acciones Rápidas */}
        <Card 
          title="Acciones y Accesos Rápidos" 
          subtitle="Accesos directos a los flujos principales de la clínica"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/nueva-historia" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Nueva Historia Clínica
            </Link>
            
            <Link href="/pacientes" className="btn btn-secondary" style={{ width: '100%', padding: '0.8rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Ver Listado de Pacientes
            </Link>

            <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>

            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary-light)', fontWeight: 700, letterSpacing: '0.05em' }}>Reportes Rápidos</h4>
            
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => alert('[Simulación] Exportando datos a PDF...')} 
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Exportar Resumen Diario (PDF)
            </button>

            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => alert('[Simulación] Generando reporte epidemiológico...')} 
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              Reporte Epidemiológico
            </button>
          </div>
        </Card>
      </section>

    </div>
  );
}
