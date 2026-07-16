"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type MetodoPagoInput = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "YAPE" | "PLIN";

export async function registrarPagoFactura(facturaId: string, metodoPago: MetodoPagoInput, comprobanteFile?: File | null) {
  try {
    let comprobanteDatos: Uint8Array<ArrayBuffer> | null = null;
    let comprobanteTipo: string | null = null;

    if (comprobanteFile && comprobanteFile.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(comprobanteFile.type)) {
        return { success: false, message: "El comprobante debe ser JPG/PNG/WebP o PDF." };
      }
      if (comprobanteFile.size > 5 * 1024 * 1024) {
        return { success: false, message: "El comprobante no debe superar los 5 MB." };
      }
      const buf = await comprobanteFile.arrayBuffer();
      comprobanteDatos = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
      comprobanteTipo = comprobanteFile.type;
    }

    await prisma.$transaction(async (tx) => {
      const factura = await tx.factura.update({
        where: { id: facturaId },
        data: {
          estadoPago: 'PAGADO',
          metodoPago: metodoPago,
          fechaValidacion: new Date(),
          ...(comprobanteDatos ? { comprobanteDatos, comprobanteTipo } : {}),
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

export async function registrarPagoFacturaForm(formData: FormData) {
  const facturaId = formData.get("facturaId") as string;
  const metodoPago = formData.get("metodo") as MetodoPagoInput;
  const comprobante = formData.get("comprobantePago");
  const comprobanteFile = comprobante instanceof File && comprobante.size > 0 ? comprobante : null;

  if (!facturaId || !metodoPago) {
    return { success: false, message: "Faltan datos para registrar el pago" };
  }
  return registrarPagoFactura(facturaId, metodoPago, comprobanteFile);
}

export async function cobrarSaldoFactura(facturaId: string, metodoPago: MetodoPagoInput, comprobanteFile?: File | null) {
  try {
    const factura = await prisma.factura.findUnique({
      where: { id: facturaId },
      include: { cita: true },
    });

    if (!factura) {
      return { success: false, message: "Factura no encontrada" };
    }

    let comprobanteDatos: Uint8Array<ArrayBuffer> | null = null;
    let comprobanteTipo: string | null = null;

    if (comprobanteFile && comprobanteFile.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(comprobanteFile.type)) {
        return { success: false, message: "El comprobante debe ser JPG/PNG/WebP o PDF." };
      }
      if (comprobanteFile.size > 5 * 1024 * 1024) {
        return { success: false, message: "El comprobante no debe superar los 5 MB." };
      }
      const buf = await comprobanteFile.arrayBuffer();
      comprobanteDatos = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
      comprobanteTipo = comprobanteFile.type;
    }

    await prisma.$transaction(async (tx) => {
      await tx.factura.update({
        where: { id: facturaId },
        data: {
          estadoPago: "PAGADO",
          metodoPago,
          fechaValidacion: new Date(),
          ...(comprobanteDatos ? { comprobanteDatos, comprobanteTipo } : {}),
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
    return { success: false, message: "Error al cobrar el saldo" };
  }
}

export async function cobrarSaldoFacturaForm(formData: FormData) {
  const facturaId = formData.get("facturaId") as string;
  const metodoPago = formData.get("metodo") as MetodoPagoInput;
  const comprobante = formData.get("comprobantePago");
  const comprobanteFile = comprobante instanceof File && comprobante.size > 0 ? comprobante : null;

  if (!facturaId || !metodoPago) {
    return { success: false, message: "Faltan datos para cobrar el saldo" };
  }
  return cobrarSaldoFactura(facturaId, metodoPago, comprobanteFile);
}

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
      const saldoPendiente = f.estadoPago === 'PAGADO' ? 0 : montoTotal;
      
      if (f.estadoPago === 'PAGADO') {
        ingresosHoy += montoTotal;
        facturasPagadas++;
      } else {
        cuentasPorCobrar += saldoPendiente;
      }

      if (f.categoria === 'Consulta') desglose.consultas += montoTotal;
      else if (f.categoria === 'Procedimiento') desglose.procedimientos += montoTotal;
      else desglose.laboratorio += montoTotal;

      return {
        id: f.id,
        citaId: f.citaId,
        pacienteName: `${f.paciente.nombre} ${f.paciente.apellido}`,
        categoria: f.categoria,
        montoTotal,
        saldoPendiente,
        metodoPago: f.metodoPago || 'N/A',
        observacionPago: f.observacionPago,
        tieneComprobante: !!f.comprobanteDatos,
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
