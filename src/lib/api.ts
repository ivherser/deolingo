import { NextResponse } from "next/server";
import { z } from "zod";
import { LockedLessonError, MissingRecordError, NoHeartsError } from "@/lib/data/errors";

export class InvalidRequestError extends Error {}

export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new InvalidRequestError();
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new InvalidRequestError();
  }
  return schema.parse(body);
}

export function routeError(error: unknown): NextResponse {
  if (error instanceof LockedLessonError) {
    return NextResponse.json({ error: "Lección bloqueada" }, { status: 403 });
  }
  if (error instanceof NoHeartsError) {
    return NextResponse.json({ error: "Sin corazones" }, { status: 403 });
  }
  if (error instanceof MissingRecordError) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (error instanceof z.ZodError || error instanceof InvalidRequestError) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function notFoundResponse(): NextResponse {
  return NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
