import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Prompt from "@/app/models/Prompt";
import Category from "@/app/models/Category";

export async function GET(_req, { params }) {
  await connectDB();
  const { id } = await params;
  const doc = await Prompt.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ prompt: doc });
}

async function nextNumberInt(category) {
  const top = await Prompt.findOne({ category }).sort({ numberInt: -1 }).lean();
  return (top?.numberInt || 0) + 1;
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = await params;
  const existing = await Prompt.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { title, category, tags, prompt } = body;

  if (title !== undefined) existing.title = title;
  if (tags !== undefined) existing.tags = Array.isArray(tags) ? tags : [];
  if (prompt !== undefined) existing.prompt = prompt;

  if (category && category !== existing.category) {
    // Assign next number in new category
    const slug = String(category).toLowerCase().replace(/\s+/g, "-");
    await Category.updateOne(
      { slug },
      { $setOnInsert: { name: category, slug } },
      { upsert: true }
    );
    existing.category = category;
    for (let i = 0; i < 5; i++) {
      const n = await nextNumberInt(category);
      existing.numberInt = n;
      existing.number = `#${n}`;
      try {
        await existing.save();
        return NextResponse.json({ prompt: existing });
      } catch (e) {
        if (e?.code !== 11000) throw e;
      }
    }
    return NextResponse.json({ error: "Could not allocate number" }, { status: 500 });
  }

  await existing.save();
  return NextResponse.json({ prompt: existing });
}

export async function DELETE(_req, { params }) {
  await connectDB();
  const { id } = await params;
  const res = await Prompt.findByIdAndDelete(id);
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
