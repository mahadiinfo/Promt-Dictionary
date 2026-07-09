import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Category, { slugify } from "@/app/models/Category";
import Prompt from "@/app/models/Prompt";

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = await params;
  const { name } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const cat = await Category.findById(id);
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const oldName = cat.name;
  cat.name = name;
  cat.slug = slugify(name);
  await cat.save();
  // Propagate rename to prompts
  await Prompt.updateMany({ category: oldName }, { $set: { category: name } });
  return NextResponse.json({ category: cat });
}

export async function DELETE(_req, { params }) {
  await connectDB();
  const { id } = await params;
  const cat = await Category.findById(id);
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const count = await Prompt.countDocuments({ category: cat.name });
  if (count > 0) {
    return NextResponse.json(
      { error: `Category has ${count} prompts. Delete or move them first.` },
      { status: 400 }
    );
  }
  await cat.deleteOne();
  return NextResponse.json({ ok: true });
}
