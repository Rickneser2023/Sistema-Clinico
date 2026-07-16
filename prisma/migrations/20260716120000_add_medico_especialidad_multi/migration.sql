-- CreateTable
CREATE TABLE "MedicoEspecialidad" (
    "id" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "especialidadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicoEspecialidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicoEspecialidad_medicoId_especialidadId_key" ON "MedicoEspecialidad"("medicoId", "especialidadId");

-- AddForeignKey
ALTER TABLE "MedicoEspecialidad" ADD CONSTRAINT "MedicoEspecialidad_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicoEspecialidad" ADD CONSTRAINT "MedicoEspecialidad_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: Copy existing primary specialty into the new pivot table
INSERT INTO "MedicoEspecialidad" ("id", "medicoId", "especialidadId", "createdAt")
SELECT gen_random_uuid(), "id", "especialidadId", NOW()
FROM "Medico";
