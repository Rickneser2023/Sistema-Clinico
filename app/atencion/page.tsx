import React from 'react';
import { prisma } from '@/lib/prisma';
import KanbanAtencion from './KanbanAtencion';

export const dynamic = 'force-dynamic';

export default async function AtencionPage() {
  // Configurar las fechas para HOY
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Consultar las citas del día actual
  const citas = await prisma.cita.findMany({
    where: {
      fechaHoraInicio: { gte: startOfDay },
      fechaHoraFin: { lte: endOfDay },
      estado: { not: 'CANCELADA' }
    },
    include: {
      paciente: { select: { nombre: true, apellido: true } },
      medico: { select: { user: { select: { nombre: true } } } },
    },
    orderBy: { fechaHoraInicio: 'asc' }
  });

  // Mapear los datos de prisma al formato que necesita el Kanban
  const citasKanban = citas.map(c => ({
    id: c.id,
    pacienteNombre: `${c.paciente.nombre} ${c.paciente.apellido}`,
    horaLlegada: c.fechaHoraInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    medicoAsignado: `Dr. ${c.medico.user.nombre}`,
    motivo: c.motivo,
    estado: c.estado,
    rawInicio: c.fechaHoraInicio
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="header-title-container" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h1>Sala de Espera y Atención</h1>
        <p>Gestión del flujo de pacientes para el día de hoy</p>
      </div>

      <KanbanAtencion citasIniciales={citasKanban} />
    </div>
  );
}
