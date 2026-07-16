"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

export async function getMedicos() {
  try {
    const medicos = await prisma.medico.findMany({
      include: {
        user: true,
        especialidad: true,
        especialidadesMedico: {
          include: { especialidad: true }
        }
      },
      orderBy: {
        user: { nombre: 'asc' }
      }
    });
    return { data: medicos, error: null };
  } catch (error) {
    console.error("Error fetching medicos:", error);
    return { data: [], error: "No se pudieron obtener los médicos" };
  }
}

export async function createMedico(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const especialidadId = formData.get("especialidadId") as string;
  const numColegiatura = formData.get("numColegiatura") as string;
  const especialidadesIdsRaw = formData.get("especialidadesIds") as string | null;

  if (!nombre || !email || !especialidadId || !numColegiatura) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    const existingMedico = await prisma.medico.findUnique({ where: { numColegiatura } });
    if (existingMedico) {
      return { error: "El número de colegiatura ya está registrado" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "El correo electrónico ya está en uso" };
    }

    const tempPassword = Math.random().toString(36).slice(-10) + "Aa1!";
    const passwordHash = await hashPassword(tempPassword);

    const especialidadesIds = especialidadesIdsRaw
      ? JSON.parse(especialidadesIdsRaw)
      : [especialidadId];

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nombre,
          email,
          passwordHash,
          rol: "DOCTOR"
        }
      });

      const medico = await tx.medico.create({
        data: {
          especialidadId,
          numColegiatura,
          userId: user.id
        }
      });

      const uniqueEspIds = [...new Set([especialidadId, ...especialidadesIds])];
      await tx.medicoEspecialidad.createMany({
        data: uniqueEspIds.map(espId => ({
          medicoId: medico.id,
          especialidadId: espId,
        })),
      });
    });

    revalidatePath("/medicos");
    return { success: true, tempPassword };
  } catch (error) {
    console.error("Error creating medico:", error);
    return { error: "Error en el servidor al registrar el médico" };
  }
}

export async function updateMedico(prevState: any, formData: FormData) {
  const medicoId = formData.get("medicoId") as string;
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const especialidadId = formData.get("especialidadId") as string;
  const numColegiatura = formData.get("numColegiatura") as string;
  const especialidadesIdsRaw = formData.get("especialidadesIds") as string | null;

  if (!medicoId || !nombre || !email || !especialidadId || !numColegiatura) {
    return { success: false, error: "Todos los campos son obligatorios" };
  }

  try {
    const medico = await prisma.medico.findUnique({
      where: { id: medicoId },
      select: { userId: true, numColegiatura: true }
    });

    if (!medico) {
      return { success: false, error: "Médico no encontrado" };
    }

    if (numColegiatura !== medico.numColegiatura) {
      const existing = await prisma.medico.findUnique({ where: { numColegiatura } });
      if (existing) {
        return { success: false, error: "El número de colegiatura ya está en uso" };
      }
    }

    const user = await prisma.user.findUnique({ where: { id: medico.userId } });
    if (user && email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return { success: false, error: "El correo electrónico ya está en uso" };
      }
    }

    const especialidadesIds = especialidadesIdsRaw
      ? JSON.parse(especialidadesIdsRaw)
      : [especialidadId];

    const uniqueEspIds = [...new Set([especialidadId, ...especialidadesIds])];

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: medico.userId },
        data: { nombre, email }
      });

      await tx.medico.update({
        where: { id: medicoId },
        data: { especialidadId, numColegiatura }
      });

      await tx.medicoEspecialidad.deleteMany({ where: { medicoId } });
      await tx.medicoEspecialidad.createMany({
        data: uniqueEspIds.map(espId => ({
          medicoId,
          especialidadId: espId,
        })),
      });
    });

    revalidatePath("/medicos");
    return { success: true, message: "Médico actualizado correctamente" };
  } catch (error) {
    console.error("Error updating medico:", error);
    return { success: false, error: "Error en el servidor al actualizar el médico" };
  }
}

export async function toggleMedicoEstado(medicoId: string, currentState: "ACTIVO" | "INACTIVO") {
  try {
    const newState = currentState === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    await prisma.medico.update({
      where: { id: medicoId },
      data: { estado: newState }
    });
    revalidatePath("/medicos");
    return { success: true };
  } catch (error) {
    console.error("Error toggling medico state:", error);
    return { error: "No se pudo cambiar el estado del médico" };
  }
}

export async function deleteMedico(medicoId: string) {
  try {
    const medico = await prisma.medico.findUnique({
      where: { id: medicoId }
    });

    if (!medico) {
      return { error: "Médico no encontrado" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.medicoEspecialidad.deleteMany({ where: { medicoId } });
      await tx.medico.delete({ where: { id: medicoId } });
      await tx.user.delete({ where: { id: medico.userId } });
    });

    revalidatePath("/medicos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting medico:", error);
    return { error: "No se puede eliminar un médico con historias clínicas registradas. Desactívelo en su lugar." };
  }
}

export async function getBoxes() {
  try {
    const boxes = await prisma.box.findMany({
      include: {
        especialidad: true,
      },
      orderBy: { nombre: 'asc' }
    });
    return { data: boxes, error: null };
  } catch (error) {
    console.error("Error fetching boxes:", error);
    return { data: [], error: "No se pudieron obtener los consultorios" };
  }
}

export async function createBox(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const tipo = formData.get("tipo") as string;
  const capacidad = parseInt(formData.get("capacidad") as string || "1", 10);
  const especialidadId = formData.get("especialidadId") as string;

  if (!nombre || !tipo || !especialidadId) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    const existing = await prisma.box.findUnique({ where: { nombre } });
    if (existing) {
      return { error: "Ya existe un consultorio con ese nombre" };
    }

    await prisma.box.create({
      data: {
        nombre,
        tipo,
        capacidad,
        estado: "DISPONIBLE",
        especialidadId,
      }
    });

    revalidatePath("/medicos");
    return { success: true };
  } catch (error) {
    console.error("Error creating box:", error);
    return { error: "Error en el servidor al registrar el consultorio" };
  }
}

export async function deleteBox(boxId: string) {
  try {
    await prisma.box.delete({ where: { id: boxId } });
    revalidatePath("/medicos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting box:", error);
    return { error: "No se puede eliminar el consultorio si está asociado a citas o historias clínicas." };
  }
}

export async function updateBoxState(boxId: string, newState: "DISPONIBLE" | "OCUPADO" | "MANTENIMIENTO") {
  try {
    await prisma.box.update({
      where: { id: boxId },
      data: { estado: newState }
    });
    revalidatePath("/medicos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating box:", error);
    return { success: false, error: "No se pudo actualizar el estado del consultorio" };
  }
}

export async function createEspecialidad(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const precioBase = parseFloat(formData.get("precioBase") as string || "0");

  if (!nombre || isNaN(precioBase) || precioBase < 0) {
    return { error: "El nombre y un precio base válido son obligatorios" };
  }

  try {
    const existing = await prisma.especialidad.findUnique({ where: { nombre } });
    if (existing) {
      return { error: "Ya existe esta especialidad en el catálogo" };
    }

    await prisma.especialidad.create({
      data: {
        nombre,
        precioBase
      }
    });

    revalidatePath("/medicos");
    return { success: true };
  } catch (error) {
    console.error("Error creating especialidad:", error);
    return { error: "Error en el servidor al crear la especialidad" };
  }
}

export async function deleteEspecialidad(especialidadId: string) {
  try {
    await prisma.especialidad.delete({ where: { id: especialidadId } });
    revalidatePath("/medicos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting especialidad:", error);
    return { error: "No se puede eliminar la especialidad si tiene médicos o boxes vinculados a ella." };
  }
}
