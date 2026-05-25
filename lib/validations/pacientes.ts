import { z } from "zod";

export const GetPacientesSchema = z.object({
  query: z.string().optional().catch(""),
  estado: z.string().optional().catch("ALL"),
  genero: z.string().optional().catch("ALL"),
  skip: z.coerce.number().int().nonnegative().default(0).catch(0),
  take: z.coerce.number().int().positive().max(100).default(20).catch(20),
});

export type GetPacientesParams = z.infer<typeof GetPacientesSchema>;
