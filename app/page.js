import { connectDB } from "@/app/lib/db";
import Category from "@/app/models/Category";
import Prompt from "@/app/models/Prompt";
import HomeClient from "@/app/components/HomeClient";

export const dynamic = "force-dynamic";

async function loadHomeData() {
  try {
    await connectDB();
    
    const cats = await Category.find({}).sort({ name: 1 }).lean();
    
    const aggregationResult = await Prompt.aggregate([
      {
        $facet: {
          categoryCounts: [
            { $group: { _id: "$category", count: { $sum: 1 } } }
          ],
          totalCount: [
            { $count: "total" }
          ]
        }
      }
    ]);

    const categoryCountsArray = aggregationResult[0]?.categoryCounts || [];
    const totalPromptsCount = aggregationResult[0]?.totalCount[0]?.total || 0;

    const countMap = new Map(categoryCountsArray.map((c) => [c._id, c.count]));
    
    const categoriesWithCount = cats.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: countMap.get(c.name) || 0,
    }));

    return {
      categories: categoriesWithCount,
      totalPrompts: totalPromptsCount
    };

  } catch (e) {
    console.warn("[home] DB unavailable, falling back to empty list:", e.message);
    return { categories: [], totalPrompts: 0 };
  }
}

export default async function Home() {
  const { categories, totalPrompts } = await loadHomeData();
  
  return <HomeClient categories={categories} totalPrompts={totalPrompts} />;
}