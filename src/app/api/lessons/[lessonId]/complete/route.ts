import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, routeError, unauthorizedResponse } from "@/lib/api";
import { completeLessonForUser } from "@/lib/data/progression";
import { requireUserId } from "@/lib/require-user";

const paramsSchema = z.object({ lessonId: z.string().min(1).max(80) });
const bodySchema = z.object({ mistakes: z.number().int().min(0).max(50) });

export async function POST(
  request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const params = paramsSchema.parse(await context.params);
    const body = await parseJsonBody(request, bodySchema);
    return NextResponse.json(
      await completeLessonForUser(userId, params.lessonId, body.mistakes),
    );
  } catch (error) {
    return routeError(error);
  }
}
