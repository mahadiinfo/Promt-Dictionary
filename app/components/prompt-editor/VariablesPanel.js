"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Download,
  Eraser,
  Save,
  Trash2,
  Upload,
  Wand2,
  BookmarkPlus,
  ChevronDown,
} from "lucide-react";
import { TYPE_STYLES, presetsKey } from "./utils";

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
  onLoadPreset,
}) {
  const fileRef = useRef(null);
  const [presets, setPresets] = useState({});
  const [presetName, setPresetName] = useState("");
  const [presetOpen, setPresetOpen] = useState(false);

  const total = variables.length;
  const filled = useMemo(
    () => variables.filter((v) => values[v.key] && values[v.key].length > 0).length,
    [variables, values]
  );
  const remaining = total - filled;
  const percent = total === 0 ? 100 : Math.round((filled / total) * 100);

  // Load presets
  useEffect(() => {
    try {
      const raw = localStorage.getItem(presetsKey());
      if (raw) setPresets(JSON.parse(raw));
    } catch {}
  }, []);

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const next = { ...presets, [name]: values };
    setPresets(next);
    localStorage.setItem(presetsKey(), JSON.stringify(next));
    setPresetName("");
  };

  const deletePreset = (name) => {
    const next = { ...presets };
    delete next[name];
    setPresets(next);
    localStorage.setItem(presetsKey(), JSON.stringify(next));
  };

  const presetNames = Object.keys(presets);

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[var(--color-surface)]">
      {/* Header with completion */}
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Variables
          </div>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-muted)]">
            {filled}/{total}
          </span>
        </div>

        <div className="mt-2">
          {total === 0 ? (
            <div className="text-xs text-[var(--color-muted)]">No placeholders detected</div>
          ) : remaining === 0 ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Prompt Ready
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs text-[var(--color-fg)]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {remaining} remaining
            </div>
          )}

          {total > 0 && (
            <div className="mt-2">
              <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-emerald-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
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
              } catch {}
              e.target.value = "";
            };
            r.readAsText(f);
          }}
        />
      </div>

      {/* Presets */}
      <div className="border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setPresetOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] transition hover:text-[var(--color-fg)]"
        >
          <span className="inline-flex items-center gap-1.5">
            <BookmarkPlus className="h-3 w-3" /> Presets ({presetNames.length})
          </span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${presetOpen ? "rotate-180" : ""}`}
          />
        </button>
        {presetOpen && (
          <div className="space-y-2 px-3 pb-3">
            <div className="flex items-center gap-1">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name"
                className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[11px] outline-none focus:border-[var(--color-brand)]"
              />
              <button
                type="button"
                onClick={savePreset}
                disabled={!presetName.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent)] px-2 py-1 text-[10px] font-semibold text-[var(--color-bg)] transition hover:opacity-90 disabled:opacity-40"
              >
                <Save className="h-3 w-3" /> Save
              </button>
            </div>
            {presetNames.length > 0 && (
              <div className="max-h-32 space-y-1 overflow-y-auto">
                {presetNames.map((name) => (
                  <div
                    key={name}
                    className="group flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
                  >
                    <button
                      type="button"
                      onClick={() => onLoadPreset?.(presets[name])}
                      className="min-w-0 flex-1 truncate text-left text-[11px] text-[var(--color-fg)] hover:text-[var(--color-brand)]"
                      title={`Load "${name}"`}
                    >
                      {name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePreset(name)}
                      className="opacity-0 transition group-hover:opacity-100"
                      title="Delete preset"
                    >
                      <Trash2 className="h-3 w-3 text-[var(--color-muted)] hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Variable list */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {total === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-center">
            <p className="text-xs text-[var(--color-muted)]">
              No placeholders found. Wrap editable spots in{" "}
              <code className="rounded bg-[var(--color-bg)] px-1">[brackets]</code>,{" "}
              <code className="rounded bg-[var(--color-bg)] px-1">{`{braces}`}</code>,{" "}
              <code className="rounded bg-[var(--color-bg)] px-1">{`{{doubles}}`}</code>,{" "}
              <code className="rounded bg-[var(--color-bg)] px-1">{`<angles>`}</code>, or use
              natural phrases like <em>Your Name</em>, <em>Website URL</em>.
            </p>
          </div>
        )}
        {variables.map((v) => {
          const style = TYPE_STYLES[v.type] || TYPE_STYLES.square;
          const val = values[v.key] || "";
          const isActive = activePhKey === v.key;
          const isFilled = val.length > 0;
          return (
            <div
              key={v.key}
              className={`rounded-lg border p-2 transition ${
                isActive
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]/40 shadow-sm"
                  : "border-transparent hover:border-[var(--color-border)]"
              }`}
            >
              <label className="mb-1.5 flex items-center gap-2 text-[11px] font-medium">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: style.border }}
                />
                <span className="min-w-0 flex-1 truncate text-[var(--color-fg)]">
                  {v.name}
                </span>
                <span
                  className="rounded px-1 font-mono text-[9px] uppercase"
                  style={{ background: style.bg, color: style.text }}
                >
                  {style.label}
                </span>
                {isFilled ? (
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
                className="w-full resize-y rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs leading-relaxed text-[var(--color-fg)] outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-soft)]"
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
      className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[10px] font-medium text-[var(--color-fg)] transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
    >
      {icon}
      {children}
    </button>
  );
}
