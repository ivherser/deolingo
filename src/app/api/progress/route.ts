import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, routeError, unauthorizedResponse } from "@/lib/api";
import { getProgressForUser, setSelectedLevel } from "@/lib/data/progression";
import { cefrLevelSchema } from "@/lib/levels";
import { requireUserId } from "@/lib/require-user";

const selectedLevelSchema = z.object({ selectedLevel: cefrLevelSchema });

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    return NextResponse.json(await getProgressForUser(userId));
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }
    const input = await parseJsonBody(request, selectedLevelSchema);
    return NextResponse.json(await setSelectedLevel(userId, input.selectedLevel));
  } catch (error) {
    return routeError(error);
  }
}
