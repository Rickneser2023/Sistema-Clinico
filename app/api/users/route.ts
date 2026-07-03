import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, nombre: true, rol: true, activo: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "El email es obligatorio" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase().trim(),
        nombre: body.nombre || body.email.split("@")[0],
        passwordHash: body.passwordHash || "default-hash",
      },
      select: { id: true, email: true, nombre: true, rol: true, activo: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error del servidor al crear usuario" }, { status: 500 });
  }
}
