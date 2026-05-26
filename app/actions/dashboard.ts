"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardKPIs() {
  try {
    const totalPacientes = await prisma.paciente.count();
    
    // Contar citas por estado
    const citasAgrupadas = await prisma.cita.groupBy({
      by: ['estado'],
      _count: {
        _all: true
      }
    });

    let totalCitas = 0;
    let citasCompletadas = 0;

    citasAgrupadas.forEach(group => {
      totalCitas += group._count._all;
      if (group.estado === 'COMPLETADA') {
        citasCompletadas += group._count._all;
      }
    });

    const eficiencia = totalCitas > 0 ? Math.round((citasCompletadas / totalCitas) * 100) : 0;

    return {
      totalPacientes,
      totalCitas,
      eficiencia
    };
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    return {
      totalPacientes: 0,
      totalCitas: 0,
      eficiencia: 0
    };
  }
}

export async function getBoxOccupancy() {
  try {
    // Para simplificar: Traer todos los boxes y ver cuáles tienen citas en la hora actual
    // En un sistema real usaríamos la fecha y hora exacta
    const now = new Date();
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    const endOfHour = new Date(startOfHour.getTime() + 60 * 60 * 1000);

    const boxes = await prisma.box.findMany({
      include: {
        citas: {
          where: {
            fechaHora: {
              gte: startOfHour,
              lt: endOfHour
            },
            estado: {
              in: ['PROGRAMADA', 'COMPLETADA']
            }
          }
        }
      }
    });

    const mappedBoxes = boxes.map(box => {
      // Si tiene una cita en esta hora o si manualmente su estado es ocupado
      const isOcupado = box.citas.length > 0 || box.estado === 'OCUPADO';
      return {
        id: box.id,
        nombre: box.nombre,
        tipo: box.tipo,
        estadoReal: isOcupado ? 'OCUPADO' : box.estado, // puede estar en MANTENIMIENTO
        citasActuales: box.citas.length
      };
    });

    return { data: mappedBoxes };
  } catch (error) {
    console.error("Error fetching box occupancy:", error);
    return { data: [] };
  }
}
