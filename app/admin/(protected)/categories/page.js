import { connectDB } from "@/app/lib/db";
import Category from "@/app/models/Category";
import Prompt from "@/app/models/Prompt";
import CategoriesAdminClient from "@/app/components/admin/CategoriesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await connectDB();
  const cats = await Category.find({}).sort({ name: 1 }).lean();
  const counts = await Prompt.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [c._id, c.count]));
  const data = cats.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    count: map.get(c.name) || 0,
  }));
  return <CategoriesAdminClient categories={data} />;
}
