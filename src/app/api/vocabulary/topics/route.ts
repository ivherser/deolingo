import { NextResponse } from "next/server";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getVocabularyTopics } from "@/lib/data/vocabulary";
import { requireUserId } from "@/lib/require-user";

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    return NextResponse.json(await getVocabularyTopics());
  } catch (error) {
    return routeError(error);
  }
}
