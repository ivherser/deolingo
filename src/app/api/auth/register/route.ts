import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, routeError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.email().max(254).transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8)
    .max(72)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
});

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, registrationSchema);
    const passwordHash = await bcrypt.hash(input.password, 12);

    await prisma.$transaction(async (transaction) => {
      if (await transaction.user.findUnique({ where: { email: input.email }, select: { id: true } })) {
        throw new Error("ACCOUNT_EXISTS");
      }
      const user = await transaction.user.create({
        data: { name: input.name, email: input.email, passwordHash },
        select: { id: true },
      });
      await transaction.userProgress.create({ data: { userId: user.id } });
    });

    return NextResponse.json({ message: "Cuenta creada" }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_EXISTS") {
      return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 409 });
    }
    return routeError(error);
  }
}
