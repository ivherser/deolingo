import { ExerciseSession } from "@/components/exercise-session";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <ExerciseSession mode="lesson" lessonId={lessonId} />;
}
