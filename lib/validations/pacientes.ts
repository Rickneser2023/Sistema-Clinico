import { z } from "zod";

export const GetPacientesSchema = z.object({
  query: z.string().optional().catch(""),
  estado: z.string().optional().catch("ALL"),
  genero: z.string().optional().catch("ALL"),
  skip: z.coerce.number().int().nonnegative().default(0).catch(0),
  take: z.coerce.number().int().positive().max(100).default(20).catch(20),
});

export type GetPacientesParams = z.infer<typeof GetPacientesSchema>;

export const UpdatePacienteSchema = z.object({
  pacienteId: z.string().min(1, "ID de paciente requerido"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  fechaNacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de nacimiento inválida",
  }),
  genero: z.enum(["MASCULINO", "FEMENINO", "OTRO"], {
    errorMap: () => ({ message: "Género inválido" }),
  }),
  tipoSangre: z.string().optional().nullable(),
  contacto: z.string().optional().nullable(),
  alergias: z.string().optional().nullable(),
  antecedentes: z.string().optional().nullable(),
});

export type UpdatePacienteParams = z.infer<typeof UpdatePacienteSchema>;
