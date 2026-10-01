import { ExerciseSession } from "@/components/exercise-session";

export default async function GrammarPracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ExerciseSession mode="practice" grammarSlug={slug} />;
}
