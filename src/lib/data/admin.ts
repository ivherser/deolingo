import { prisma } from "@/lib/prisma";

export async function getRegisteredUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      progress: { select: { selectedLevel: true, xp: true } },
      _count: { select: { completions: true } },
    },
  });
}
