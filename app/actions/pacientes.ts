"use server";

import { prisma } from "@/lib/prisma";
import { GetPacientesSchema, GetPacientesParams } from "@/lib/validations/pacientes";

export async function getPacientes(params: GetPacientesParams) {
  // Validate input to prevent injection or malformed data
  const parsed = GetPacientesSchema.safeParse(params);
  
  if (!parsed.success) {
    return { data: [], total: 0, error: "Parámetros de búsqueda inválidos" };
  }

  const { query, estado, genero, skip, take } = parsed.data;

  try {
    // Build the dynamic where clause
    const whereClause: any = {};

    // 1. Text Search (nombre, apellido, id, email, telefono)
    // Usamos contains con mode 'insensitive' para búsqueda flexible
    if (query && query.trim() !== "") {
      const q = query.trim();
      whereClause.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { apellido: { contains: q, mode: "insensitive" } },
        { id: { equals: q } }, // UUID exact match if possible, or we could leave it
        { contacto: { contains: q, mode: "insensitive" } },
      ];
    }

    // 2. Status Filter
    if (estado && estado !== "ALL") {
      whereClause.estadoClinico = { contains: estado, mode: "insensitive" };
    }

    // 3. Gender Filter
    if (genero && genero !== "ALL") {
      // Prisma enums son case sensitive y exactos
      // Asumimos que el enum Genero es MASCULINO, FEMENINO, OTRO
      whereClause.genero = genero.toUpperCase();
    }

    // Run parallel queries to get data and total count
    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where: whereClause,
        orderBy: { nombre: 'asc' },
        skip,
        take,
        include: {
          // Extraemos la última historia clínica para sacar la "última consulta"
          historiasClinicas: {
            orderBy: { fecha: 'desc' },
            take: 1,
            select: { fecha: true, diagnostico: true }
          }
        }
      }),
      prisma.paciente.count({
        where: whereClause
      })
    ]);

    // Mapear el formato de salida para el frontend
    const mappedData = pacientes.map(p => ({
      id: p.id,
      nombre: `${p.nombre} ${p.apellido}`,
      edad: _calculateAge(p.fechaNacimiento),
      genero: p.genero === 'MASCULINO' ? 'Masculino' : p.genero === 'FEMENINO' ? 'Femenino' : 'Otro',
      tipoSangre: p.tipoSangre || 'N/A',
      contacto: p.contacto || 'Sin contacto',
      ultimaConsulta: p.historiasClinicas.length > 0 
        ? p.historiasClinicas[0].fecha.toLocaleDateString() 
        : 'Sin registro',
      estado: p.estadoClinico || 'No Evaluado',
    }));

    return { data: mappedData, total, error: null };
  } catch (error) {
    console.error("Error fetching pacientes:", error);
    return { data: [], total: 0, error: "Error en la base de datos al buscar pacientes" };
  }
}

// Función auxiliar para calcular la edad
function _calculateAge(birthDate: Date): number {
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff); 
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
