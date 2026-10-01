import { prisma } from "@/lib/prisma";
import { parseExerciseData, type ExerciseType } from "@/lib/exercises/types";

export async function getGrammarTopics() {
  return prisma.grammarTopic.findMany({
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true, summary: true, order: true, cefrLevel: true },
  });
}

export async function getGrammarTopic(slug: string) {
  const topic = await prisma.grammarTopic.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      explanation: true,
      cefrLevel: true,
      exercises: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, prompt: true, data: true },
      },
    },
  });
  if (!topic) {
    return null;
  }
  return {
    ...topic,
    exercises: topic.exercises.map((exercise) => {
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
