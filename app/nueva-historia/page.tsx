import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import HistoriaForm from './HistoriaForm';

// Server Component asincrónico para traer pacientes y doctores
export default async function NewHistoryPage() {
  // Traer pacientes para poblar el select
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
    }
  });

  // Traer doctores
  const doctores = await prisma.user.findMany({
    where: { rol: 'DOCTOR' },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true }
  });

  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--secondary-light)' }}>Cargando datos...</p>
      </div>
    }>
      <HistoriaForm pacientes={pacientes} doctores={doctores} />
    </Suspense>
  );
}
