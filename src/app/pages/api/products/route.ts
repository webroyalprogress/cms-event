import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all products
export async function GET() {
  const products = await prisma.product.findMany({
    include: { events: true },
  });
  return NextResponse.json(products);
}

// CREATE new product
export async function POST(req: Request) {
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      price: body.price,
    },
  });
  return NextResponse.json(product);
}

// UPDATE product
export async function PUT(req: Request) {
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: body.id }, // id produk yang mau diupdate
    data: {
      name: body.name,
      price: body.price,
    },
  });
  return NextResponse.json(product);
}

// DELETE /api/products?id=123
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

  await prisma.product.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ message: "Product deleted" });
}
