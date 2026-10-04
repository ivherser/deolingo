import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { reviewCard, type SrsState } from "@/lib/srs";
import { updateStreak } from "@/lib/gamification";
import { MissingRecordError } from "@/lib/data/errors";
import type { CefrLevel } from "@/lib/levels";

type VocabularyFilter = {
  topic?: string;
  levels: CefrLevel[];
};

export async function getVocabularyTopics(levels: CefrLevel[]) {
  const grouped = await prisma.vocabularyItem.groupBy({
    by: ["topic"],
    _count: { _all: true },
    where: { cefrLevel: { in: levels } },
    orderBy: { topic: "asc" },
  });
  const topicOrder = [
    "verbos",
    "conectores",
    "saludos",
    "numeros",
    "familia",
    "comida",
    "casa",
    "ciudad",
    "tiempo",
    "ropa",
    "trabajo",
    "ocio",
  ];
  return grouped
    .map(({ topic, _count }) => ({ topic, count: _count._all }))
    .sort((left, right) => {
      const leftOrder = topicOrder.indexOf(left.topic);
      const rightOrder = topicOrder.indexOf(right.topic);
      if (leftOrder === -1 && rightOrder === -1) {
        return left.topic.localeCompare(right.topic);
      }
      return (leftOrder === -1 ? topicOrder.length : leftOrder) - (rightOrder === -1 ? topicOrder.length : rightOrder);
    });
}

export async function getVocabulary(filter: VocabularyFilter) {
  return prisma.vocabularyItem.findMany({
    where: {
      cefrLevel: { in: filter.levels },
      ...(filter.topic ? { topic: filter.topic } : {}),
    },
    orderBy: [{ topic: "asc" }, { german: "asc" }],
    select: {
      id: true,
      german: true,
      spanish: true,
      article: true,
      plural: true,
      topic: true,
      cefrLevel: true,
      exampleDe: true,
      exampleEs: true,
    },
  });
}

const selectedVocabulary = {
  id: true,
  german: true,
  spanish: true,
  article: true,
  plural: true,
  topic: true,
  cefrLevel: true,
  exampleDe: true,
  exampleEs: true,
} satisfies Prisma.VocabularyItemSelect;

export async function getReviewCards(userId: string, filter: VocabularyFilter) {
  const now = new Date();
  const due = await prisma.vocabularyReview.findMany({
    where: {
      userId,
      nextReviewAt: { lte: now },
      vocabularyItem: {
        cefrLevel: { in: filter.levels },
        ...(filter.topic ? { topic: filter.topic } : {}),
      },
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
    select: {
      easeFactor: true,
      interval: true,
      repetitions: true,
      nextReviewAt: true,
      lastReviewedAt: true,
      vocabularyItem: { select: selectedVocabulary },
    },
  });
  const newLimit = Math.min(10, 20 - due.length);
  const newItems =
    newLimit === 0
      ? []
      : await prisma.vocabularyItem.findMany({
          where: {
            cefrLevel: { in: filter.levels },
            ...(filter.topic ? { topic: filter.topic } : {}),
            reviews: { none: { userId } },
          },
          orderBy: [{ topic: "asc" }, { german: "asc" }],
          take: newLimit,
          select: selectedVocabulary,
        });

  return [
    ...due.map(({ vocabularyItem, ...review }) => ({ ...vocabularyItem, review })),
    ...newItems.map((item) => ({ ...item, review: null })),
  ];
}

export async function reviewVocabularyItem(
  userId: string,
  vocabularyItemId: string,
  quality: number,
) {
  const now = new Date();
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "UserProgress" WHERE "userId" = ${userId} FOR UPDATE`;
    const progress = await transaction.userProgress.findUnique({ where: { userId } });
    if (!progress) {
      throw new MissingRecordError();
    }
    if (
      !(await transaction.vocabularyItem.findUnique({
        where: { id: vocabularyItemId },
        select: { id: true },
      }))
    ) {
      throw new MissingRecordError();
    }

    const previous = await transaction.vocabularyReview.findUnique({
      where: { userId_vocabularyItemId: { userId, vocabularyItemId } },
      select: { easeFactor: true, interval: true, repetitions: true },
    });
    const state: SrsState = previous ?? { easeFactor: 2.5, interval: 0, repetitions: 0 };
    const nextState = reviewCard(state, quality, now);
    const review = await transaction.vocabularyReview.upsert({
      where: { userId_vocabularyItemId: { userId, vocabularyItemId } },
      create: {
        userId,
        vocabularyItemId,
        easeFactor: nextState.easeFactor,
        interval: nextState.interval,
        repetitions: nextState.repetitions,
        nextReviewAt: nextState.nextReviewAt,
        lastReviewedAt: now,
      },
      update: {
        easeFactor: nextState.easeFactor,
        interval: nextState.interval,
        repetitions: nextState.repetitions,
        nextReviewAt: nextState.nextReviewAt,
        lastReviewedAt: now,
      },
    });
    const streak = updateStreak(progress.lastActivityDate, progress.streak, now);
    await transaction.userProgress.update({
      where: { userId },
      data: {
        streak: streak.streak,
        longestStreak: Math.max(progress.longestStreak, streak.streak),
        lastActivityDate: streak.lastActivityDate,
      },
    });
    return {
      easeFactor: review.easeFactor,
      interval: review.interval,
      repetitions: review.repetitions,
      nextReviewAt: review.nextReviewAt,
      lastReviewedAt: review.lastReviewedAt,
    };
  });
}
