import { NextResponse } from "next/server";
import { z } from "zod";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getLessonForUser } from "@/lib/data/progression";
import { requireUserId } from "@/lib/require-user";

const paramsSchema = z.object({ lessonId: z.string().min(1).max(80) });

export async function GET(
  _request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const params = paramsSchema.parse(await context.params);
    return NextResponse.json(await getLessonForUser(userId, params.lessonId));
  } catch (error) {
    return routeError(error);
  }
}
