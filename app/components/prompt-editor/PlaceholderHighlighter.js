"use client";

import { forwardRef, useEffect, useMemo, useRef } from "react";
import { TYPE_STYLES, tokenizePrompt } from "./utils";

// Renders the (already variable-substituted) prompt text with placeholder
// badges highlighted. Search matches are wrapped in <mark class="search-hit">.
// `activePhId` gets a glowing brand ring.
const PlaceholderHighlighter = forwardRef(function PlaceholderHighlighter(
  {
    text,
    values,
    originalText,
    search,
    activeMatchIndex,
    activePhKey,
    onPlaceholderClick,
    lineNumbers = false,
    onMatchesChange,
  },
  ref
) {
  // Build a combined structure so we can highlight both placeholders AND
  // search hits without the two collisions fighting each other.
  //
  // Strategy: tokenize the ORIGINAL prompt (so placeholder positions are
  // stable) and, for each text/placeholder chunk, apply search highlighting
  // on the *rendered* string (which may be a filled value).
  const tokens = useMemo(() => tokenizePrompt(originalText), [originalText]);

  const matchesRef = useRef([]);
  matchesRef.current = [];

  const rendered = useMemo(() => {
    const nodes = [];
    tokens.forEach((tok, i) => {
      if (tok.kind === "text") {
        nodes.push(
          <SearchableText
            key={`t-${i}`}
            text={tok.text}
            search={search}
            matchesRef={matchesRef}
          />
        );
      } else {
        const filled = values?.[tok.raw];
        const isFilled = filled && filled.length > 0;
        const style = TYPE_STYLES[tok.phType] || TYPE_STYLES.square;
        const isActive = activePhKey === tok.raw;
        nodes.push(
          <button
            key={tok.phId}
            type="button"
            data-ph-id={tok.phId}
            data-ph-key={tok.raw}
            onClick={(e) => {
              e.stopPropagation();
              onPlaceholderClick?.(tok.raw, tok.phId);
            }}
            className="mx-[1px] inline-flex max-w-full items-center whitespace-pre-wrap break-words rounded-md border px-1.5 py-0.5 text-[0.95em] font-medium align-baseline transition hover:scale-[1.02]"
            style={{
              background: style.bg,
              borderColor: style.border,
              color: style.text,
              boxShadow: isActive
                ? `0 0 0 2px var(--color-brand-soft), 0 0 0 3px ${style.border}`
                : undefined,
            }}
            title={isFilled ? `${tok.phName} · click to edit` : tok.phName}
          >
            {isFilled ? (
              <SearchableText text={filled} search={search} matchesRef={matchesRef} />
            ) : (
              <span className="opacity-90">{tok.raw}</span>
            )}
          </button>
        );
      }
    });
    return nodes;
  }, [tokens, values, search, activePhKey, onPlaceholderClick]);

  // Report new match count / active scroll each render.
  useEffect(() => {
    onMatchesChange?.(matchesRef.current.length);
    if (search && matchesRef.current[activeMatchIndex]) {
      matchesRef.current[activeMatchIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      matchesRef.current.forEach((el, i) => {
        if (!el) return;
        el.style.outline = i === activeMatchIndex ? "2px solid var(--color-brand)" : "none";
        el.style.borderRadius = "2px";
      });
    }
  }, [rendered, search, activeMatchIndex, onMatchesChange]);

  // Line numbers pane
  const lineCount = useMemo(() => {
    const filled = tokens
      .map((t) => (t.kind === "text" ? t.text : values?.[t.raw] || t.text))
      .join("");
    return filled.split("\n").length;
  }, [tokens, values]);

  return (
    <div
      ref={ref}
      className="relative flex gap-3 whitespace-pre-wrap break-words rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm leading-relaxed text-[var(--color-fg)]/90 sm:p-5"
    >
      {lineNumbers && (
        <div className="hidden select-none border-r border-[var(--color-border)] pr-3 text-right font-mono text-xs leading-relaxed text-[var(--color-muted)]/70 sm:block">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}
      <div className="min-w-0 flex-1 whitespace-pre-wrap break-words">{rendered}</div>
    </div>
  );
});

function SearchableText({ text, search, matchesRef }) {
  if (!search) return <>{text}</>;
  const q = search;
  const parts = [];
  let last = 0;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  if (!needle) return <>{text}</>;
  let idx = lower.indexOf(needle);
  let n = 0;
  while (idx !== -1) {
    if (idx > last) parts.push(<span key={`p-${n}-t`}>{text.slice(last, idx)}</span>);
    parts.push(
      <mark
        key={`p-${n}-m`}
        className="search-hit"
        ref={(el) => {
          if (el) matchesRef.current.push(el);
        }}
      >
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    last = idx + q.length;
    idx = lower.indexOf(needle, last);
    n++;
  }
  if (last < text.length) parts.push(<span key={`p-end`}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

export default PlaceholderHighlighter;
