import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import getServerSession from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper auth check
async function checkAuth() {
  const session = getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}

// GET semua relasi produk-event
export async function GET() {
  const session = await checkAuth();
  if (!session) return NextResponse.redirect("/admin/login");

  try {
    const productEvents = await prisma.productEvent.findMany({
      include: { product: true, event: true },
    });
    return NextResponse.json(productEvents);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch product events" }, { status: 500 });
  }
}

// POST assign produk ke event
export async function POST(req: Request) {
  const session = await checkAuth();
  if (!session) return NextResponse.redirect("/admin/login");

  try {
    const body = await req.json();
    if (!body.productId || !body.eventId) {
      return NextResponse.json({ error: "Missing productId or eventId" }, { status: 400 });
    }

    const productEvent = await prisma.productEvent.create({
      data: {
        productId: body.productId,
        eventId: body.eventId,
      },
    });
    return NextResponse.json(productEvent);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create relation" }, { status: 500 });
  }
}

// PUT update relasi produk-event
export async function PUT(req: Request) {
  const session = await checkAuth();
  if (!session) return NextResponse.redirect("/admin/login");

  try {
    const body = await req.json();
    if (!body.id || !body.productId || !body.eventId) {
      return NextResponse.json({ error: "Missing id, productId or eventId" }, { status: 400 });
    }

    const productEvent = await prisma.productEvent.update({
      where: { id: body.id },
      data: {
        productId: body.productId,
        eventId: body.eventId,
      },
    });
    return NextResponse.json(productEvent);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update relation" }, { status: 500 });
  }
}

// DELETE unassign produk dari event
export async function DELETE(req: Request) {
  const session = await checkAuth();
  if (!session) return NextResponse.redirect("/admin/login");

  try {
    const body = await req.json().catch(() => ({}));
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.productEvent.delete({ where: { id: body.id } });
    return NextResponse.json({ message: "Relation deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete relation" }, { status: 500 });
  }
}
