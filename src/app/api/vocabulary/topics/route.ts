import { NextResponse } from "next/server";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getVocabularyTopics } from "@/lib/data/vocabulary";
import { requireUserId } from "@/lib/require-user";
import { getSelectedLevel } from "@/lib/data/progression";
import { cefrLevelListSchema, levelsUpTo } from "@/lib/levels";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const levelsParam = new URL(request.url).searchParams.get("levels");
    const levels =
      levelsParam === null
        ? levelsUpTo(await getSelectedLevel(userId))
        : cefrLevelListSchema.parse(levelsParam);
    return NextResponse.json(await getVocabularyTopics(levels));
  } catch (error) {
    return routeError(error);
  }
}
