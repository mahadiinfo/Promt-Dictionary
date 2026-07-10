"use client";

import { useMemo, useRef } from "react";
import { CheckCircle2, Circle, Download, Eraser, Upload, Wand2 } from "lucide-react";
import { TYPE_STYLES } from "./utils";

export default function VariablesPanel({
  variables,
  values,
  onChange,
  activePhKey,
  onActivate,
  onClearAll,
  onFillDemo,
  onImportJSON,
  onExportJSON,
}) {
  const fileRef = useRef(null);
  const total = variables.length;
  const filled = useMemo(
    () => variables.filter((v) => values[v.key] && values[v.key].length > 0).length,
    [variables, values]
  );
  const remaining = total - filled;
  const percent = total === 0 ? 100 : Math.round((filled / total) * 100);

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Variables
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-fg)]">
            {total === 0 ? (
              "None detected"
            ) : remaining === 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Prompt ready
              </span>
            ) : (
              <>
                <span className="font-mono">{filled}</span>
                <span className="text-[var(--color-muted)]"> / </span>
                <span className="font-mono">{total}</span>
                <span className="text-[var(--color-muted)]"> filled</span>
              </>
            )}
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="border-b border-[var(--color-border)] px-4 py-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand)] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-[var(--color-muted)]">{percent}% complete</div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] px-3 py-2">
        <ToolBtn onClick={onFillDemo} icon={<Wand2 className="h-3 w-3" />}>Demo</ToolBtn>
        <ToolBtn onClick={onClearAll} icon={<Eraser className="h-3 w-3" />}>Clear</ToolBtn>
        <ToolBtn onClick={() => fileRef.current?.click()} icon={<Upload className="h-3 w-3" />}>
          Import
        </ToolBtn>
        <ToolBtn onClick={onExportJSON} icon={<Download className="h-3 w-3" />}>Export</ToolBtn>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              try {
                onImportJSON(JSON.parse(String(r.result)));
              } catch {
                /* ignore */
              }
              e.target.value = "";
            };
            r.readAsText(f);
          }}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {total === 0 && (
          <p className="text-xs text-[var(--color-muted)]">
            No placeholders found. Wrap editable spots in <code>[brackets]</code>,{" "}
            <code>{`{braces}`}</code>, <code>{`{{doubles}}`}</code>, or{" "}
            <code>{`<angles>`}</code>.
          </p>
        )}
        {variables.map((v) => {
          const style = TYPE_STYLES[v.type] || TYPE_STYLES.square;
          const val = values[v.key] || "";
          const isActive = activePhKey === v.key;
          return (
            <div key={v.key} className={isActive ? "-mx-1 rounded-lg bg-[var(--color-brand-soft)]/50 p-1" : ""}>
              <label className="mb-1 flex items-center gap-2 text-[11px] font-medium">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: style.border }}
                />
                <span className="min-w-0 flex-1 truncate text-[var(--color-fg)]">
                  {v.name}
                </span>
                {val ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Circle className="h-3 w-3 text-[var(--color-muted)]" />
                )}
              </label>
              <textarea
                value={val}
                onChange={(e) => onChange(v.key, e.target.value)}
                onFocus={() => onActivate(v.key)}
                rows={1}
                placeholder={v.name}
                className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs outline-none transition focus:border-[var(--color-brand)]"
                style={{ minHeight: "2rem" }}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ToolBtn({ children, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[10px] font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-brand-soft)]"
    >
      {icon}
      {children}
    </button>
  );
}
