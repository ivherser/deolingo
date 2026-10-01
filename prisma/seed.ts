import { Prisma, PrismaClient } from "@prisma/client";
import { grammarTopics } from "./seed-data/grammar";
import { units } from "./seed-data/units";
import { vocabulary } from "./seed-data/vocabulary";

const prisma = new PrismaClient();
const toJson = (value: Record<string, unknown>) => value as Prisma.InputJsonValue;

async function seedContent() {
  for (const unit of units) {
    await prisma.unit.upsert({
      where: { id: unit.id },
      create: {
        id: unit.id,
        order: unit.order,
        title: unit.title,
        description: unit.description,
        color: unit.color,
        cefrLevel: unit.cefrLevel,
      },
      update: {
        order: unit.order,
        title: unit.title,
        description: unit.description,
        color: unit.color,
        cefrLevel: unit.cefrLevel,
      },
    });

    for (const lesson of unit.lessons) {
      await prisma.lesson.upsert({
        where: { id: lesson.id },
        create: {
          id: lesson.id,
          unitId: unit.id,
          order: lesson.order,
          title: lesson.title,
          description: lesson.description,
          xpReward: lesson.xpReward,
        },
        update: {
          unitId: unit.id,
          order: lesson.order,
          title: lesson.title,
          description: lesson.description,
          xpReward: lesson.xpReward,
        },
      });
      for (const exercise of lesson.exercises) {
        await prisma.exercise.upsert({
          where: { id: exercise.id },
          create: {
            id: exercise.id,
            lessonId: lesson.id,
            order: exercise.order,
            type: exercise.type,
            prompt: exercise.prompt,
            data: toJson(exercise.data),
            answer: toJson(exercise.answer),
            explanation: exercise.explanation,
          },
          update: {
            lessonId: lesson.id,
            order: exercise.order,
            type: exercise.type,
            prompt: exercise.prompt,
            data: toJson(exercise.data),
            answer: toJson(exercise.answer),
            explanation: exercise.explanation,
          },
        });
      }
    }
  }

  for (const topic of grammarTopics) {
    await prisma.grammarTopic.upsert({
      where: { id: topic.id },
      create: {
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        summary: topic.summary,
        explanation: topic.explanation,
        order: topic.order,
        cefrLevel: topic.cefrLevel,
      },
      update: {
        slug: topic.slug,
        title: topic.title,
        summary: topic.summary,
        explanation: topic.explanation,
        order: topic.order,
        cefrLevel: topic.cefrLevel,
      },
    });
    for (const exercise of topic.exercises) {
      await prisma.exercise.upsert({
        where: { id: exercise.id },
        create: {
          id: exercise.id,
          grammarTopicId: topic.id,
          order: exercise.order,
          type: exercise.type,
          prompt: exercise.prompt,
          data: toJson(exercise.data),
          answer: toJson(exercise.answer),
          explanation: exercise.explanation,
        },
        update: {
          grammarTopicId: topic.id,
          order: exercise.order,
          type: exercise.type,
          prompt: exercise.prompt,
          data: toJson(exercise.data),
          answer: toJson(exercise.answer),
          explanation: exercise.explanation,
        },
      });
    }
  }

  for (const item of vocabulary) {
    await prisma.vocabularyItem.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }
}

seedContent()
  .then(() => {
    process.stdout.write("Contenido inicial actualizado.\n");
  })
  .catch(() => {
    process.stderr.write("No se pudo cargar el contenido inicial.\n");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
