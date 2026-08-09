import { connectDB } from "@/app/lib/db";
import Prompt from "@/app/models/Prompt";
import Category from "@/app/models/Category";
import PromptsAdminClient from "@/app/components/admin/PromptsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
  await connectDB();
  const [prompts, categories] = await Promise.all([
    Prompt.find({}).sort({ category: 1, numberInt: 1 }).lean(),
    Category.find({}).sort({ name: 1 }).lean(),
  ]);
  const plain = prompts.map((p) => ({
    id: String(p._id),
    number: p.number,
    title: p.title,
    category: p.category,
    tags: p.tags || [],
    prompt: p.prompt,
  }));
  const cats = categories.map((c) => ({ name: c.name, slug: c.slug }));
  return <PromptsAdminClient prompts={plain} categories={cats} />;
}
