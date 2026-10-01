import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const userIdSchema = z.string().min(1);

export async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const result = userIdSchema.safeParse(session?.user?.id);
  return result.success ? result.data : null;
}
