"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardKPIs() {
  try {
    const totalPacientes = await prisma.paciente.count();

    const citasAgrupadas = await prisma.cita.groupBy({
      by: ['estado'],
      _count: { _all: true }
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

    return { totalPacientes, totalCitas, eficiencia };
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    return { totalPacientes: 0, totalCitas: 0, eficiencia: 0 };
  }
}

export async function getBoxOccupancy() {
  try {
    const now = new Date();
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    const endOfHour = new Date(startOfHour.getTime() + 60 * 60 * 1000);

    const boxes = await prisma.box.findMany({
      include: {
        citas: {
          where: {
            fechaHoraInicio: { gte: startOfHour, lt: endOfHour },
            estado: { in: ['PROGRAMADA', 'COMPLETADA'] }
          }
        }
      }
    });

    const mappedBoxes = boxes.map(box => {
      const isOcupado = box.citas.length > 0 || box.estado === 'OCUPADO';
      return {
        id: box.id,
        nombre: box.nombre,
        tipo: box.tipo,
        estadoReal: isOcupado ? 'OCUPADO' : box.estado,
        citasActuales: box.citas.length
      };
    });

    return { data: mappedBoxes };
  } catch (error) {
    console.error("Error fetching box occupancy:", error);
    return { data: [] };
  }
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#6b7280'];

function getMonthRange(monthsBack: number) {
  const start = new Date();
  start.setMonth(start.getMonth() - monthsBack);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export async function getExecutiveKPIs() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const ingresoMensual = await prisma.factura.aggregate({
      _sum: { montoTotal: true },
      where: {
        estadoPago: 'PAGADO',
        fechaEmision: { gte: monthStart }
      }
    });

    const pacientesUnicos = await prisma.paciente.count();

    const citasMes = await prisma.cita.findMany({
      where: { fechaHoraInicio: { gte: monthStart } },
      select: { estado: true }
    });

    const totalCitasMes = citasMes.length;
    const canceladas = citasMes.filter(c => c.estado === 'CANCELADA').length;
    const cancelacionesRate = totalCitasMes > 0 ? ((canceladas / totalCitasMes) * 100).toFixed(1) : '0.0';

    const pacientesConCitas = await prisma.paciente.count({
      where: { citas: { some: {} } }
    });

    return {
      ingresoMensual: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(ingresoMensual._sum.montoTotal) || 0),
      pacientesUnicos,
      cancelacionesRate: `${cancelacionesRate}%`,
      retencionRate: pacientesConCitas > 0 ? `${((pacientesUnicos / pacientesConCitas) * 100).toFixed(1)}%` : '0.0%'
    };
  } catch (error) {
    console.error("Error fetching executive KPIs:", error);
    return {
      ingresoMensual: '$0',
      pacientesUnicos: 0,
      cancelacionesRate: '0%',
      retencionRate: '0%'
    };
  }
}

export async function getRevenueEvolution() {
  try {
    const sixMonthsAgo = getMonthRange(5);

    const facturas = await prisma.factura.findMany({
      where: { estadoPago: 'PAGADO', fechaEmision: { gte: sixMonthsAgo } },
      select: { montoTotal: true, fechaEmision: true },
      orderBy: { fechaEmision: 'asc' }
    });

    const monthlyData: Record<string, number> = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      monthlyData[MONTHS_SHORT[d.getMonth()]] = 0;
    }

    for (const f of facturas) {
      monthlyData[MONTHS_SHORT[f.fechaEmision.getMonth()]] =
        (monthlyData[MONTHS_SHORT[f.fechaEmision.getMonth()]] || 0) + Number(f.montoTotal);
    }

    return Object.entries(monthlyData).map(([mes, monto]) => ({ mes, monto }));
  } catch (error) {
    console.error("Error fetching revenue evolution:", error);
    return [];
  }
}

export async function getSpecialtyProfitability() {
  try {
    const facturas = await prisma.factura.findMany({
      where: { estadoPago: 'PAGADO' },
      include: {
        cita: {
          include: {
            box: { include: { especialidad: true } }
          }
        }
      }
    });

    const espMap: Record<string, number> = {};
    for (const f of facturas) {
      const esp = f.cita.box.especialidad.nombre;
      espMap[esp] = (espMap[esp] || 0) + Number(f.montoTotal);
    }

    return Object.entries(espMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([especialidad, ingresos], i) => ({
        especialidad,
        ingresos,
        color: COLORS[i % COLORS.length]
      }));
  } catch (error) {
    console.error("Error fetching specialty profitability:", error);
    return [];
  }
}

export async function getMedicoEfficiency() {
  try {
    const medicos = await prisma.medico.findMany({
      include: {
        user: { select: { nombre: true } },
        especialidad: { select: { nombre: true } },
        citas: {
          where: { estado: 'COMPLETADA' },
          select: { fechaHoraInicio: true, fechaHoraFin: true }
        }
      }
    });

    return medicos.map(m => {
      const pacientesAtendidos = m.citas.length;
      let tiempoPromedio = 0;

      if (pacientesAtendidos > 0) {
        const totalMin = m.citas.reduce((sum, c) => {
          const diff = c.fechaHoraFin.getTime() - c.fechaHoraInicio.getTime();
          return sum + diff / (1000 * 60);
        }, 0);
        tiempoPromedio = Math.round(totalMin / pacientesAtendidos);
      }

      return {
        nombre: m.user.nombre,
        especialidad: m.especialidad.nombre,
        tiempoPromedio,
        pacientesAtendidos,
      };
    }).sort((a, b) => b.pacientesAtendidos - a.pacientesAtendidos);
  } catch (error) {
    console.error("Error fetching medico efficiency:", error);
    return [];
  }
}

export async function getPatientGrowth() {
  try {
    const sixMonthsAgo = getMonthRange(5);

    const pacientes = await prisma.paciente.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const monthlyCount: Record<string, number> = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      monthlyCount[MONTHS_SHORT[d.getMonth()]] = 0;
    }

    for (const p of pacientes) {
      monthlyCount[MONTHS_SHORT[p.createdAt.getMonth()]] =
        (monthlyCount[MONTHS_SHORT[p.createdAt.getMonth()]] || 0) + 1;
    }

    return Object.entries(monthlyCount).map(([mes, pacientes]) => ({ mes, pacientes }));
  } catch (error) {
    console.error("Error fetching patient growth:", error);
    return [];
  }
}

export async function getSpecialtyDistribution() {
  try {
    const citas = await prisma.cita.findMany({
      include: {
        box: { include: { especialidad: true } }
      }
    });

    const espCount: Record<string, number> = {};
    for (const c of citas) {
      const esp = c.box.especialidad.nombre;
      espCount[esp] = (espCount[esp] || 0) + 1;
    }

    return Object.entries(espCount)
      .sort(([, a], [, b]) => b - a)
      .map(([nombre, cantidad], i) => ({
        nombre,
        cantidad,
        color: COLORS[i % COLORS.length]
      }));
  } catch (error) {
    console.error("Error fetching specialty distribution:", error);
    return [];
  }
}
