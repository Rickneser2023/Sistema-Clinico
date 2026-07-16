import { z } from "zod";

export const CitaSchema = z.object({
  pacienteId: z.string().min(1, "Debe seleccionar un paciente"),
  medicoId: z.string().min(1, "Debe seleccionar un médico"),
  boxId: z.string().min(1, "Debe asignar un consultorio (Box)"),
  fechaHoraInicio: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida",
  }),
  montoAdelanto: z.coerce.number().min(0, "El adelanto no puede ser negativo").optional(),
  metodoAdelanto: z.enum(["EFECTIVO", "TRANSFERENCIA", "YAPE", "PLIN"]).optional(),
  observacionPago: z.string().max(500, "La observación es demasiado larga").optional(),
}).superRefine((data, ctx) => {
  const adelanto = Number(data.montoAdelanto) || 0;
  if (adelanto > 0 && !data.metodoAdelanto) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["metodoAdelanto"],
      message: "Debe seleccionar el método del adelanto",
    });
  }
});

export type FormStateAgenda = {
  message?: string;
  errors?: { _form?: string[]; [key: string]: string[] | undefined };
  success?: boolean;
};
