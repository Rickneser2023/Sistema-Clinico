"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Acción para actualizar el precio del catálogo (Administradores)
export async function updatePrecioEspecialidad(id: string, nuevoPrecio: number) {
  try {
    await prisma.especialidad.update({
      where: { id },
      data: { precioBase: nuevoPrecio },
    });
    revalidatePath("/caja");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar precio de especialidad:", error);
    return { success: false, error: "Error al actualizar precio" };
  }
}

// Acción para que el cajero registre el pago de una factura
type MetodoPagoInput = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "YAPE" | "PLIN";

export async function registrarPagoFactura(facturaId: string, metodoPago: MetodoPagoInput) {
  try {
    await prisma.$transaction(async (tx) => {
      const factura = await tx.factura.update({
        where: { id: facturaId },
        data: {
          estadoPago: 'PAGADO',
          metodoPago: metodoPago,
          fechaValidacion: new Date(),
        },
        include: { cita: { select: { estado: true } } },
      });

      if (factura.cita.estado === "PENDIENTE_PAGO") {
        await tx.cita.update({
          where: { id: factura.citaId },
          data: { estado: "COMPLETADA" },
        });
      }
    });
    revalidatePath("/facturacion");
    revalidatePath("/atencion");
    revalidatePath("/agenda");
    return { success: true };
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return { success: false, message: "Error al registrar pago de factura" };
  }
}

/** Wrapper que extrae metodo del FormData y llama a registrarPagoFactura */
export async function registrarPagoFacturaForm(formData: FormData) {
  const facturaId = formData.get("facturaId") as string;
  const metodoPago = formData.get("metodo") as MetodoPagoInput;
  if (!facturaId || !metodoPago) {
    return { success: false, message: "Faltan datos para registrar el pago" };
  }
  return registrarPagoFactura(facturaId, metodoPago);
}

export async function validarAdelanto(facturaId: string, userId?: string) {
  try {
    const validadoPorId = userId || (await prisma.user.findFirst())?.id || null;
    await prisma.factura.update({
      where: { id: facturaId },
      data: {
        estadoAdelanto: "VALIDADO",
        fechaValidacion: new Date(),
        validadoPorId,
      },
    });
    revalidatePath("/facturacion");
    revalidatePath("/agenda");
    revalidatePath("/atencion");
    return { success: true };
  } catch (error) {
    console.error("Error al validar adelanto:", error);
    return { success: false, message: "Error al validar adelanto" };
  }
}

export async function rechazarAdelanto(facturaId: string, observacion?: string) {
  try {
    await prisma.factura.update({
      where: { id: facturaId },
      data: {
        estadoAdelanto: "RECHAZADO",
        observacionPago: observacion || "Comprobante rechazado por recepción.",
      },
    });
    revalidatePath("/facturacion");
    revalidatePath("/agenda");
    revalidatePath("/atencion");
    return { success: true };
  } catch (error) {
    console.error("Error al rechazar adelanto:", error);
    return { success: false, message: "Error al rechazar adelanto" };
  }
}

export async function cobrarSaldoFactura(facturaId: string, metodoPago: MetodoPagoInput) {
  try {
    const factura = await prisma.factura.findUnique({
      where: { id: facturaId },
      include: { cita: true },
    });

    if (!factura) {
      return { success: false, message: "Factura no encontrada" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.factura.update({
        where: { id: facturaId },
        data: {
          estadoPago: "PAGADO",
          metodoPago,
        },
      });

      await tx.cita.update({
        where: { id: factura.citaId },
        data: { estado: "COMPLETADA" },
      });
    });

    revalidatePath("/facturacion");
    revalidatePath("/agenda");
    revalidatePath("/atencion");
    return { success: true };
  } catch (error) {
    console.error("Error al cobrar saldo:", error);
    return { success: false, message: "Error al cobrar saldo" };
  }
}

/** Wrapper que extrae metodo del FormData y llama a cobrarSaldoFactura */
export async function cobrarSaldoFacturaForm(formData: FormData) {
  const facturaId = formData.get("facturaId") as string;
  const metodoPago = formData.get("metodo") as MetodoPagoInput;
  if (!facturaId || !metodoPago) {
    return { success: false, message: "Faltan datos para cobrar el saldo" };
  }
  return cobrarSaldoFactura(facturaId, metodoPago);
}

// Obtener todas las facturas del día y estadísticas
export async function getFacturacionDashboardData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const facturas = await prisma.factura.findMany({
      where: {
        createdAt: {
          gte: today,
        }
      },
      include: {
        paciente: { select: { nombre: true, apellido: true } },
        cita: {
          select: {
            id: true,
            estado: true,
            fechaHoraInicio: true,
            medico: { select: { user: { select: { nombre: true } } } },
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    let ingresosHoy = 0;
    let cuentasPorCobrar = 0;
    let desglose = { consultas: 0, procedimientos: 0, laboratorio: 0 };
    let facturasPagadas = 0;

    const formattedFacturas = facturas.map(f => {
      const montoTotal = Number(f.montoTotal) || 0;
      const montoAdelanto = Number(f.montoAdelanto) || 0;
      const adelantoValidado = f.estadoAdelanto === 'VALIDADO' ? montoAdelanto : 0;
      const saldoPendiente = f.estadoPago === 'PAGADO' ? 0 : Math.max(montoTotal - adelantoValidado, 0);
      
      if (f.estadoPago === 'PAGADO') {
        ingresosHoy += montoTotal;
        facturasPagadas++;
      } else if (f.estadoPago === 'PENDIENTE') {
        ingresosHoy += adelantoValidado;
        cuentasPorCobrar += saldoPendiente;
      }

      if (f.categoria === 'Consulta') desglose.consultas += (f.estadoPago === 'PAGADO' ? montoTotal : adelantoValidado);
      else if (f.categoria === 'Procedimiento') desglose.procedimientos += (f.estadoPago === 'PAGADO' ? montoTotal : adelantoValidado);
      else desglose.laboratorio += (f.estadoPago === 'PAGADO' ? montoTotal : adelantoValidado);

      return {
        id: f.id,
        citaId: f.citaId,
        pacienteName: `${f.paciente.nombre} ${f.paciente.apellido}`,
        categoria: f.categoria,
        montoTotal,
        montoAdelanto,
        adelantoValidado,
        saldoPendiente,
        metodoPago: f.metodoPago || 'N/A',
        metodoAdelanto: f.metodoAdelanto || 'N/A',
        estadoAdelanto: f.estadoAdelanto,
        comprobanteUrl: f.comprobanteUrl,
        observacionPago: f.observacionPago,
        estado: f.estadoPago,
        citaEstado: f.cita.estado,
        citaFecha: f.cita.fechaHoraInicio,
        medicoNombre: f.cita.medico.user.nombre,
      };
    });

    const tasaPago = facturas.length > 0 ? Math.round((facturasPagadas / facturas.length) * 100) : 0;

    return {
      success: true,
      data: {
        facturas: formattedFacturas,
        stats: {
          ingresosHoy,
          cuentasPorCobrar,
          desgloseHoy: desglose,
          tasaPagoVentanilla: `${tasaPago}%`,
          totalPagadas: facturasPagadas,
          totalFacturas: facturas.length
        }
      }
    };

  } catch (error) {
    console.error("Error al obtener datos de facturación:", error);
    return { success: false, data: null, error: "No se pudieron cargar los datos" };
  }
}
