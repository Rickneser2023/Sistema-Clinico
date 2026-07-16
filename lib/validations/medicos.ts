import { z } from "zod";

export const CreateMedicoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  especialidadId: z.string().min(1, "Debe seleccionar una especialidad principal"),
  numColegiatura: z.string().min(1, "El número de colegiatura es obligatorio"),
});

export const UpdateMedicoSchema = z.object({
  medicoId: z.string().min(1, "ID de médico requerido"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  especialidadId: z.string().min(1, "Debe seleccionar una especialidad principal"),
  numColegiatura: z.string().min(1, "El número de colegiatura es obligatorio"),
  especialidadesIds: z.array(z.string()).optional(),
});

export type CreateMedicoParams = z.infer<typeof CreateMedicoSchema>;
export type UpdateMedicoParams = z.infer<typeof UpdateMedicoSchema>;
