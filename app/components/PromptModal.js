"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import PromptEditor from "./prompt-editor/PromptEditor";

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export default function PromptModal({
  prompt,
  open,
  onClose,
  prevPrompt,
  nextPrompt,
  onPrev,
  onNext,
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Reset fullscreen when modal reopens on a different prompt
  useEffect(() => {
    if (!open) setFullscreen(false);
  }, [open, prompt?.id]);

  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(modalRef.current);
      if (focusable.length) focusable[0].focus();
    }, 10);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (fullscreen) {
          event.preventDefault();
          setFullscreen(false);
          return;
        }
        event.preventDefault();
        onClose?.();
        return;
      }
      // Don't hijack arrow keys while the user is typing.
      if (isTypingTarget(event.target)) return;

      if (event.key === "ArrowLeft" && prevPrompt) {
        onPrev?.();
        return;
      }
      if (event.key === "ArrowRight" && nextPrompt) {
        onNext?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(modalRef.current);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElement.current?.focus?.();
    };
  }, [open, onClose, onPrev, onNext, prevPrompt, nextPrompt, fullscreen]);

  const sizeClasses = fullscreen
    ? "max-h-screen h-screen w-screen max-w-none rounded-none sm:rounded-none"
    : "max-h-[95vh] w-full max-w-5xl sm:max-h-[calc(100vh-3rem)] rounded-t-2xl sm:rounded-2xl";

  return (
    <AnimatePresence>
      {open && prompt && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          <motion.div
            className={`absolute inset-0 flex justify-center ${
              fullscreen ? "items-stretch p-0" : "items-end p-0 sm:items-center sm:p-4 md:p-6"
            }`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-modal-title"
            aria-describedby="prompt-modal-description"
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl ${sizeClasses}`}
            >
              {/* Header — unchanged */}
              <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-[var(--color-brand-soft)] px-2 py-0.5 font-mono font-semibold text-[var(--color-fg)]">
                      {prompt.number}
                    </span>
                    <span className="text-[var(--color-muted)]">·</span>
                    <span className="text-[var(--color-muted)]">{prompt.category}</span>
                    {prompt.page != null && (
                      <>
                        <span className="text-[var(--color-muted)]">·</span>
                        <span className="text-[var(--color-muted)]">page {prompt.page}</span>
                      </>
                    )}
                  </div>
                  <h2
                    id="prompt-modal-title"
                    className="mt-2 text-lg font-semibold tracking-tight text-[var(--color-fg)] sm:text-2xl"
                  >
                    {prompt.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-fg)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Body — smart prompt editor */}
              <div
                id="prompt-modal-description"
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <PromptEditor
                    prompt={prompt}
                    isFullscreen={fullscreen}
                    onToggleFullscreen={() => setFullscreen((f) => !f)}
                  />
                </div>

                {prompt.tags?.length > 0 && (
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-t border-[var(--color-border)] px-4 py-2 sm:px-6">
                    {prompt.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted)]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer — prev/next only (editor owns copy) */}
              <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3 sm:px-6 sm:py-4">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!prevPrompt}
                  className="inline-flex items-center cursor-pointer gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-brand-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!nextPrompt}
                  className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-brand-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </footer>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
