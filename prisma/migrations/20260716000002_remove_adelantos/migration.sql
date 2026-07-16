-- DropEnum
DROP TYPE "EstadoAdelanto";

-- AlterTable
ALTER TABLE "Factura" DROP COLUMN "montoAdelanto",
DROP COLUMN "metodoAdelanto",
DROP COLUMN "estadoAdelanto",
DROP COLUMN "comprobanteUrl",
DROP COLUMN "fechaComprobante",
DROP COLUMN "validadoPorId";
