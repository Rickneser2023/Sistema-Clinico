import { PrismaClient, Role, Genero, EstadoMedico, EstadoBox, EstadoCita, EstadoPago, MetodoPago } from '@prisma/client'

const prisma = new PrismaClient()

const NOMBRES_MASC = ['Carlos', 'Andrés', 'Roberto', 'Jorge', 'Felipe', 'Luis', 'Pablo', 'Sergio', 'Javier', 'Miguel', 'Diego', 'Cristian', 'Manuel', 'Oscar', 'Ricardo']
const NOMBRES_FEM = ['María', 'Carmen', 'Ana', 'Patricia', 'Claudia', 'Sofía', 'Valentina', 'Camila', 'Andrea', 'Francisca', 'Paula', 'Daniela', 'Marcela', 'Rosa', 'Carolina']
const APELLIDOS = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Ramírez', 'Espinoza', 'Castillo']
const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const ALERGIAS_COMUNES = ['Penicilina', 'Sulfas', 'Aspirina', 'Polen', 'Frutos secos', 'Ninguna', 'Ninguna', 'Ninguna']
const SHARED_PW = '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiX/sM.Hq.kH/T1E21TtzVvX4VfA2u'

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const AHORA = new Date()
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface EspecialidadInfo {
  nombre: string
  precioBase: number
  boxNombre: string
  doctorNombre: string
  doctorEmail: string
  numColegiatura: string
  color: string
}

const ESPECIALIDADES: EspecialidadInfo[] = [
  { nombre: 'Medicina General', precioBase: 40, boxNombre: 'Box 1 - General', doctorNombre: 'Dr. Ricardo Bascuñán', doctorEmail: 'rbascunan@clinica.com', numColegiatura: 'CMP-10001', color: '#3b82f6' },
  { nombre: 'Cardiología', precioBase: 80, boxNombre: 'Box 2 - Cardio', doctorNombre: 'Dra. Sofía Mendoza', doctorEmail: 'smendoza@clinica.com', numColegiatura: 'CMP-10002', color: '#ef4444' },
  { nombre: 'Pediatría', precioBase: 50, boxNombre: 'Box 3 - Pedia', doctorNombre: 'Dra. Carolina Ríos', doctorEmail: 'crios@clinica.com', numColegiatura: 'CMP-10003', color: '#10b981' },
  { nombre: 'Broncopulmonar', precioBase: 60, boxNombre: 'Box 4 - Bronco', doctorNombre: 'Dr. Carlos Valdivia', doctorEmail: 'cvaldivia@clinica.com', numColegiatura: 'CMP-10004', color: '#06b6d4' },
  { nombre: 'Traumatología', precioBase: 70, boxNombre: 'Box 5 - Trauma', doctorNombre: 'Dr. Esteban Peralta', doctorEmail: 'eperalta@clinica.com', numColegiatura: 'CMP-10005', color: '#f59e0b' },
  { nombre: 'Dermatología', precioBase: 55, boxNombre: 'Box 6 - Derma', doctorNombre: 'Dr. Jaime Vergara', doctorEmail: 'jvergara@clinica.com', numColegiatura: 'CMP-10006', color: '#8b5cf6' },
]

async function main() {
  console.log('🗑️  Limpiando base de datos...')
  await prisma.factura.deleteMany()
  await prisma.cita.deleteMany()
  await prisma.historiaClinica.deleteMany()
  await prisma.medico.deleteMany()
  await prisma.box.deleteMany()
  await prisma.user.deleteMany()
  await prisma.paciente.deleteMany()
  await prisma.especialidad.deleteMany()

  // ─── 1. ESPECIALIDADES ───
  console.log('🏥 Creando especialidades...')
  const espRecords: Record<string, { id: string; precioBase: number }> = {}
  for (const esp of ESPECIALIDADES) {
    const r = await prisma.especialidad.create({
      data: { nombre: esp.nombre, precioBase: esp.precioBase }
    })
    espRecords[esp.nombre] = { id: r.id, precioBase: esp.precioBase }
  }
  console.log(`✅ ${ESPECIALIDADES.length} especialidades creadas.`)

  // ─── 2. BOXES ───
  console.log('🏗️  Creando boxes...')
  const boxRecords: Record<string, { id: string; especialidad: string }> = {}
  for (const esp of ESPECIALIDADES) {
    const r = await prisma.box.create({
      data: {
        nombre: esp.boxNombre,
        tipo: 'Consultorio',
        especialidadId: espRecords[esp.nombre]!.id
      }
    })
    boxRecords[esp.boxNombre] = { id: r.id, especialidad: esp.nombre }
  }
  console.log(`✅ ${ESPECIALIDADES.length} boxes creados.`)

  // ─── 3. USUARIOS + MÉDICOS ───
  console.log('👤 Creando usuarios y médicos...')

  const admin = await prisma.user.create({
    data: {
      email: 'admin@clinica.com',
      nombre: 'Administrador Sistema',
      passwordHash: SHARED_PW,
      rol: Role.ADMIN
    }
  })

  const medicoRecords: { id: string; nombre: string; especialidad: string; userId: string }[] = []
  for (const esp of ESPECIALIDADES) {
    const user = await prisma.user.create({
      data: {
        email: esp.doctorEmail,
        nombre: esp.doctorNombre,
        passwordHash: SHARED_PW,
        rol: Role.DOCTOR
      }
    })
    const medico = await prisma.medico.create({
      data: {
        numColegiatura: esp.numColegiatura,
        especialidadId: espRecords[esp.nombre]!.id,
        userId: user.id
      }
    })
    medicoRecords.push({ id: medico.id, nombre: esp.doctorNombre, especialidad: esp.nombre, userId: user.id })
  }
  console.log(`✅ ${ESPECIALIDADES.length} médicos creados.`)

  // ─── 4. PACIENTES ───
  console.log('👥 Creando pacientes...')
  // Distribución mensual para curva de crecimiento (más en meses recientes)
  const pacientesPorMes = [0, 0, 2, 3, 4, 5, 7, 9]
  //                     [ene, feb, mar, abr, may, jun, jul, ago...]
  // Empezamos desde hace 6 meses
  const pacientesCreated: { id: string; nombre: string; apellido: string }[] = []
  let usados = new Set<string>()

  for (let mesesAtras = 6; mesesAtras >= 1; mesesAtras--) {
    const count = pacientesPorMes[mesesAtras] || 2
    const mesDate = new Date(AHORA.getFullYear(), AHORA.getMonth() - mesesAtras, 1)

    for (let i = 0; i < count; i++) {
      const genero = Math.random() > 0.5 ? Genero.MASCULINO : Genero.FEMENINO
      let nombre: string
      let apellido: string
      do {
        nombre = genero === Genero.MASCULINO ? randomItem(NOMBRES_MASC) : randomItem(NOMBRES_FEM)
        apellido = randomItem(APELLIDOS)
      } while (usados.has(`${nombre} ${apellido}`))
      usados.add(`${nombre} ${apellido}`)

      const paciente = await prisma.paciente.create({
        data: {
          nombre,
          apellido,
          fechaNacimiento: new Date(randomBetween(1950, 2012), randomBetween(0, 11), randomBetween(1, 28)),
          genero,
          tipoSangre: randomItem(TIPOS_SANGRE),
          contacto: `+56 9 ${randomBetween(1000, 9999)} ${randomBetween(1000, 9999)}`,
          alergias: randomItem(ALERGIAS_COMUNES),
          antecedentes: Math.random() > 0.6 ? ['Hipertensión', 'Diabetes tipo 2', 'Asma', 'Cardiopatía', 'Ninguno'][randomBetween(0, 4)] : undefined,
          createdAt: randomDate(mesDate, new Date(mesDate.getFullYear(), mesDate.getMonth() + 1, 0)),
        }
      })
      pacientesCreated.push({ id: paciente.id, nombre, apellido })
    }
  }
  console.log(`✅ ${pacientesCreated.length} pacientes creados.`)

  // ─── 5. CITAS ───
  console.log('📅 Creando citas y facturas...')

  const GENEROS_CITA: EstadoCita[] = ['COMPLETADA', 'COMPLETADA', 'COMPLETADA', 'COMPLETADA', 'COMPLETADA', 'COMPLETADA', 'PROGRAMADA', 'PROGRAMADA', 'PROGRAMADA', 'CANCELADA']

  let totalCitas = 0
  let totalFacturas = 0

  // Citas históricas (últimos 6 meses) + citas de hoy
  for (let mesesAtras = 6; mesesAtras >= 0; mesesAtras--) {
    const esEsteMes = mesesAtras === 0
    const mesDate = new Date(AHORA.getFullYear(), AHORA.getMonth() - mesesAtras, 1)
    const diasEnMes = new Date(AHORA.getFullYear(), AHORA.getMonth() - mesesAtras + 1, 0).getDate()

    // Más citas en meses recientes
    const citasEsteMes = esEsteMes ? 14 : 6 + (6 - mesesAtras) * 2

    for (let i = 0; i < citasEsteMes; i++) {
      const paciente = randomItem(pacientesCreated)
      const medico = randomItem(medicoRecords)
      const box = boxRecords[ESPECIALIDADES.find(e => e.nombre === medico.especialidad)!.boxNombre]!

      let dia: number
      let horaInicio: number
      let minInicio: number

      if (esEsteMes && i < 4) {
        // Citas para HOY
        dia = AHORA.getDate()
        horaInicio = 9 + i
        minInicio = 0
      } else {
        dia = randomBetween(1, Math.min(diasEnMes, 28))
        horaInicio = randomBetween(8, 17)
        minInicio = randomItem([0, 15, 30, 45])
      }

      const fechaInicio = new Date(
        esEsteMes ? AHORA.getFullYear() : mesDate.getFullYear(),
        esEsteMes ? AHORA.getMonth() : mesDate.getMonth(),
        dia, horaInicio, minInicio, 0
      )

      const duracion = randomBetween(15, 45)
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60 * 1000)

      const estado = esEsteMes && i < 12 ? randomItem(GENEROS_CITA) : randomItem(GENEROS_CITA)

      const cita = await prisma.cita.create({
        data: {
          fechaHoraInicio: fechaInicio,
          fechaHoraFin: fechaFin,
          motivo: randomItem(['Control rutinario', 'Consulta general', 'Dolor agudo', 'Examen de seguimiento', 'Receta médica', 'Evaluación inicial', 'Dolor crónico', 'Chequeo preventivo']),
          estado,
          pacienteId: paciente.id,
          usuarioId: admin.id,
          medicoId: medico.id,
          boxId: box.id,
          createdAt: fechaInicio,
        }
      })

      totalCitas++

      // Factura para citas COMPLETADA (hasta 3 meses atrás solo para mostrar evolución)
      if (estado === 'COMPLETADA' && mesesAtras >= 0) {
        const esp = espRecords[medico.especialidad]!
        const montoBase = esp.precioBase
        const montoAdelanto = Math.random() > 0.7 ? randomBetween(5, 15) : 0
        const montoTotal = montoBase - montoAdelanto

        await prisma.factura.create({
          data: {
            montoBase,
            montoAdelanto,
            montoTotal,
            estadoPago: Math.random() > 0.15 ? EstadoPago.PAGADO : EstadoPago.PENDIENTE,
            metodoPago: randomItem([MetodoPago.EFECTIVO, MetodoPago.TARJETA, MetodoPago.TRANSFERENCIA]),
            categoria: 'Consulta',
            fechaEmision: fechaInicio,
            citaId: cita.id,
            pacienteId: paciente.id,
          }
        })
        totalFacturas++
      }
    }
  }

  console.log(`✅ ${totalCitas} citas creadas.`)
  console.log(`💰 ${totalFacturas} facturas generadas.`)
  console.log('✨ Seed completado exitosamente.')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
