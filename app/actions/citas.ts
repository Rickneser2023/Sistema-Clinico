"use server";

import { prisma } from "@/lib/prisma";
import { CitaSchema } from "@/lib/validations/citas";

export async function createCita(formData: FormData) {
  const rawData = {
    pacienteId: formData.get("pacienteId"),
    medicoId: formData.get("medicoId"),
    boxId: formData.get("boxId"),
    motivo: formData.get("motivo"),
    fechaHora: formData.get("fechaHora") as string,
  };

  const parsed = CitaSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: "Datos inválidos", fields: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const targetDate = new Date(data.fechaHora);

  try {
    // 1. Verificación de Overbooking (Validación cruzada con la BD)
    // Buscamos si el Box ya tiene una cita en ese rango de tiempo (ej. +/- 30 mins)
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const startRange = new Date(targetDate.getTime() - thirtyMinutesInMs);
    const endRange = new Date(targetDate.getTime() + thirtyMinutesInMs);

    const conflictingCita = await prisma.cita.findFirst({
      where: {
        boxId: data.boxId,
        estado: { in: ['PROGRAMADA', 'COMPLETADA'] }, // Omitimos las canceladas
        fechaHora: {
          gte: startRange,
          lt: endRange,
        }
      }
    });

    if (conflictingCita) {
      return { 
        error: "Overbooking: Este Consultorio (Box) ya está reservado o en uso cerca de esa hora.",
        conflictingCita
      };
    }

    // 2. Insertar cita
    const newCita = await prisma.cita.create({
      data: {
        pacienteId: data.pacienteId,
        medicoId: data.medicoId,
        boxId: data.boxId,
        usuarioId: "TODO-CURRENT-USER", // TODO: Replace with auth session ID
        motivo: data.motivo,
        fechaHora: targetDate,
        estado: 'PROGRAMADA',
      }
    });

    return { success: true, data: newCita };
  } catch (error) {
    console.error("Error creating cita:", error);
    return { error: "Ocurrió un error en el servidor al agendar la cita." };
  }
}
