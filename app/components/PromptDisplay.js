// Lightweight preview: strips markdown syntax and clips to a short
// snippet. Avoids shipping react-markdown / remark-gfm to the client
// (huge JS savings on the category route). The preview container is
// only h-20 (~80px) so full markdown rendering isn't visible anyway.

function stripMarkdown(src = "") {
  return src
    // fenced code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // inline code
    .replace(/`([^`]+)`/g, "$1")
    // images ![alt](url) and links [text](url)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // headings, blockquotes, list markers
    .replace(/^\s{0,3}(#{1,6}|>|-|\*|\+|\d+\.)\s+/gm, "")
    // bold/italic markers
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // horizontal rules
    .replace(/^\s*([-*_])\1{2,}\s*$/gm, "")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export default function PromptDisplay({ text = "" }) {
  const preview = stripMarkdown(text).slice(0, 260);
  return (
    <div className="prompt-prose h-20 overflow-hidden">
      <p className="my-3 whitespace-pre-wrap leading-relaxed text-[var(--color-fg)]/90">
        {preview}
      </p>
    </div>
  );
}
