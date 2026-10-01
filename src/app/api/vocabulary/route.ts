import { NextResponse } from "next/server";
import { z } from "zod";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getVocabulary } from "@/lib/data/vocabulary";
import { requireUserId } from "@/lib/require-user";

const topicSchema = z.string().min(1).max(60);

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const topicParam = new URL(request.url).searchParams.get("topic");
    const topic = topicParam === null ? undefined : topicSchema.parse(topicParam);
    return NextResponse.json(await getVocabulary({ topic }));
  } catch (error) {
    return routeError(error);
  }
}
