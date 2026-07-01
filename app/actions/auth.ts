"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export async function login(email: string, password: string): Promise<{ success: true; user: AuthUser } | { success: false; message: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, nombre: true, rol: true, passwordHash: true, activo: true },
    });

    if (!user) {
      return { success: false, message: "Credenciales inválidas" };
    }

    if (!user.activo) {
      return { success: false, message: "Esta cuenta está desactivada. Contacta al administrador." };
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return { success: false, message: "Credenciales inválidas" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        activo: user.activo,
      },
    };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, message: "Error del servidor. Intenta de nuevo." };
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, nombre: true, rol: true, activo: true },
    });
    return user;
  } catch {
    return null;
  }
}
