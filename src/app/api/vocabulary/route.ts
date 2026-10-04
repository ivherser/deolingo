import { NextResponse } from "next/server";
import { z } from "zod";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getVocabulary } from "@/lib/data/vocabulary";
import { requireUserId } from "@/lib/require-user";
import { getSelectedLevel } from "@/lib/data/progression";
import { cefrLevelListSchema, levelsUpTo } from "@/lib/levels";

const topicSchema = z.string().min(1).max(60);

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const searchParams = new URL(request.url).searchParams;
    const topicParam = searchParams.get("topic");
    const topic = topicParam === null ? undefined : topicSchema.parse(topicParam);
    const levelsParam = searchParams.get("levels");
    const levels =
      levelsParam === null
        ? levelsUpTo(await getSelectedLevel(userId))
        : cefrLevelListSchema.parse(levelsParam);
    return NextResponse.json(await getVocabulary({ topic, levels }));
  } catch (error) {
    return routeError(error);
  }
}
