/*
  Warnings:

  - You are about to drop the column `fechaHora` on the `Cita` table. All the data in the column will be lost.
  - Added the required column `fechaHoraFin` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaHoraInicio` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Made the column `boxId` on table `Cita` required. This step will fail if there are existing NULL values in that column.
  - Made the column `medicoId` on table `Cita` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "EstadoCita" ADD VALUE 'EN_CURSO';

-- DropForeignKey
ALTER TABLE "Cita" DROP CONSTRAINT "Cita_boxId_fkey";

-- DropForeignKey
ALTER TABLE "Cita" DROP CONSTRAINT "Cita_medicoId_fkey";

-- AlterTable
ALTER TABLE "Cita" DROP COLUMN "fechaHora",
ADD COLUMN     "fechaHoraFin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "boxId" SET NOT NULL,
ALTER COLUMN "medicoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
