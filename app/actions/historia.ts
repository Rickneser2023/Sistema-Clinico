"use server";

import { prisma } from "@/lib/prisma";
import { HistoriaClinicaSchema } from "@/lib/validations/historia";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = {
  errors?: {
    pacienteId?: string[];
    nombre?: string[];
    apellido?: string[];
    fechaNacimiento?: string[];
    genero?: string[];
    tipoSangre?: string[];
    contacto?: string[];
    alergias?: string[];
    antecedentes?: string[];
    presionArt?: string[];
    pulso?: string[];
    temperatura?: string[];
    peso?: string[];
    motivo?: string[];
    sintomas?: string[];
    diagnostico?: string[];
    tratamiento?: string[];
    doctorId?: string[];
    precioFinal?: string[];
    _form?: string[];
  };
  message?: string | null;
};

export async function createHistoriaClinica(prevState: FormState, formData: FormData): Promise<FormState> {
  // Convert FormData to an object for Zod validation
  const rawData = {
    citaId: formData.get("citaId"),
    pacienteId: formData.get("pacienteId"),
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    fechaNacimiento: formData.get("fechaNacimiento"),
    genero: formData.get("genero"),
    tipoSangre: formData.get("tipoSangre"),
    contacto: formData.get("contacto"),
    alergias: formData.get("alergias"),
    antecedentes: formData.get("antecedentes"),
    presionArt: formData.get("presionArt"),
    pulso: formData.get("pulso"),
    temperatura: formData.get("temperatura"),
    peso: formData.get("peso"),
    motivo: formData.get("motivo"),
    sintomas: formData.get("sintomas"),
    diagnostico: formData.get("diagnostico"),
    tratamiento: formData.get("tratamiento"),
    doctorId: formData.get("doctorId"),
    precioFinal: formData.get("precioFinal"),
  };

  // Validar con Zod
  const validatedFields = HistoriaClinicaSchema.safeParse(rawData);

  // Si la validación falla, retornar los errores para mostrarlos en el UI
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  const data = validatedFields.data;
  let estadoCierre: "COMPLETADA" | "PENDIENTE_PAGO" | null = null;

  try {
    // Verificar si el médico existe
    let activeMedico = await prisma.medico.findUnique({
      where: { id: data.doctorId }
    });

    if (!activeMedico) {
       // Buscar cualquier médico activo
       activeMedico = await prisma.medico.findFirst({ 
         where: { estado: 'ACTIVO' }
       });
       if (!activeMedico) {
         throw new Error("No hay médicos activos en el sistema para asignar esta historia.");
       }
    }

    // Obtener usuarioId desde FormData (enviado desde el cliente autenticado)
    const usuarioId = formData.get("usuarioId") as string | null;

    // Utilizar una transacción para asegurar integridad referencial
    await prisma.$transaction(async (tx) => {
      let finalPacienteId = data.pacienteId;

      // 1. Manejo de 'Nuevo Paciente'
      if (finalPacienteId === "new") {
        const newPaciente = await tx.paciente.create({
          data: {
            nombre: data.nombre!,
            apellido: data.apellido!,
            fechaNacimiento: new Date(data.fechaNacimiento!),
            genero: data.genero as any,
            tipoSangre: data.tipoSangre || null,
            contacto: data.contacto || null,
            alergias: data.alergias || null,
            antecedentes: data.antecedentes || null,
          },
        });
        finalPacienteId = newPaciente.id;
      } else {
        const existingPaciente = await tx.paciente.findUnique({
          where: { id: finalPacienteId },
          select: { contacto: true }
        });
        
        if (existingPaciente) {
          const currentContact = existingPaciente.contacto || "";
          const newContact = data.contacto || "";
          if (currentContact !== newContact) {
            await tx.paciente.update({
              where: { id: finalPacienteId },
              data: {
                contacto: data.contacto || null
              }
            });
          }
        }
      }

      // 2. Crear Historia Clínica asociada
      await tx.historiaClinica.create({
        data: {
          pacienteId: finalPacienteId,
          medicoId: activeMedico.id,
          motivo: data.motivo,
          sintomas: data.sintomas,
          diagnostico: data.diagnostico,
          planTratamiento: data.tratamiento,
          presion: data.presionArt,
          pulso: data.pulso,
          temperatura: data.temperatura,
          peso: data.peso,
        },
      });

      // 3. Actualizar la factura y cerrar la cita solo si no queda saldo pendiente.
      if (data.citaId) {
        const precioFinalNumber = data.precioFinal;

        let facturaActualizada = await tx.factura.findUnique({
          where: { citaId: data.citaId }
        });

        if (precioFinalNumber !== undefined && precioFinalNumber !== null) {
          if (facturaActualizada) {
            facturaActualizada = await tx.factura.update({
              where: { citaId: data.citaId },
              data: {
                montoBase: precioFinalNumber,
                montoTotal: precioFinalNumber,
              }
            });
          }
        }

        if (facturaActualizada) {
          const saldoPendiente = facturaActualizada.estadoPago === 'PAGADO'
            ? 0
            : Number(facturaActualizada.montoTotal);

          const nuevoEstado = saldoPendiente > 0 ? 'PENDIENTE_PAGO' : 'COMPLETADA';
          await tx.cita.update({
            where: { id: data.citaId },
            data: { estado: nuevoEstado }
          });
          estadoCierre = nuevoEstado;
        } else {
          await tx.cita.update({
            where: { id: data.citaId },
            data: { estado: 'COMPLETADA' }
          });
          estadoCierre = 'COMPLETADA';
        }
      } else {
        // FLUJO PACIENTE "DE FRENTE": No hay cita previa
        const medicoDetalle = await tx.medico.findUnique({
          where: { id: activeMedico.id },
          include: { especialidad: true }
        });

        let boxId = "";
        const boxEspecialidad = await tx.box.findFirst({
          where: { especialidadId: medicoDetalle?.especialidadId }
        });

        if (boxEspecialidad) {
          boxId = boxEspecialidad.id;
        } else {
          const anyBox = await tx.box.findFirst();
          if (anyBox) boxId = anyBox.id;
          else throw new Error("No hay consultorios (boxes) en el sistema para asignar esta atención.");
        }

        // Resolver el usuario creador: usar id enviado desde el cliente o buscar primer usuario
        let resolvedUsuarioId = usuarioId;
        if (!resolvedUsuarioId) {
          const adminUser = await tx.user.findFirst();
          if (!adminUser) throw new Error("Sistema sin usuarios administrativos.");
          resolvedUsuarioId = adminUser.id;
        }

        const now = new Date();

        // 2. Crear Cita "Fantasma" pendiente de pago hasta que caja cobre
        const nuevaCita = await tx.cita.create({
          data: {
            pacienteId: finalPacienteId,
            medicoId: activeMedico.id,
            boxId: boxId,
            fechaHoraInicio: now,
            fechaHoraFin: now,
            usuarioId: resolvedUsuarioId,
            estado: 'PENDIENTE_PAGO'
          }
        });
        estadoCierre = 'PENDIENTE_PAGO';

        // 3. Crear Factura desde cero por el monto total
        const precioFinal = data.precioFinal !== undefined && data.precioFinal !== null 
                              ? data.precioFinal 
                              : (medicoDetalle?.especialidad?.precioBase || 0);

        await tx.factura.create({
          data: {
            montoBase: precioFinal,
            montoTotal: precioFinal,
            estadoPago: 'PENDIENTE',
            citaId: nuevaCita.id,
            pacienteId: finalPacienteId,
            categoria: 'Consulta'
          }
        });
      }
    });

  } catch (error) {
    console.error("Error creating historia clinica:", error);
    return {
      message: "Ocurrió un error en el servidor al guardar la historia clínica.",
      errors: {
        _form: ["Hubo un problema de base de datos. Inténtalo más tarde."]
      }
    };
  }

  // Si hay cita asociada, registrar la hora real de fin de atención
  if (data.citaId) {
    try {
      await prisma.cita.update({
        where: { id: data.citaId },
        data: { fechaHoraFin: new Date() },
      });
    } catch (e) {
      console.error("Error updating fechaHoraFin:", e);
    }
  }

  // Redirigir en caso de éxito
  if (data.citaId) {
    revalidatePath("/atencion");
    revalidatePath("/agenda");
    revalidatePath("/facturacion");
    redirect(estadoCierre === "PENDIENTE_PAGO" ? "/facturacion" : "/atencion");
  } else {
    revalidatePath("/pacientes");
    revalidatePath("/facturacion");
    redirect(estadoCierre === "PENDIENTE_PAGO" ? "/facturacion" : "/pacientes");
  }
}
