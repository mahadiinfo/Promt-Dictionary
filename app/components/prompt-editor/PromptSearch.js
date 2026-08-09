"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronUp, ChevronDown, X, Replace } from "lucide-react";

export default function PromptSearch({
  query,
  onQuery,
  matchCount,
  activeIndex,
  onPrev,
  onNext,
  onClose,
  replaceMode,
  onToggleReplace,
  replaceValue,
  onReplaceValue,
  onReplace,
  onReplaceAll,
}) {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Search className="ml-1 h-3.5 w-3.5 shrink-0 text-[var(--color-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Find in prompt"
          className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-[var(--color-muted)]"
        />
        <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-[var(--color-muted)]">
          {matchCount ? `${activeIndex + 1}/${matchCount}` : "0/0"}
        </span>
        <IconBtn onClick={onPrev} disabled={!matchCount} title="Previous">
          <ChevronUp className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn onClick={onNext} disabled={!matchCount} title="Next">
          <ChevronDown className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn onClick={onToggleReplace} title="Replace" active={replaceMode}>
          <Replace className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn onClick={onClose} title="Close">
          <X className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
      {replaceMode && (
        <div className="flex items-center gap-1.5">
          <span className="ml-1 w-3.5" />
          <input
            value={replaceValue}
            onChange={(e) => onReplaceValue(e.target.value)}
            placeholder="Replace with"
            className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-[var(--color-muted)]"
          />
          <button
            onClick={onReplace}
            className="rounded px-2 py-0.5 text-[10px] font-medium text-[var(--color-fg)] hover:bg-[var(--color-brand-soft)]"
          >
            Replace
          </button>
          <button
            onClick={onReplaceAll}
            className="rounded px-2 py-0.5 text-[10px] font-medium text-[var(--color-fg)] hover:bg-[var(--color-brand-soft)]"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, disabled, title, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-fg)] disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-[var(--color-brand-soft)] text-[var(--color-fg)]" : ""
      }`}
    >
      {children}
    </button>
  );
}
