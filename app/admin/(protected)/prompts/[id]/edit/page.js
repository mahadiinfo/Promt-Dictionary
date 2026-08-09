import { notFound } from "next/navigation";
import { connectDB } from "@/app/lib/db";
import Prompt from "@/app/models/Prompt";
import Category from "@/app/models/Category";
import PromptForm from "@/app/components/admin/PromptForm";

export const dynamic = "force-dynamic";

export default async function EditPromptPage({ params }) {
  const { id } = await params;
  await connectDB();
  const doc = await Prompt.findById(id).lean();
  if (!doc) return notFound();
  const cats = await Category.find({}).sort({ name: 1 }).lean();
  const initial = {
    id: String(doc._id),
    number: doc.number,
    title: doc.title,
    category: doc.category,
    tags: doc.tags || [],
    prompt: doc.prompt,
  };
  return (
    <div>
      <h1
        className="mb-6 text-3xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Edit prompt
      </h1>
      <PromptForm
        categories={cats.map((c) => ({ name: c.name, slug: c.slug }))}
        initial={initial}
      />
    </div>
  );
}
