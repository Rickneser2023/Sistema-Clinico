"use server";

import { prisma } from "@/lib/prisma";

export interface CitaProxima {
  id: string;
  pacienteNombre: string;
  pacienteApellido: string;
  pacienteId: string;
  medicoNombre: string;
  boxNombre: string;
  horaInicio: Date;
  horaFin: Date;
  motivo: string;
  estado: string;
}

export async function getProximasCitas(): Promise<CitaProxima[]> {
  try {
    const now = new Date();
    const treintaMin = new Date(now.getTime() + 30 * 60 * 1000);

    const citas = await prisma.cita.findMany({
      where: {
        fechaHoraInicio: { gte: now, lte: treintaMin },
        estado: { in: ['PROGRAMADA', 'EN_CURSO'] }
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true } },
        medico: { select: { user: { select: { nombre: true } } } },
        box: { select: { nombre: true } }
      },
      orderBy: { fechaHoraInicio: 'asc' }
    });

    return citas.map(c => ({
      id: c.id,
      pacienteNombre: c.paciente.nombre,
      pacienteApellido: c.paciente.apellido,
      pacienteId: c.paciente.id,
      medicoNombre: c.medico.user.nombre,
      boxNombre: c.box.nombre,
      horaInicio: c.fechaHoraInicio,
      horaFin: c.fechaHoraFin,
      motivo: c.motivo,
      estado: c.estado
    }));
  } catch (error) {
    console.error("Error fetching proximas citas:", error);
    return [];
  }
}

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
