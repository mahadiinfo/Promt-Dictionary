// Placeholder detection and helpers for the Smart Prompt Editor.
// Detects [text], {text}, {{text}}, <text> and natural-language placeholders
// like "Your Name", "Paste your code here", "Website URL", etc.

// Regex captures — matched in this priority order so {{x}} isn't picked up as {x}.
const PATTERNS = [
  { type: "double", re: /\{\{\s*([^{}\n]+?)\s*\}\}/g },
  { type: "curly", re: /\{\s*([^{}\n]+?)\s*\}/g },
  { type: "square", re: /\[\s*([^\[\]\n]+?)\s*\]/g },
  { type: "angle", re: /<\s*([^<>\n]+?)\s*>/g },
];

// Natural-language placeholder phrases. Matched case-insensitively as
// standalone phrases (word boundaries). Kept generic — no hardcoded values.
const NL_PHRASES = [
  "paste your code here",
  "paste code here",
  "paste your text here",
  "paste text here",
  "write here",
  "type here",
  "enter here",
  "your name",
  "your email",
  "your website",
  "your company",
  "your product",
  "your industry",
  "your topic",
  "your goal",
  "your audience",
  "target audience",
  "target keyword",
  "primary keyword",
  "keyword",
  "topic",
  "niche",
  "industry",
  "tone of voice",
  "call to action",
  "insert code",
  "insert text",
  "insert topic",
  "describe your product",
  "describe your business",
];

// Per-type badge styling — pulled from the site palette.
export const TYPE_STYLES = {
  square: {
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.45)",
    text: "rgb(37,99,235)",
    label: "[ ]",
  },
  curly: {
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.45)",
    text: "rgb(147,51,234)",
    label: "{ }",
  },
  double: {
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.45)",
    text: "rgb(5,150,105)",
    label: "{{ }}",
  },
  angle: {
    bg: "rgba(244,63,94,0.10)",
    border: "rgba(244,63,94,0.45)",
    text: "rgb(225,29,72)",
    label: "< >",
  },
  natural: {
    bg: "var(--color-brand-soft)",
    border: "var(--color-brand)",
    text: "var(--color-brand)",
    label: "text",
  },
};

function findNaturalMatches(text) {
  const out = [];
  if (!text) return out;
  // Build one alternation regex.
  const escaped = NL_PHRASES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      start: m.index,
      end: m.index + m[0].length,
      raw: m[0],
      name: m[0].replace(/\s+/g, " ").trim(),
      type: "natural",
    });
  }
  return out;
}

// Tokenize prompt into an array of { kind: "text" | "ph", ... }
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
  matches.push(...findNaturalMatches(text));

  // Sort by start; drop overlapping (prefer earliest, then longer).
  matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
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

// Build unique variable descriptors, keyed by raw placeholder text.
export function extractVariables(tokens) {
  const map = new Map();
  for (const t of tokens) {
    if (t.kind !== "ph") continue;
    // Case-insensitive dedupe key for natural-language matches so
    // "Your Name" / "your name" share one input.
    const key = t.phType === "natural" ? t.raw.toLowerCase() : t.raw;
    if (!map.has(key)) {
      map.set(key, {
        key,
        matchRaw: t.raw,
        name: t.phName,
        type: t.phType,
        occurrences: [t.phId],
      });
    } else {
      map.get(key).occurrences.push(t.phId);
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
      const key = t.phType === "natural" ? t.raw.toLowerCase() : t.raw;
      const v = values[key];
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

export function presetsKey() {
  return `prompt-vault:presets`;
}
