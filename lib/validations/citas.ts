import { z } from "zod";

export const CitaSchema = z.object({
  pacienteId: z.string().min(1, "Debe seleccionar un paciente"),
  medicoId: z.string().min(1, "Debe seleccionar un médico"),
  boxId: z.string().min(1, "Debe asignar un consultorio (Box)"),
  motivo: z.string().min(5, "El motivo debe ser más detallado"),
  fechaHora: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha y hora inválidas",
  }),
});

// Nota: La validación asincrónica contra la base de datos (para prevenir overbooking)
// no se puede hacer directamente en el esquema síncrono de Zod de forma nativa sencilla,
// por lo que se implementará en el Server Action usando la data validada por Zod.
