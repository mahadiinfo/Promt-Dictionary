import { notFound } from "next/navigation";
import { connectDB } from "@/app/lib/db";
import Category from "@/app/models/Category";
import Prompt from "@/app/models/Prompt";
import CategoryClient from "@/app/components/CategoryClient";

export const revalidate = 300;

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  await connectDB();
  const category = await Category.findOne({ slug: slug }).lean();
  if (!category) return notFound();
  const prompts = await Prompt.find({ category: category.name })
    .sort({ numberInt: 1 })
    .lean();

  const plain = prompts.map((p) => ({
    id: String(p._id),
    number: p.number,
    numberInt: p.numberInt,
    title: p.title,
    category: p.category,
    tags: p.tags || [],
    prompt: p.prompt,
  }));

  return (
    <CategoryClient
      category={{ name: category.name, slug: category.slug }}
      prompts={plain}
    />
  );
}
