import { NextResponse } from "next/server";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getGrammarTopics } from "@/lib/data/grammar";
import { requireUserId } from "@/lib/require-user";

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    return NextResponse.json(await getGrammarTopics());
  } catch (error) {
    return routeError(error);
  }
}
