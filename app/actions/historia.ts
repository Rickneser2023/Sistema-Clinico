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
    presionArt?: string[];
    pulso?: string[];
    temperatura?: string[];
    peso?: string[];
    motivo?: string[];
    sintomas?: string[];
    diagnostico?: string[];
    tratamiento?: string[];
    doctorId?: string[];
    _form?: string[];
  };
  message?: string | null;
};

export async function createHistoriaClinica(prevState: FormState, formData: FormData): Promise<FormState> {
  // Convert FormData to an object for Zod validation
  const rawData = {
    pacienteId: formData.get("pacienteId"),
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    fechaNacimiento: formData.get("fechaNacimiento"),
    genero: formData.get("genero"),
    tipoSangre: formData.get("tipoSangre"),
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
            genero: data.genero as any, // Mapeado desde el enum
            tipoSangre: data.tipoSangre || null,
            alergias: data.alergias || null,
            antecedentes: data.antecedentes || null,
          },
        });
        finalPacienteId = newPaciente.id;
      }

      // 2. Crear Historia Clínica asociada
      await tx.historiaClinica.create({
        data: {
          pacienteId: finalPacienteId,
          medicoId: activeMedico.id, // ID del Médico verificado
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

  // Redirigir en caso de éxito (esto rompe el flujo actual de try/catch si se hace dentro)
  // por lo tanto lo hacemos al final de la función
  revalidatePath("/pacientes");
  redirect("/pacientes");
}
