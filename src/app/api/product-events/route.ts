import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ GET semua relasi produk-event
export async function GET() {

  const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
    }

  const productEvents = await prisma.productEvent.findMany({
    include: { product: true, event: true },
  });
  return NextResponse.json(productEvents);
}

// ✅ POST assign produk ke event
export async function POST(req: Request) {

  const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
    }

  const body = await req.json();
  const productEvent = await prisma.productEvent.create({
    data: {
      productId: body.productId,
      eventId: body.eventId,
    },
  });
  return NextResponse.json(productEvent);
}

// ✅ PUT update relasi produk-event
export async function PUT(req: Request) {

  const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
    }

  const body = await req.json();
  const productEvent = await prisma.productEvent.update({
    where: { id: body.id },
    data: {
      productId: body.productId,
      eventId: body.eventId,
    },
  });
  return NextResponse.json(productEvent);
}

// ✅ DELETE unassign produk dari event
export async function DELETE(req: Request) {

  const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
    }
    
  const body = await req.json();
  await prisma.productEvent.delete({
    where: { id: body.id },
  });
  return NextResponse.json({ message: "Relation deleted" });
}
