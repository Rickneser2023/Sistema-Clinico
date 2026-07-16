import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const factura = await prisma.factura.findUnique({
    where: { id },
    select: { comprobanteDatos: true, comprobanteTipo: true },
  });

  if (!factura || !factura.comprobanteDatos) {
    return NextResponse.json({ error: 'Comprobante no encontrado' }, { status: 404 });
  }

  const tipo = factura.comprobanteTipo || 'image/png';
  const buffer = Buffer.from(factura.comprobanteDatos);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': tipo,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
