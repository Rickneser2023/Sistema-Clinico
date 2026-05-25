/*
  Warnings:

  - Made the column `presion` on table `HistoriaClinica` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pulso` on table `HistoriaClinica` required. This step will fail if there are existing NULL values in that column.
  - Made the column `temperatura` on table `HistoriaClinica` required. This step will fail if there are existing NULL values in that column.
  - Made the column `peso` on table `HistoriaClinica` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "HistoriaClinica" ALTER COLUMN "presion" SET NOT NULL,
ALTER COLUMN "pulso" SET NOT NULL,
ALTER COLUMN "temperatura" SET NOT NULL,
ALTER COLUMN "peso" SET NOT NULL;

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "tipoSangre" TEXT;
