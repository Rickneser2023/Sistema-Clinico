/*
  Warnings:

  - You are about to drop the column `especialidad` on the `Medico` table. All the data in the column will be lost.
  - Added the required column `especialidadId` to the `Box` table without a default value. This is not possible if the table is not empty.
  - Added the required column `especialidadId` to the `Medico` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'ANULADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- AlterTable
ALTER TABLE "Box" ADD COLUMN     "especialidadId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Medico" DROP COLUMN "especialidad",
ADD COLUMN     "especialidadId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Especialidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodoPago" "MetodoPago",
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "citaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Especialidad_nombre_key" ON "Especialidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_citaId_key" ON "Factura"("citaId");

-- AddForeignKey
ALTER TABLE "Medico" ADD CONSTRAINT "Medico_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
