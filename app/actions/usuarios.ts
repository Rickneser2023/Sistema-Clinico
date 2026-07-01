"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/password";

export interface UserData {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  createdAt: Date;
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    return await prisma.user.findMany({
      select: { id: true, email: true, nombre: true, rol: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const validRoles = ['ADMIN', 'DOCTOR', 'RECEPCIONISTA'] as const;
    if (!validRoles.includes(newRole as any)) {
      return { success: false, message: "Rol inválido" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { rol: newRole as any }
    });

    revalidatePath('/configuracion');
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, message: "Error al actualizar rol" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Error al eliminar usuario" };
  }
}

export async function getRolePermissions(rol: string): Promise<string[]> {
  try {
    const perms = await prisma.rolePermission.findMany({
      where: { rol: rol as any, activo: true },
      select: { moduleKey: true },
    });
    return perms.map(p => p.moduleKey);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return [];
  }
}

export async function updateRolePermission(rol: string, moduleKey: string, activo: boolean) {
  try {
    await prisma.rolePermission.upsert({
      where: { rol_moduleKey: { rol: rol as any, moduleKey } },
      update: { activo },
      create: { rol: rol as any, moduleKey, activo },
    });
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error) {
    console.error("Error updating role permission:", error);
    return { success: false, message: "Error al actualizar permiso" };
  }
}

export async function actualizarEstadoUsuario(userId: string, activo: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { activo },
    });
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error) {
    console.error("Error updating user status:", error);
    return { success: false, message: "Error al actualizar estado" };
  }
}

export async function cambiarPassword(userId: string, nuevaPassword: string) {
  try {
    const passwordHash = await hashPassword(nuevaPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Error al cambiar contraseña" };
  }
}
