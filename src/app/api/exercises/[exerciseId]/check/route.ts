import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, routeError, unauthorizedResponse } from "@/lib/api";
import { checkExercise } from "@/lib/data/progression";
import { requireUserId } from "@/lib/require-user";

const paramsSchema = z.object({ exerciseId: z.string().min(1).max(100) });
const bodySchema = z.object({
  answer: z.unknown(),
  mode: z.enum(["lesson", "practice"]),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ exerciseId: string }> },
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const params = paramsSchema.parse(await context.params);
    const body = await parseJsonBody(request, bodySchema);
    if (!Object.hasOwn(body, "answer")) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json(
      await checkExercise(userId, params.exerciseId, body.answer, body.mode),
    );
  } catch (error) {
    return routeError(error);
  }
}
