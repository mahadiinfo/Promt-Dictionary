"use client";

import { forwardRef, useEffect, useMemo, useRef } from "react";
import { TYPE_STYLES, tokenizePrompt } from "./utils";

const PlaceholderHighlighter = forwardRef(function PlaceholderHighlighter(
  {
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
        const dedupeKey = tok.phType === "natural" ? tok.raw.toLowerCase() : tok.raw;
        const filled = values?.[dedupeKey];
        const isFilled = filled && filled.length > 0;
        const style = TYPE_STYLES[tok.phType] || TYPE_STYLES.square;
        const isActive = activePhKey === dedupeKey;
        nodes.push(
          <button
            key={tok.phId}
            type="button"
            data-ph-id={tok.phId}
            data-ph-key={dedupeKey}
            onClick={(e) => {
              e.stopPropagation();
              onPlaceholderClick?.(dedupeKey, tok.phId);
            }}
            className="group mx-[1px] inline-flex max-w-full items-center gap-1 whitespace-pre-wrap break-words rounded-md border px-1.5 py-[1px] text-[0.95em] font-medium align-baseline transition-all duration-150 hover:-translate-y-[1px] hover:shadow-sm"
            style={{
              background: style.bg,
              borderColor: style.border,
              color: style.text,
              boxShadow: isActive
                ? `0 0 0 2px var(--color-brand-soft), 0 0 0 3px ${style.border}`
                : undefined,
            }}
            title={isFilled ? `${tok.phName} · click to edit` : `${tok.phName} · empty`}
          >
            {isFilled ? (
              <SearchableText text={filled} search={search} matchesRef={matchesRef} />
            ) : (
              <span className="opacity-90">
                {tok.phType === "natural" ? `⟨ ${tok.phName} ⟩` : tok.raw}
              </span>
            )}
          </button>
        );
      }
    });
    return nodes;
  }, [tokens, values, search, activePhKey, onPlaceholderClick]);

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

  const lineCount = useMemo(() => {
    const filled = tokens
      .map((t) => {
        if (t.kind === "text") return t.text;
        const key = t.phType === "natural" ? t.raw.toLowerCase() : t.raw;
        return values?.[key] || t.text;
      })
      .join("");
    return filled.split("\n").length;
  }, [tokens, values]);

  return (
    <div
      ref={ref}
      className="relative flex gap-3 whitespace-pre-wrap break-words rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-[13.5px] leading-[1.75] text-[var(--color-fg)]/90 sm:p-5 sm:text-sm"
    >
      {lineNumbers && (
        <div className="hidden select-none border-r border-[var(--color-border)] pr-3 text-right font-mono text-xs leading-[1.75] text-[var(--color-muted)]/60 sm:block">
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
        className="rounded-[3px] bg-[var(--color-brand)]/40 px-[1px] text-[var(--color-fg)]"
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
