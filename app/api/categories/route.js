import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Category, { slugify } from "@/app/models/Category";
import Prompt from "@/app/models/Prompt";

export async function GET() {
  await connectDB();
  const cats = await Category.find({}).sort({ name: 1 }).lean();
  const counts = await Prompt.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [c._id, c.count]));
  return NextResponse.json({
    categories: cats.map((c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      count: map.get(c.name) || 0,
    })),
  });
}

export async function POST(req) {
  await connectDB();
  const { name } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const slug = slugify(name);
  try {
    const doc = await Category.create({ name, slug });
    return NextResponse.json({ category: doc }, { status: 201 });
  } catch (e) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    throw e;
  }
}
