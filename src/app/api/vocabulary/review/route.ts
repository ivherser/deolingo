import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, routeError, unauthorizedResponse } from "@/lib/api";
import { getReviewCards, reviewVocabularyItem } from "@/lib/data/vocabulary";
import { requireUserId } from "@/lib/require-user";

const topicSchema = z.string().min(1).max(60);
const reviewSchema = z.object({
  vocabularyItemId: z.string().min(1).max(120),
  quality: z.number().int().min(0).max(5),
});

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const topicParam = new URL(request.url).searchParams.get("topic");
    const topic = topicParam === null ? undefined : topicSchema.parse(topicParam);
    return NextResponse.json(await getReviewCards(userId, topic));
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const body = await parseJsonBody(request, reviewSchema);
    return NextResponse.json(
      await reviewVocabularyItem(userId, body.vocabularyItemId, body.quality),
    );
  } catch (error) {
    return routeError(error);
  }
}
