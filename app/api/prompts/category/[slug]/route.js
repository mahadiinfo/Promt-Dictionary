import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Prompt from "@/app/models/Prompt";

// GET /api/prompts/category/[slug]
export async function GET(_req, { params }) {
  await connectDB();
  const { slug } = await params;
  const rx = new RegExp(`^${slug.replace(/-/g, "[- ]")}$`, "i");
  const prompts = await Prompt.find({ category: rx })
    .sort({ numberInt: 1 })
    .lean();
  return NextResponse.json({ prompts });
}
