"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/app/hooks/useCopy";
import { useToast } from "./Toast";

export default function CopyButton({ text, label = "Copy" }) {
  const { copied, copy } = useCopy();
  const { show } = useToast();

  return (
    <button
      onClick={async () => {
        const ok = await copy(text);
        if (ok) show("Copied Successfully");
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-brand-soft)]"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
