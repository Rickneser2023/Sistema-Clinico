"use server";

import { prisma } from "@/lib/prisma";
import { CitaSchema, FormStateAgenda } from "@/lib/validations/citas";
import { revalidatePath } from "next/cache";

// Crear Cita
export async function createCita(prevState: FormStateAgenda, formData: FormData): Promise<FormStateAgenda> {
  const rawData = {
    pacienteId: formData.get("pacienteId"),
    medicoId: formData.get("medicoId"),
    boxId: formData.get("boxId"),
    fechaHoraInicio: formData.get("fechaHoraInicio"),
  };

  const validatedFields = CitaSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
      success: false
    };
  }

  const { pacienteId, medicoId, boxId, fechaHoraInicio } = validatedFields.data;

  const start = new Date(fechaHoraInicio);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  try {
    const conflicto = await prisma.cita.findFirst({
      where: {
        estado: { not: "CANCELADA" },
        OR: [
          { medicoId: medicoId },
          { boxId: boxId }
        ],
        AND: [
          { fechaHoraInicio: { lt: end } },
          { fechaHoraFin: { gt: start } }
        ]
      },
      include: {
        medico: { select: { user: { select: { nombre: true } } } },
        box: { select: { nombre: true } }
      }
    });

    if (conflicto) {
      const isDoctor = conflicto.medicoId === medicoId;
      const resourceName = isDoctor ? conflicto.medico?.user?.nombre : conflicto.box?.nombre;
      return {
        message: `Conflicto de horario: El ${isDoctor ? 'médico' : 'box'} '${resourceName || 'seleccionado'}' ya tiene un compromiso en ese rango.`,
        errors: { _form: ["Se ha detectado solapamiento. Por favor, elija otro horario."] },
        success: false
      };
    }

    let usuarioId = formData.get("usuarioId") as string | null;
    if (!usuarioId) {
      const adminUser = await prisma.user.findFirst();
      if (!adminUser) {
        throw new Error("Sistema sin usuarios administrativos.");
      }
      usuarioId = adminUser.id;
    }

    let finalPacienteId = pacienteId;

    if (pacienteId === "new") {
      const nuevoPaciente = await prisma.paciente.create({
        data: {
          nombre: formData.get("nuevoPacienteNombre") as string,
          apellido: formData.get("nuevoPacienteApellido") as string,
          fechaNacimiento: new Date(formData.get("nuevoPacienteFechaNac") as string),
          genero: formData.get("nuevoPacienteGenero") as any,
        }
      });
      finalPacienteId = nuevoPaciente.id;
    }

    const nuevaCita = await prisma.cita.create({
      data: {
        pacienteId: finalPacienteId,
        medicoId,
        boxId,
        fechaHoraInicio: start,
        fechaHoraFin: end,
        usuarioId,
      }
    });

    const boxDetalle = await prisma.box.findUnique({
      where: { id: boxId },
      include: { especialidad: true }
    });

    const precioBase = boxDetalle?.especialidad?.precioBase || 0;

    await prisma.factura.create({
      data: {
        montoBase: precioBase,
        montoTotal: precioBase,
        estadoPago: 'PENDIENTE',
        citaId: nuevaCita.id,
        pacienteId: finalPacienteId,
        categoria: 'Consulta',
      }
    });

  } catch (error) {
    console.error("Error creating cita:", error);
    return {
      message: "Ocurrió un error en el servidor al agendar la cita.",
      errors: { _form: ["Error al guardar en la base de datos."] },
      success: false
    };
  }

  revalidatePath("/agenda");
  return { message: "Cita agendada exitosamente.", success: true };
}

export async function updateEstadoCita(citaId: string, nuevoEstado: string) {
  const estadoValido = nuevoEstado as "PROGRAMADA" | "EN_CURSO" | "COMPLETADA" | "CANCELADA" | "PENDIENTE_PAGO";
  try {
    if (nuevoEstado === "EN_CURSO") {
      await prisma.cita.update({
        where: { id: citaId },
        data: {
          estado: estadoValido,
          fechaHoraInicio: new Date(),
        },
      });
      revalidatePath("/agenda");
      revalidatePath("/atencion");
      revalidatePath("/facturacion");
      return { success: true };
    }

    if (nuevoEstado === "COMPLETADA") {
      const factura = await prisma.factura.findUnique({
        where: { citaId },
        select: { montoTotal: true, estadoPago: true },
      });

      if (factura && factura.estadoPago !== "PAGADO") {
        const saldo = Math.max(Number(factura.montoTotal), 0);
        if (saldo > 0) {
          await prisma.cita.update({
            where: { id: citaId },
            data: { estado: "PENDIENTE_PAGO" },
          });
          revalidatePath("/agenda");
          revalidatePath("/atencion");
          revalidatePath("/facturacion");
          return { success: false, message: "La cita tiene saldo pendiente. Debe pasar por caja antes de completarse." };
        }
      }
    }

    await prisma.cita.update({
      where: { id: citaId },
      data: { estado: estadoValido },
    });
    revalidatePath("/agenda");
    revalidatePath("/atencion");
    revalidatePath("/facturacion");
    return { success: true };
  } catch (error) {
    console.error("Error updating cita:", error);
    return { success: false, message: "Error actualizando el estado de la cita." };
  }
}

export async function reprogramarCita(citaId: string, nuevaFechaInicio: string, nuevaFechaFin: string) {
  const start = new Date(nuevaFechaInicio);
  const end = new Date(nuevaFechaFin);

  if (start < new Date()) {
    return { success: false, message: "No se puede reprogramar a una fecha pasada." };
  }

  try {
    const citaActual = await prisma.cita.findUnique({
      where: { id: citaId }
    });

    if (!citaActual) return { success: false, message: "Cita no encontrada." };

    const conflicto = await prisma.cita.findFirst({
      where: {
        id: { not: citaId },
        estado: { not: "CANCELADA" },
        OR: [
          { medicoId: citaActual.medicoId },
          { boxId: citaActual.boxId }
        ],
        AND: [
          { fechaHoraInicio: { lt: end } },
          { fechaHoraFin: { gt: start } }
        ]
      },
      include: {
        medico: { select: { user: { select: { nombre: true } } } },
        box: { select: { nombre: true } }
      }
    });

    if (conflicto) {
      const isDoctor = conflicto.medicoId === citaActual.medicoId;
      const resourceName = isDoctor ? conflicto.medico?.user?.nombre : conflicto.box?.nombre;
      return {
        message: `Conflicto de horario: El ${isDoctor ? 'médico' : 'box'} '${resourceName || 'seleccionado'}' ya tiene un compromiso en ese rango.`,
        success: false
      };
    }

    await prisma.cita.update({
      where: { id: citaId },
      data: {
        fechaHoraInicio: start,
        fechaHoraFin: end,
        estado: "PROGRAMADA"
      }
    });

    revalidatePath("/agenda");
    return { success: true, message: "Cita reprogramada exitosamente." };
  } catch (error) {
    console.error("Error reprogramando cita:", error);
    return { success: false, message: "Error al reprogramar la cita." };
  }
}
