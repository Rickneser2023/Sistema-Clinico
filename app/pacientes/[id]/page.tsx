import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Card from '@/components/Card';
import { prisma } from '@/lib/prisma';
import PatientTabsClient from './PatientTabsClient';

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const patient = await prisma.paciente.findUnique({
    where: { id },
    include: {
      historiasClinicas: {
        orderBy: { fecha: 'desc' },
        include: {
          medico: {
            include: { user: true }
          }
        }
      },
      citas: {
        orderBy: { fechaHora: 'desc' },
      }
    }
  });

  if (!patient) {
    notFound();
  }

  // Calculate age
  const calculateAge = (birthDate: Date) => {
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const edad = calculateAge(patient.fechaNacimiento);

  // Determine health alerts based on antecedents / allergies
  const hasAlergias = patient.alergias && patient.alergias.toLowerCase() !== 'ninguna' && patient.alergias.trim() !== '';
  const antecedentesLower = (patient.antecedentes || '').toLowerCase();
  const isDiabetic = antecedentesLower.includes('diabet');
  const isHipertenso = antecedentesLower.includes('hiperten');

  const getStatusBadgeClass = (status: string | null) => {
    const s = (status || '').toLowerCase();
    if (s.includes('estable')) return 'badge badge-estable';
    if (s.includes('observación') || s.includes('observacion')) return 'badge badge-observacion';
    if (s.includes('crítico') || s.includes('critico')) return 'badge badge-critico';
    return 'badge';
  };

  // Serializar campos complejos (Decimal y Date) para componentes cliente
  const historiasClinicasSerializadas = patient.historiasClinicas.map(h => ({
    ...h,
    fecha: h.fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
    pulso: h.pulso ? Number(h.pulso) : null,
    temperatura: h.temperatura ? Number(h.temperatura) : null,
    peso: h.peso ? Number(h.peso) : null,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
  }));

  const citasSerializadas = patient.citas.map(c => ({
    ...c,
    fechaHora: c.fechaHora.toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Barra de navegación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link href="/pacientes" className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver a Pacientes
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/nueva-historia?patientId=${patient.id}`} className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva Consulta
          </Link>
        </div>
      </div>

      {/* Alertas de Salud */}
      {(hasAlergias || isDiabetic || isHipertenso) && (
        <div className="health-alerts-panel">
          {hasAlergias && (
            <div className="health-alert health-alert-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              ⚠️ ALERGIAS: {patient.alergias}
            </div>
          )}
          {isDiabetic && (
            <div className="health-alert health-alert-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              🩸 Diabetes detectada en antecedentes — Precaución
            </div>
          )}
          {isHipertenso && (
            <div className="health-alert health-alert-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ❤️ Hipertensión detectada en antecedentes — Monitorear presión
            </div>
          )}
        </div>
      )}

      {/* Ficha del Paciente */}
      <Card title="Ficha del Paciente" subtitle={`ID Registro: #${patient.id.substring(0, 8)}`}>
        <div className="patient-profile-card">
          <div className="patient-avatar-box">
            <div className="patient-large-avatar">{patient.nombre.charAt(0)}</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.25rem 0' }}>{patient.nombre} {patient.apellido}</h2>
            <span className={getStatusBadgeClass(patient.estadoClinico)} style={{ marginTop: '0.25rem' }}>
              {patient.estadoClinico || 'No Evaluado'}
            </span>
          </div>
          <div className="patient-details-grid">
            <div className="patient-detail-item">
              <span className="detail-label">Edad y Género</span>
              <span className="detail-value">{edad} años, {patient.genero}</span>
            </div>
            <div className="patient-detail-item">
              <span className="detail-label">Grupo Sanguíneo</span>
              <span className="detail-value" style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                {patient.tipoSangre || 'Sin clasificar'}
              </span>
            </div>
            <div className="patient-detail-item">
              <span className="detail-label">Teléfono / Contacto</span>
              <span className="detail-value">{patient.contacto || 'No registrado'}</span>
            </div>
            <div className="patient-detail-item" style={{ gridColumn: 'span 2' }}>
              <span className="detail-label">Antecedentes Médicos Relevantes</span>
              <span className="detail-value" style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                {patient.antecedentes || 'Sin antecedentes reportados'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Renderizado de Historias en Pestañas */}
      <PatientTabsClient historias={historiasClinicasSerializadas} citas={citasSerializadas} patientName={`${patient.nombre} ${patient.apellido}`} />
    </div>
  );
}
