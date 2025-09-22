import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth"
import getServerSession from "next-auth"

type EventBody = { id?: number; name: string }

async function checkAuth() {
  const session = await getServerSession(authConfig)
  if (!session) {
    return null
  }
  return session
}

// GET all events with products
export async function GET() {
  const session = await checkAuth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const events = await prisma.event.findMany({
    include: { products: { include: { product: true } } },
  })

  return NextResponse.json(events)
}

// CREATE event
export async function POST(req: Request) {
  const session = await checkAuth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: EventBody = await req.json()
  const event = await prisma.event.create({
    data: { name: body.name },
  })

  return NextResponse.json(event)
}

// UPDATE event
export async function PUT(req: Request) {
  const session = await checkAuth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: EventBody = await req.json()
  const updatedEvent = await prisma.event.update({
    where: { id: body.id },
    data: { name: body.name },
  })

  return NextResponse.json(updatedEvent)
}

// DELETE event
export async function DELETE(req: Request) {
  const session = await checkAuth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: EventBody = await req.json()
  await prisma.event.delete({
    where: { id: body.id },
  })

  return NextResponse.json({ message: "Deleted successfully" })
}
