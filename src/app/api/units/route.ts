import { NextResponse } from "next/server";
import { routeError, unauthorizedResponse } from "@/lib/api";
import { getUnitsForUser } from "@/lib/data/progression";
import { requireUserId } from "@/lib/require-user";

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    return NextResponse.json(await getUnitsForUser(userId));
  } catch (error) {
    return routeError(error);
  }
}
