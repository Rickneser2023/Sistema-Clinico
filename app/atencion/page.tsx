import React from 'react';
import { prisma } from '@/lib/prisma';
import KanbanAtencion from './KanbanAtencion';

export const dynamic = 'force-dynamic';

// Configuración de zona horaria de la clínica (ajustar según necesidad)
// Opciones comunes: 'America/Lima' (UTC-5), 'America/Santiago' (UTC-4/UTC-3), 'America/Mexico_City' (UTC-6)
const CLINIC_TIMEZONE = 'America/Lima';

export default async function AtencionPage() {
  // Obtener el inicio y fin del día en la zona horaria configurada
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const todayStr = formatter.format(now); // "YYYY-MM-DD" en la zona horaria de la clínica

  const startOfDay = new Date(`${todayStr}T00:00:00`);
  const endOfDay = new Date(`${todayStr}T23:59:59.999`);

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
      factura: { select: { montoTotal: true, montoAdelanto: true, estadoPago: true, estadoAdelanto: true } },
    },
    orderBy: { fechaHoraInicio: 'asc' }
  });

  // Mapear los datos de prisma al formato que necesita el Kanban
  const citasKanban = citas.map(c => ({
    id: c.id,
    pacienteId: c.pacienteId,
    medicoId: c.medicoId,
    pacienteNombre: `${c.paciente.nombre} ${c.paciente.apellido}`,
    medicoAsignado: `Dr. ${c.medico.user.nombre}`,
    estado: c.estado,
    rawInicioISO: c.fechaHoraInicio.toISOString(),
    saldoPendiente: c.factura
      ? Math.max(Number(c.factura.montoTotal) - (c.factura.estadoAdelanto === 'VALIDADO' ? Number(c.factura.montoAdelanto) : 0), 0)
      : 0
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
