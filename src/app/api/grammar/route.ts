import { NextResponse } from "next/server";
import { cefrLevelSchema } from "@/lib/levels";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getGrammarTopics } from "@/lib/data/grammar";
import { getSelectedLevel } from "@/lib/data/progression";
import { requireUserId } from "@/lib/require-user";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const requestedLevel = new URL(request.url).searchParams.get("level");
    const level = requestedLevel === null
      ? await getSelectedLevel(userId)
      : cefrLevelSchema.parse(requestedLevel);
    const topics = await getGrammarTopics(level);
    return NextResponse.json({ level, topics });
  } catch (error) {
    return routeError(error);
  }
}
