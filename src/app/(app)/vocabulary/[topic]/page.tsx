import { VocabularyTopicPage } from "@/components/vocabulary-pages";

export default async function VocabularyTopicRoute({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  return <VocabularyTopicPage topic={topic} />;
}
