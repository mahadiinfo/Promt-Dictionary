"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders a prompt string preserving formatting. Supports markdown-ish input
// (headings, lists, bold, code) and also gracefully handles plain text with
// blank lines and manual line breaks.
export default function PromptDisplay({ text = "" }) {
  return (
    <div className="prompt-prose h-20 overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => (
            <p className="my-3 whitespace-pre-wrap leading-relaxed" {...props} />
          ),
          h1: (p) => <h3 className="mt-6 mb-2 text-lg font-semibold" {...p} />,
          h2: (p) => <h3 className="mt-6 mb-2 text-lg font-semibold" {...p} />,
          h3: (p) => <h4 className="mt-5 mb-2 text-base font-semibold" {...p} />,
          h4: (p) => <h5 className="mt-4 mb-1.5 text-sm font-semibold" {...p} />,
          ul: (p) => <ul className="my-3 list-disc space-y-1 pl-6" {...p} />,
          ol: (p) => <ol className="my-3 list-decimal space-y-1 pl-6" {...p} />,
          li: (p) => <li className="leading-relaxed" {...p} />,
          strong: (p) => <strong className="font-semibold text-[var(--color-fg)]" {...p} />,
          em: (p) => <em className="italic" {...p} />,
          code: ({ inline, ...p }) =>
            inline ? (
              <code
                className="rounded bg-[var(--color-brand-soft)] px-1.5 py-0.5 font-mono text-[0.85em]"
                {...p}
              />
            ) : (
              <code className="block" {...p} />
            ),
          pre: (p) => (
            <pre
              className="my-3 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs"
              {...p}
            />
          ),
          blockquote: (p) => (
            <blockquote
              className="my-3 border-l-4 border-[var(--color-brand)] pl-4 italic text-[var(--color-muted)]"
              {...p}
            />
          ),
          hr: () => <hr className="my-5 border-[var(--color-border)]" />,
          a: (p) => (
            <a className="text-[var(--color-brand)] underline" target="_blank" rel="noreferrer" {...p} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
