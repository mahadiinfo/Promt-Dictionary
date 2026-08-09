export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Highlight matched terms inside a string. Returns array of {text, hit} chunks.
export function highlight(text, query) {
  if (!query) return [{ text, hit: false }];
  const parts = query
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp);
  if (parts.length === 0) return [{ text, hit: false }];
  const re = new RegExp(`(${parts.join("|")})`, "gi");
  const chunks = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) chunks.push({ text: text.slice(last, m.index), hit: false });
    chunks.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) chunks.push({ text: text.slice(last), hit: false });
  return chunks;
}
