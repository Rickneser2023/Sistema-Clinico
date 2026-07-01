import React from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { PatientGrowthChart, SpecialtyDistributionChart } from '@/components/ClinicalCharts';
import { getDashboardKPIs, getBoxOccupancy, getPatientGrowth, getSpecialtyDistribution } from '@/app/actions/dashboard';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const [stats, boxData, patientGrowth, specialtyDist] = await Promise.all([
    getDashboardKPIs(),
    getBoxOccupancy(),
    getPatientGrowth(),
    getSpecialtyDistribution()
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const citas = await prisma.cita.findMany({
    where: {
      fechaHoraInicio: { gte: startOfDay, lt: endOfDay }
    },
    include: {
      paciente: true,
      medico: { include: { user: true } },
      box: true
    },
    orderBy: { fechaHoraInicio: 'asc' }
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETADA': return 'badge badge-completada';
      case 'EN_CURSO': return 'badge badge-en-curso';
      case 'PROGRAMADA': return 'badge badge-pendiente';
      case 'CANCELADA': return 'badge badge-critico';
      default: return 'badge';
    }
  };

  const formatHora = (date?: Date | string | null) => {
    if (!date) return "--:--";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* 1. KPIs Grid */}
      <section className="kpi-grid" aria-label="Indicadores clave de rendimiento">
        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.totalPacientes}</span>
            <span className="kpi-label">Pacientes Activos</span>
            <span className="kpi-trend up">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
              En Base de Datos
            </span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.totalCitas}</span>
            <span className="kpi-label">Citas Programadas</span>
            <span className="kpi-trend up" style={{ color: 'var(--accent-color)' }}>
              Histórico
            </span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-pendiente)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{citas.length}</span>
            <span className="kpi-label">Consultas Hoy</span>
            <span className="kpi-trend" style={{ color: 'var(--color-pendiente)', fontWeight: 600 }}>
              {citas.filter(c => c.estado === 'COMPLETADA').length} completadas
            </span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--bg-observacion)', color: 'var(--color-observacion)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.eficiencia}%</span>
            <span className="kpi-label">Eficiencia (Atención)</span>
            <span className="kpi-trend up" style={{ color: 'var(--color-observacion)' }}>
              Citas completadas vs totales
            </span>
          </div>
        </div>
      </section>

      {/* Boxes Ocupación */}
      <section>
        <Card title="Estado de Consultorios (En Tiempo Real)" subtitle="Ocupación de los boxes durante la hora actual según la agenda">
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {boxData.data.map(box => (
              <div key={box.id} style={{
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                minWidth: '150px',
                backgroundColor: box.estadoReal === 'OCUPADO' ? '#fee2e2' : box.estadoReal === 'MANTENIMIENTO' ? '#fef3c7' : '#dcfce7',
                color: box.estadoReal === 'OCUPADO' ? '#991b1b' : box.estadoReal === 'MANTENIMIENTO' ? '#b45309' : '#166534',
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{box.nombre}</h4>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{box.estadoReal}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{box.tipo}</div>
              </div>
            ))}
            {boxData.data.length === 0 && (
              <div style={{ color: 'var(--secondary-light)', fontSize: '0.9rem' }}>No hay consultorios registrados.</div>
            )}
          </div>
        </Card>
      </section>

      {/* 2. Charts Row */}
      <section className="charts-row" aria-label="Gráficos analíticos">
        <Card
          title="Nuevos Pacientes Registrados"
          subtitle="Evolución mensual durante el primer semestre del 2026"
        >
          <div style={{ marginTop: '1rem', height: '220px' }}>
            <PatientGrowthChart data={patientGrowth} />
          </div>
        </Card>

        <Card
          title="Consultas por Especialidad"
          subtitle="Distribución de la demanda médica actual"
        >
          <div style={{ marginTop: '1rem', height: '220px' }}>
            <SpecialtyDistributionChart data={specialtyDist} />
          </div>
        </Card>
      </section>

      {/* 3. Dashboard Details Grid */}
      <section className="dashboard-grid" aria-label="Detalles de agenda y acciones rápidas">
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
                  <th>Box</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatHora(cita.fechaHoraInicio)}</td>
                    <td style={{ fontWeight: 600 }}>{cita.paciente.nombre} {cita.paciente.apellido}</td>
                    <td className="text-muted">{cita.medico ? cita.medico.user.nombre : 'No asignado'}</td>
                    <td>{cita.box ? cita.box.nombre : '-'}</td>
                    <td>
                      <span className={getStatusBadgeClass(cita.estado)}>
                        {cita.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {citas.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-light)' }}>
                      No hay citas programadas para hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Acciones y Accesos Rápidos"
          subtitle="Accesos directos a los flujos principales de la clínica"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/nueva-historia" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
              Nueva Historia Clínica
            </Link>

            <Link href="/pacientes" className="btn btn-secondary" style={{ width: '100%', padding: '0.8rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Ver Listado de Pacientes
            </Link>
          </div>
        </Card>
      </section>

    </div>
  );
}
