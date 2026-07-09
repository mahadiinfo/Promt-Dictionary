import Fuse from "fuse.js";

export function createFuse(prompts) {
  return new Fuse(prompts, {
    includeScore: true,
    threshold: 0.35,
    ignoreLocation: true,
    keys: [
      { name: "number", weight: 0.8 },
      { name: "title", weight: 1 },
      { name: "category", weight: 0.6 },
      { name: "tags", weight: 0.5 },
      { name: "prompt", weight: 0.4 },
    ],
  });
}

export function searchPrompts(fuse, prompts, query) {
  const q = query.trim();
  if (!q) return prompts;
  return fuse.search(q).map((r) => r.item);
}
