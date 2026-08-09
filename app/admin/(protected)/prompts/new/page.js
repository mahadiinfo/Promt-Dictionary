import { connectDB } from "@/app/lib/db";
import Category from "@/app/models/Category";
import PromptForm from "@/app/components/admin/PromptForm";

export const dynamic = "force-dynamic";

export default async function NewPromptPage() {
  await connectDB();
  const cats = await Category.find({}).sort({ name: 1 }).lean();
  const categories = cats.map((c) => ({ name: c.name, slug: c.slug }));
  return (
    <div>
      <h1
        className="mb-6 text-3xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Add prompt
      </h1>
      <PromptForm categories={categories} />
    </div>
  );
}
