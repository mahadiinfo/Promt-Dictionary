// Placeholder detection and helpers for the Smart Prompt Editor.
// Detects [text], {text}, {{text}}, <text> — order matters (double-brace first).

// Regex captures — matched in this priority order so {{x}} isn't picked up as {x}.
const PATTERNS = [
  { type: "double", re: /\{\{\s*([^{}\n]+?)\s*\}\}/g, open: "{{", close: "}}" },
  { type: "curly", re: /\{\s*([^{}\n]+?)\s*\}/g, open: "{", close: "}" },
  { type: "square", re: /\[\s*([^\[\]\n]+?)\s*\]/g, open: "[", close: "]" },
  { type: "angle", re: /<\s*([^<>\n]+?)\s*>/g, open: "<", close: ">" },
];

// Per-type styles — all pulled from the site palette, no bright yellow.
export const TYPE_STYLES = {
  square: {
    // Blue
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.45)",
    text: "rgb(37,99,235)",
  },
  curly: {
    // Purple
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.45)",
    text: "rgb(147,51,234)",
  },
  double: {
    // Green
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.45)",
    text: "rgb(5,150,105)",
  },
  angle: {
    // Orange / brand
    bg: "var(--color-brand-soft)",
    border: "var(--color-brand)",
    text: "var(--color-brand)",
  },
};

// Tokenize prompt into an array of { kind: "text" | "ph", text, phId?, phType?, phName? }
export function tokenizePrompt(text) {
  if (!text) return [];
  const matches = [];
  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        raw: m[0],
        name: m[1].trim(),
        type: p.type,
      });
    }
  }
  // Sort by start; drop overlapping (prefer earliest, then longer / more specific first)
  matches.sort((a, b) => a.start - b.start || b.end - a.end - (a.end - a.start));
  const filtered = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    filtered.push(m);
    cursor = m.end;
  }

  const tokens = [];
  let pos = 0;
  let idx = 0;
  for (const m of filtered) {
    if (m.start > pos) tokens.push({ kind: "text", text: text.slice(pos, m.start) });
    tokens.push({
      kind: "ph",
      text: m.raw,
      phId: `ph-${idx++}`,
      phName: m.name,
      phType: m.type,
      raw: m.raw,
    });
    pos = m.end;
  }
  if (pos < text.length) tokens.push({ kind: "text", text: text.slice(pos) });
  return tokens;
}

// Build unique variable descriptors, keyed by raw placeholder text (so
// identical placeholders share one input).
export function extractVariables(tokens) {
  const map = new Map();
  for (const t of tokens) {
    if (t.kind !== "ph") continue;
    if (!map.has(t.raw)) {
      map.set(t.raw, {
        key: t.raw,
        name: t.phName,
        type: t.phType,
        occurrences: [t.phId],
      });
    } else {
      map.get(t.raw).occurrences.push(t.phId);
    }
  }
  return Array.from(map.values());
}

// Apply variable values to the original text.
export function applyValues(text, values) {
  if (!values) return text;
  const tokens = tokenizePrompt(text);
  return tokens
    .map((t) => {
      if (t.kind === "text") return t.text;
      const v = values[t.raw];
      return v && v.length ? v : t.text;
    })
    .join("");
}

// Rough token estimate: ~4 chars per token (OpenAI heuristic).
export function estimateTokens(str) {
  if (!str) return 0;
  return Math.max(1, Math.round(str.length / 4));
}

export function wordCount(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function storageKey(promptId) {
  return `prompt-vault:editor:${promptId}`;
}
