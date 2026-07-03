import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

type Ctx = RouteContext<"/api/comprobante/[id]">;

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const factura = await prisma.factura.findUnique({
      where: { id },
      select: { comprobanteDatos: true, comprobanteTipo: true },
    });

    if (!factura || !factura.comprobanteDatos) {
      return new Response("Comprobante no encontrado", { status: 404 });
    }

    const datos = factura.comprobanteDatos;
    const contentType = factura.comprobanteTipo || "application/octet-stream";

    return new Response(datos, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": datos.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving comprobante:", error);
    return new Response("Error interno", { status: 500 });
  }
}
