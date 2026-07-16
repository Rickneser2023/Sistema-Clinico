import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import HistoriaForm from './HistoriaForm';

export const dynamic = 'force-dynamic';

export default async function NewHistoryPage() {
  const pacientes = await prisma.paciente.findMany({
    orderBy: { nombre: 'asc' },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      fechaNacimiento: true,
      genero: true,
      tipoSangre: true,
      alergias: true,
      antecedentes: true,
      contacto: true,
    }
  });

  const doctores = await prisma.medico.findMany({
    where: { estado: 'ACTIVO' },
    include: {
      user: true,
      especialidad: true,
      especialidadesMedico: {
        include: { especialidad: true }
      }
    },
    orderBy: { user: { nombre: 'asc' } }
  });

  const doctoresMapped = doctores.map(doc => ({
    id: doc.id,
    nombre: doc.user.nombre,
    especialidadPrincipal: doc.especialidad.nombre,
    especialidades: [
      doc.especialidad.nombre,
      ...doc.especialidadesMedico.map(em => em.especialidad.nombre)
    ],
    precioBase: Number(doc.especialidad.precioBase)
  }));

  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--secondary-light)' }}>Cargando datos...</p>
      </div>
    }>
      <HistoriaForm pacientes={pacientes} doctores={doctoresMapped} />
    </Suspense>
  );
}
