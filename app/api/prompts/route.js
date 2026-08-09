import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Prompt from "@/app/models/Prompt";
import Category from "@/app/models/Category";

// GET /api/prompts?category=Writing&q=xxx
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const filter = {};
  if (category) filter.category = category;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { title: rx },
      { prompt: rx },
      { tags: rx },
      { category: rx },
      { number: rx },
    ];
  }
  const prompts = await Prompt.find(filter).sort({ category: 1, numberInt: 1 }).lean();
  return NextResponse.json({ prompts });
}

async function nextNumberInt(category) {
  const top = await Prompt.findOne({ category }).sort({ numberInt: -1 }).lean();
  return (top?.numberInt || 0) + 1;
}

// POST /api/prompts  { title, category, tags, prompt }
export async function POST(req) {
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const { title, category, tags = [], prompt } = body;
  if (!title || !category || !prompt) {
    return NextResponse.json({ error: "title, category and prompt are required" }, { status: 400 });
  }

  // Ensure category record exists
  const slug = String(category).toLowerCase().replace(/\s+/g, "-");
  await Category.updateOne(
    { slug },
    { $setOnInsert: { name: category, slug } },
    { upsert: true }
  );

  // Retry loop to avoid race conditions on numberInt
  for (let i = 0; i < 5; i++) {
    const n = await nextNumberInt(category);
    try {
      const doc = await Prompt.create({
        title,
        category,
        tags: Array.isArray(tags) ? tags : [],
        prompt,
        numberInt: n,
        number: `#${n}`,
      });
      return NextResponse.json({ prompt: doc }, { status: 201 });
    } catch (e) {
      if (e?.code !== 11000) throw e;
      // duplicate key -> try again
    }
  }
  return NextResponse.json({ error: "Could not allocate prompt number" }, { status: 500 });
}
