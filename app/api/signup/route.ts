import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const prisma = new PrismaClient();

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "success", user });
    
  } catch (e) {
    console.log({ e });

    return NextResponse.json({ message: "failure", error: e });
  }
}