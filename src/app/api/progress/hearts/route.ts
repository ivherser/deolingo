import { NextResponse } from "next/server";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { refillHeartsForUser } from "@/lib/data/progression";
import { requireUserId } from "@/lib/require-user";

export async function POST() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    return NextResponse.json(await refillHeartsForUser(userId));
  } catch (error) {
    return routeError(error);
  }
}
