import { NextResponse } from "next/server";
import { z } from "zod";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getGrammarTopic } from "@/lib/data/grammar";
import { requireUserId } from "@/lib/require-user";

const paramsSchema = z.object({ slug: z.string().min(1).max(60) });

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const params = paramsSchema.parse(await context.params);
    const topic = await getGrammarTopic(params.slug);
    if (!topic) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json(topic);
  } catch (error) {
    return routeError(error);
  }
}
