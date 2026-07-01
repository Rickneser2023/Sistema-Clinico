-- AlterTable
ALTER TABLE "User" ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "rol" "Role" NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_rol_moduleKey_key" ON "RolePermission"("rol", "moduleKey");
