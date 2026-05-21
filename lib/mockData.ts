export interface HistoriaClinicaMock {
  id: number;
  fecha: string;
  motivo: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  presionArt?: string;
  pulso?: number;
  temperatura?: number;
  peso?: number;
  medico: string;
}

export interface PacienteMock {
  id: number;
  nombre: string;
  edad: number;
  genero: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoSangre: string;
  alergias: string;
  antecedentes: string;
  ultimaConsulta: string;
  estado: 'Estable' | 'En Observación' | 'Crítico';
  historiasClinicas: HistoriaClinicaMock[];
}

export interface CitaMock {
  id: number;
  pacienteNombre: string;
  pacienteId: number;
  fecha: string;
  hora: string;
  motivo: string;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';
  medico: string;
}

export interface EspecialidadStat {
  nombre: string;
  cantidad: number;
  color: string;
}

export interface EvolucionMensual {
  mes: string;
  pacientes: number;
}

export const mockPacientes: PacienteMock[] = [
  {
    id: 1,
    nombre: "Alejandro Silva Torres",
    edad: 45,
    genero: "Masculino",
    email: "alejandro.silva@email.com",
    telefono: "+56 9 8765 4321",
    direccion: "Av. Las Condes 8900, Santiago",
    tipoSangre: "O+",
    alergias: "Penicilina, Polen",
    antecedentes: "Hipertensión arterial diagnosticada en 2021. Padre con antecedentes de infarto agudo de miocardio.",
    ultimaConsulta: "2026-05-18",
    estado: "Estable",
    historiasClinicas: [
      {
        id: 101,
        fecha: "2026-05-18",
        motivo: "Control de rutina por hipertensión arterial",
        sintomas: "Cefalea leve ocasional por las mañanas. No refiere dolor precordial ni disnea.",
        diagnostico: "Hipertensión esencial controlada. Fatiga leve por estrés laboral.",
        tratamiento: "Continuar con Losartán 50mg cada 12 hrs. Reducir consumo de sodio. Control de presión diario.",
        presionArt: "125/82 mmHg",
        pulso: 72,
        temperatura: 36.5,
        peso: 82.4,
        medico: "Dra. Sofía Mendoza (Cardiología)"
      },
      {
        id: 102,
        fecha: "2026-02-10",
        motivo: "Palpitaciones y mareos",
        sintomas: "Refiere latidos rápidos tras situaciones de estrés en el trabajo. Leve inestabilidad al levantarse rápido.",
        diagnostico: "Palpitaciones secundarias a estrés emocional y cafeína.",
        tratamiento: "Disminuir consumo de café a 1 taza al día. Practicar técnicas de relajación. Mantener Losartán.",
        presionArt: "135/88 mmHg",
        pulso: 88,
        temperatura: 36.6,
        peso: 83.1,
        medico: "Dra. Sofía Mendoza (Cardiología)"
      }
    ]
  },
  {
    id: 2,
    nombre: "Camila Rojas Valenzuela",
    edad: 28,
    genero: "Femenino",
    email: "camila.rojas@email.com",
    telefono: "+56 9 1234 5678",
    direccion: "Providencia 1245, Dpto 402, Santiago",
    tipoSangre: "A-",
    alergias: "Ninguna conocida",
    antecedentes: "Asma bronquial en la infancia, sin crisis recientes. Apendicectomía en 2018.",
    ultimaConsulta: "2026-05-20",
    estado: "En Observación",
    historiasClinicas: [
      {
        id: 201,
        fecha: "2026-05-20",
        motivo: "Dificultad respiratoria y tos seca persistente",
        sintomas: "Disnea de esfuerzo y sibilancias audibles tras resfriado común hace 4 días. Tos empeora en la noche.",
        diagnostico: "Exacerbación asmática leve desencadenada por infección viral respiratoria.",
        tratamiento: "Salbutamol 2 inhalaciones cada 6 hrs por 5 días. Budesonida 200mcg cada 12 hrs. Reposo relativo.",
        presionArt: "115/70 mmHg",
        pulso: 80,
        temperatura: 37.2,
        peso: 58.2,
        medico: "Dr. Carlos Valdivia (Broncopulmonar)"
      }
    ]
  },
  {
    id: 3,
    nombre: "María Loreto Gómez",
    edad: 67,
    genero: "Femenino",
    email: "marialoreto.g@email.com",
    telefono: "+56 9 7654 3210",
    direccion: "Los Leones 450, Providencia",
    tipoSangre: "AB+",
    alergias: "Sulfamidas, Aspirina",
    antecedentes: "Diabetes Mellitus tipo 2 diagnosticada hace 10 años. Artrosis de rodilla derecha.",
    ultimaConsulta: "2026-05-15",
    estado: "Estable",
    historiasClinicas: [
      {
        id: 301,
        fecha: "2026-05-15",
        motivo: "Revisión de exámenes y dolor de rodilla",
        sintomas: "Dolor en rodilla derecha al caminar trayectos largos. Hemoglobina glicosilada dentro del rango esperado.",
        diagnostico: "Diabetes Mellitus Tipo 2 controlada con fármacos. Gonartrosis grado II derecha.",
        tratamiento: "Mantener Metformina 850mg post-almuerzo y cena. Celecoxib 200mg diario en caso de dolor severo. Derivar a Kinesiología.",
        presionArt: "120/78 mmHg",
        pulso: 68,
        temperatura: 36.3,
        peso: 71.5,
        medico: "Dr. Ricardo Bascuñán (Geriatría/Medicina General)"
      },
      {
        id: 302,
        fecha: "2025-11-20",
        motivo: "Control trimestral de diabetes",
        sintomas: "Parestesias leves en dedos del pie izquierdo durante la noche. Polidipsia moderada.",
        diagnostico: "Diabetes Mellitus con control subóptimo. Sospecha de neuropatía diabética incipiente.",
        tratamiento: "Ajustar Metformina a 1000mg en la cena. Solicitar perfil lipídico y microalbuminuria. Cuidado estricto de pies.",
        presionArt: "130/80 mmHg",
        pulso: 74,
        temperatura: 36.4,
        peso: 73.0,
        medico: "Dr. Ricardo Bascuñán (Geriatría/Medicina General)"
      }
    ]
  },
  {
    id: 4,
    nombre: "Joaquín Martínez Castro",
    edad: 12,
    genero: "Masculino",
    email: "padre.martinez@email.com",
    telefono: "+56 9 9988 7766",
    direccion: "Vitacura 3400, Vitacura",
    tipoSangre: "O-",
    alergias: "Proteína de leche de vaca (superada), Polvo de habitación",
    antecedentes: "Nacido de término. Desarrollo psicomotor adecuado. Vacunas al día.",
    ultimaConsulta: "2026-05-10",
    estado: "Estable",
    historiasClinicas: [
      {
        id: 401,
        fecha: "2026-05-10",
        motivo: "Control de niño sano y evaluación de crecimiento",
        sintomas: "Sintomatología ausente. Paciente activo, realiza actividad física escolar sin problemas.",
        diagnostico: "Desarrollo pondoestatural adecuado para la edad. Curva de crecimiento normal.",
        tratamiento: "Alimentación equilibrada. Limitar pantallas. Fomentar deportes. Próximo control en un año.",
        presionArt: "105/62 mmHg",
        pulso: 82,
        temperatura: 36.7,
        peso: 41.2,
        medico: "Dra. Carolina Ríos (Pediatría)"
      }
    ]
  },
  {
    id: 5,
    nombre: "Roberto Muñoz Fuentes",
    edad: 53,
    genero: "Masculino",
    email: "roberto.munoz@email.com",
    telefono: "+56 9 5544 3322",
    direccion: "Gran Avenida 5400, San Miguel",
    tipoSangre: "B+",
    alergias: "Ninguna conocida",
    antecedentes: "Tabaquismo activo (5 cigarrillos al día). Obesidad grado I.",
    ultimaConsulta: "2026-05-21",
    estado: "Crítico",
    historiasClinicas: [
      {
        id: 501,
        fecha: "2026-05-21",
        motivo: "Dolor abdominal agudo y náuseas",
        sintomas: "Dolor intenso tipo cólico en hipocondrio derecho irradiado a escápula, iniciado tras ingesta de comida grasa. Vómitos.",
        diagnostico: "Colecistitis aguda litiásica. Obesidad grado I.",
        tratamiento: "Hospitalización inmediata. Régimen cero. Hidratación parenteral. Antibióticos EV (Ceftriaxona + Metronidazol). Analgesia EV. Evaluar por cirujano de turno para colecistectomía de urgencia.",
        presionArt: "142/90 mmHg",
        pulso: 95,
        temperatura: 38.1,
        peso: 89.5,
        medico: "Dr. Esteban Peralta (Urgencias / Cirugía General)"
      }
    ]
  },
  {
    id: 6,
    nombre: "Valentina Henríquez Paz",
    edad: 34,
    genero: "Femenino",
    email: "valentina.hp@email.com",
    telefono: "+56 9 6677 8899",
    direccion: "Irarrázaval 2800, Ñuñoa",
    tipoSangre: "A+",
    alergias: "Acaros, Humedad",
    antecedentes: "Hipotiroidismo en tratamiento desde 2022. Hermana con hipotiroidismo.",
    ultimaConsulta: "2026-04-12",
    estado: "Estable",
    historiasClinicas: [
      {
        id: 601,
        fecha: "2026-04-12",
        motivo: "Control de hipotiroidismo",
        sintomas: "Paciente refiere somnolencia leve por las tardes, pero mejoría en comparación a meses anteriores.",
        diagnostico: "Hipotiroidismo primario en tratamiento, eutiroidea por laboratorio reciente.",
        tratamiento: "Mantener Levotiroxina 75mcg en ayunas, 30 minutos antes del desayuno. Control de TSH y T4 libre en 6 meses.",
        presionArt: "112/72 mmHg",
        pulso: 65,
        temperatura: 36.2,
        peso: 62.8,
        medico: "Dr. Jaime Vergara (Endocrinología)"
      }
    ]
  }
];

export const mockCitas: CitaMock[] = [
  {
    id: 1,
    pacienteNombre: "Alejandro Silva Torres",
    pacienteId: 1,
    fecha: "2026-05-21",
    hora: "09:00",
    motivo: "Chequeo Presión Arterial",
    estado: "COMPLETADA",
    medico: "Dra. Sofía Mendoza"
  },
  {
    id: 2,
    pacienteNombre: "Roberto Muñoz Fuentes",
    pacienteId: 5,
    fecha: "2026-05-21",
    hora: "10:30",
    motivo: "Dolor Abdominal Fuerte",
    estado: "EN_CURSO",
    medico: "Dr. Esteban Peralta"
  },
  {
    id: 3,
    pacienteNombre: "María Loreto Gómez",
    pacienteId: 3,
    fecha: "2026-05-21",
    hora: "11:45",
    motivo: "Receta de Medicamentos",
    estado: "PENDIENTE",
    medico: "Dr. Ricardo Bascuñán"
  },
  {
    id: 4,
    pacienteNombre: "Camila Rojas Valenzuela",
    pacienteId: 2,
    fecha: "2026-05-21",
    hora: "14:15",
    motivo: "Control Broncopulmonar",
    estado: "PENDIENTE",
    medico: "Dr. Carlos Valdivia"
  },
  {
    id: 5,
    pacienteNombre: "Valentina Henríquez Paz",
    pacienteId: 6,
    fecha: "2026-05-21",
    hora: "16:00",
    motivo: "Revisión Perfil Tiroideo",
    estado: "PENDIENTE",
    medico: "Dr. Jaime Vergara"
  },
  {
    id: 6,
    pacienteNombre: "Joaquín Martínez Castro",
    pacienteId: 4,
    fecha: "2026-05-21",
    hora: "17:30",
    motivo: "Control de Crecimiento Niño Sano",
    estado: "PENDIENTE",
    medico: "Dra. Carolina Ríos"
  }
];

export const mockDashboardStats = {
  totalPacientes: mockPacientes.length,
  citasHoy: mockCitas.length,
  citasCompletadasHoy: mockCitas.filter(c => c.estado === 'COMPLETADA').length,
  citasPendientesHoy: mockCitas.filter(c => c.estado === 'PENDIENTE').length,
  totalHistoriasClinicas: mockPacientes.reduce((acc, p) => acc + p.historiasClinicas.length, 0),
  tasaOcupacionCitas: "85%", // Simulado
};

export const mockEspecialidadesStats: EspecialidadStat[] = [
  { nombre: "Medicina General", cantidad: 12, color: "#3b82f6" }, // Blue
  { nombre: "Cardiología", cantidad: 8, color: "#ef4444" },      // Red
  { nombre: "Pediatría", cantidad: 7, color: "#10b981" },        // Emerald
  { nombre: "Broncopulmonar", cantidad: 5, color: "#06b6d4" },   // Cyan
  { nombre: "Endocrinología", cantidad: 4, color: "#8b5cf6" },   // Violet
  { nombre: "Otras", cantidad: 6, color: "#6b7280" }             // Gray
];

export const mockEvolucionMensual: EvolucionMensual[] = [
  { mes: "Ene", pacientes: 18 },
  { mes: "Feb", pacientes: 25 },
  { mes: "Mar", pacientes: 32 },
  { mes: "Abr", pacientes: 40 },
  { mes: "May", pacientes: 54 }
];
