import { z } from "zod";

export const CitaSchema = z.object({
  pacienteId: z.string().min(1, "Debe seleccionar un paciente"),
  medicoId: z.string().min(1, "Debe seleccionar un médico"),
  especialidadId: z.string().min(1, "Debe seleccionar una especialidad"),
  fechaHoraInicio: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida",
  }),
});

export type FormStateAgenda = {
  message?: string;
  errors?: { _form?: string[]; [key: string]: string[] | undefined };
  success?: boolean;
};
