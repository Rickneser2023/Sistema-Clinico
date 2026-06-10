-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "categoria" TEXT NOT NULL DEFAULT 'Consulta',
ADD COLUMN     "montoAdelanto" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "montoBase" DECIMAL(10,2) NOT NULL DEFAULT 0;
