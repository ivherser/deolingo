import { GrammarTopicPage } from "@/components/grammar-pages";

export default async function GrammarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GrammarTopicPage slug={slug} />;
}
