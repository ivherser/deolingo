import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { gradeAnswer } from "@/lib/exercises/grading";
import { parseExerciseData, type ExerciseType } from "@/lib/exercises/types";
import { computeLessonXp, isLessonUnlocked, nextHeartAt, regenerateHearts, updateStreak } from "@/lib/gamification";
import { LockedLessonError, MissingRecordError, NoHeartsError } from "@/lib/data/errors";
import { cefrLevelSchema, type CefrLevel } from "@/lib/levels";

const orderedLessonsQuery = (cefrLevel: string) => ({
  where: { unit: { cefrLevel } },
  orderBy: [{ unit: { order: "asc" as const } }, { order: "asc" as const }],
  select: { id: true },
});

export async function getSelectedLevel(userId: string): Promise<CefrLevel> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    select: { selectedLevel: true },
  });
  if (!progress) {
    throw new MissingRecordError();
  }
  return cefrLevelSchema.parse(progress.selectedLevel);
}

async function lessonUnlockState(
  client: Prisma.TransactionClient | typeof prisma,
  userId: string,
  lessonId: string,
) {
  const targetLesson = await client.lesson.findUnique({
    where: { id: lessonId },
    select: { unit: { select: { cefrLevel: true } } },
  });
  if (!targetLesson) {
    return false;
  }
  const [lessons, completed] = await Promise.all([
    client.lesson.findMany(orderedLessonsQuery(targetLesson.unit.cefrLevel)),
    client.lessonCompletion.findMany({ where: { userId }, select: { lessonId: true } }),
  ]);
  return isLessonUnlocked(
    lessons.map(({ id }) => id),
    new Set(completed.map(({ lessonId: completedId }) => completedId)),
    lessonId,
  );
}

async function lockUserProgress(transaction: Prisma.TransactionClient, userId: string) {
  await transaction.$queryRaw`SELECT "id" FROM "UserProgress" WHERE "userId" = ${userId} FOR UPDATE`;
  return transaction.userProgress.findUnique({ where: { userId } });
}

export async function getUnitsForUser(userId: string) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    select: { selectedLevel: true },
  });
  if (!progress) {
    throw new MissingRecordError();
  }
  const level = cefrLevelSchema.parse(progress.selectedLevel);
  const [units, completed] = await Promise.all([
    prisma.unit.findMany({
      where: { cefrLevel: level },
      orderBy: { order: "asc" },
      select: {
        id: true,
        order: true,
        title: true,
        description: true,
        color: true,
        cefrLevel: true,
        lessons: {
          orderBy: { order: "asc" },
          select: { id: true, order: true, title: true, description: true, xpReward: true },
        },
      },
    }),
    prisma.lessonCompletion.findMany({ where: { userId }, select: { lessonId: true } }),
  ]);
  const completedIds = new Set(completed.map(({ lessonId }) => lessonId));
  const orderedLessonIds = units.flatMap((unit) => unit.lessons.map(({ id }) => id));
  let currentAssigned = false;

  return {
    level,
    units: units.map((unit) => ({
      id: unit.id,
      order: unit.order,
      title: unit.title,
      description: unit.description,
      color: unit.color,
      cefrLevel: unit.cefrLevel,
      lessons: unit.lessons.map((lesson) => {
        const completedLesson = completedIds.has(lesson.id);
        const unlocked = isLessonUnlocked(orderedLessonIds, completedIds, lesson.id);
        const current = unlocked && !completedLesson && !currentAssigned;
        if (current) {
          currentAssigned = true;
        }
        return { ...lesson, completed: completedLesson, unlocked, current };
      }),
    })),
  };
}

export async function getLessonForUser(userId: string, lessonId: string) {
  const [lesson, unlocked] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        description: true,
        xpReward: true,
        unit: { select: { id: true, title: true, color: true } },
        exercises: {
          orderBy: { order: "asc" },
          select: { id: true, type: true, prompt: true, data: true },
        },
      },
    }),
    lessonUnlockState(prisma, userId, lessonId),
  ]);
  if (!lesson) {
    throw new MissingRecordError();
  }
  if (!unlocked) {
    throw new LockedLessonError();
  }
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    xpReward: lesson.xpReward,
    unit: lesson.unit,
    exercises: lesson.exercises.map((exercise) => {
      const type = exercise.type as ExerciseType;
      return {
        id: exercise.id,
        type,
        prompt: exercise.prompt,
        data: parseExerciseData(type, exercise.data),
      };
    }),
  };
}

export async function checkExercise(
  userId: string,
  exerciseId: string,
  userAnswer: unknown,
  mode: "lesson" | "practice",
) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: {
      id: true,
      lessonId: true,
      grammarTopicId: true,
      type: true,
      data: true,
      answer: true,
      explanation: true,
    },
  });
  if (!exercise) {
    throw new MissingRecordError();
  }
  if (mode === "lesson") {
    if (!exercise.lessonId || !(await lessonUnlockState(prisma, userId, exercise.lessonId))) {
      throw new LockedLessonError();
    }
  } else if (!exercise.grammarTopicId) {
    throw new MissingRecordError();
  }

  const grade = gradeAnswer(
    { type: exercise.type, data: exercise.data, answer: exercise.answer },
    userAnswer,
  );
  const now = new Date();

  return prisma.$transaction(async (transaction) => {
    const progress = await lockUserProgress(transaction, userId);
    if (!progress) {
      throw new MissingRecordError();
    }

    if (mode === "practice") {
      return { ...grade, explanation: exercise.explanation, hearts: progress.hearts };
    }

    const regenerated = regenerateHearts(progress.hearts, progress.heartsUpdatedAt, now);
    if (regenerated.hearts === 0) {
      if (regenerated.heartsUpdatedAt.getTime() !== progress.heartsUpdatedAt.getTime()) {
        await transaction.userProgress.update({
          where: { userId },
          data: { heartsUpdatedAt: regenerated.heartsUpdatedAt },
        });
      }
      throw new NoHeartsError();
    }
    const hearts = grade.correct ? regenerated.hearts : regenerated.hearts - 1;
    await transaction.userProgress.update({
      where: { userId },
      data: { hearts, heartsUpdatedAt: regenerated.heartsUpdatedAt },
    });
    return { ...grade, explanation: exercise.explanation, hearts };
  });
}

export async function completeLessonForUser(
  userId: string,
  lessonId: string,
  mistakes: number,
) {
  const now = new Date();
  return prisma.$transaction(async (transaction) => {
    const progress = await lockUserProgress(transaction, userId);
    if (!progress) {
      throw new MissingRecordError();
    }
    const lesson = await transaction.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, xpReward: true },
    });
    if (!lesson) {
      throw new MissingRecordError();
    }
    if (!(await lessonUnlockState(transaction, userId, lessonId))) {
      throw new LockedLessonError();
    }

    const regenerated = regenerateHearts(progress.hearts, progress.heartsUpdatedAt, now);
    if (regenerated.hearts === 0) {
      throw new NoHeartsError();
    }
    const previousCompletion = await transaction.lessonCompletion.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { bestScore: true },
    });
    const xpEarned = computeLessonXp(lesson.xpReward, !previousCompletion, mistakes);
    const score = Math.max(0, 100 - mistakes * 10);
    await transaction.lessonCompletion.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, bestScore: score, timesCompleted: 1, completedAt: now },
      update: {
        bestScore: Math.max(previousCompletion?.bestScore ?? 0, score),
        timesCompleted: { increment: 1 },
        completedAt: now,
      },
    });

    const streakUpdate = updateStreak(progress.lastActivityDate, progress.streak, now);
    const updatedProgress = await transaction.userProgress.update({
      where: { userId },
      data: {
        hearts: regenerated.hearts,
        heartsUpdatedAt: regenerated.heartsUpdatedAt,
        xp: { increment: xpEarned },
        streak: streakUpdate.streak,
        longestStreak: Math.max(progress.longestStreak, streakUpdate.streak),
        lastActivityDate: streakUpdate.lastActivityDate,
      },
      select: { xp: true, streak: true, longestStreak: true, hearts: true },
    });
    return {
      xpEarned,
      progress: updatedProgress,
      bestScore: Math.max(previousCompletion?.bestScore ?? 0, score),
    };
  });
}

export async function getProgressForUser(userId: string) {
  const now = new Date();
  return prisma.$transaction(async (transaction) => {
    const progress = await lockUserProgress(transaction, userId);
    if (!progress) {
      throw new MissingRecordError();
    }
    const hearts = regenerateHearts(progress.hearts, progress.heartsUpdatedAt, now);
    const updated =
      hearts.hearts !== progress.hearts ||
      hearts.heartsUpdatedAt.getTime() !== progress.heartsUpdatedAt.getTime()
        ? await transaction.userProgress.update({
            where: { userId },
            data: { hearts: hearts.hearts, heartsUpdatedAt: hearts.heartsUpdatedAt },
          })
        : progress;
    const [completedLessons, totalLessons, learnedWords] = await Promise.all([
      transaction.lessonCompletion.count({ where: { userId } }),
      transaction.lesson.count(),
      transaction.vocabularyReview.count({ where: { userId, repetitions: { gte: 1 } } }),
    ]);
    return {
      selectedLevel: cefrLevelSchema.parse(updated.selectedLevel),
      xp: updated.xp,
      streak: updated.streak,
      longestStreak: updated.longestStreak,
      hearts: updated.hearts,
      nextHeartAt: nextHeartAt(updated.hearts, updated.heartsUpdatedAt),
      completedLessons,
      totalLessons,
      learnedWords,
    };
  });
}

export async function setSelectedLevel(userId: string, level: CefrLevel) {
  const progress = await prisma.userProgress.update({
    where: { userId },
    data: { selectedLevel: level },
    select: { selectedLevel: true },
  });
  return { selectedLevel: cefrLevelSchema.parse(progress.selectedLevel) };
}
