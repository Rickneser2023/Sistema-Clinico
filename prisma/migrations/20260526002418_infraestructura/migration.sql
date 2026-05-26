/*
  Warnings:

  - You are about to drop the column `doctorId` on the `HistoriaClinica` table. All the data in the column will be lost.
  - Added the required column `medicoId` to the `HistoriaClinica` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoMedico" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoBox" AS ENUM ('DISPONIBLE', 'OCUPADO', 'MANTENIMIENTO');

-- DropForeignKey
ALTER TABLE "HistoriaClinica" DROP CONSTRAINT "HistoriaClinica_doctorId_fkey";

-- AlterTable
ALTER TABLE "Cita" ADD COLUMN     "boxId" TEXT,
ADD COLUMN     "medicoId" TEXT;

-- AlterTable
ALTER TABLE "HistoriaClinica" DROP COLUMN "doctorId",
ADD COLUMN     "boxId" TEXT,
ADD COLUMN     "medicoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Medico" (
    "id" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "numColegiatura" TEXT NOT NULL,
    "estado" "EstadoMedico" NOT NULL DEFAULT 'ACTIVO',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL DEFAULT 1,
    "tipo" TEXT NOT NULL,
    "estado" "EstadoBox" NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medico_numColegiatura_key" ON "Medico"("numColegiatura");

-- CreateIndex
CREATE UNIQUE INDEX "Medico_userId_key" ON "Medico"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Box_nombre_key" ON "Box"("nombre");

-- AddForeignKey
ALTER TABLE "Medico" ADD CONSTRAINT "Medico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE SET NULL ON UPDATE CASCADE;
