import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields (name, email, password) are required" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah dipakai
    const existingUser = await prisma.user.findUnique({
      where: { email: String(email) },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(
      { message: "Admin created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
