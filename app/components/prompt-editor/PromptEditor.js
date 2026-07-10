"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  Copy,
  Eye,
  FileText,
  Hash,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  RotateCcw,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";
import PlaceholderHighlighter from "./PlaceholderHighlighter";
import PromptSearch from "./PromptSearch";
import VariablesPanel from "./VariablesPanel";
import {
  applyValues,
  estimateTokens,
  extractVariables,
  storageKey,
  tokenizePrompt,
  wordCount,
} from "./utils";
import { useToast } from "../Toast";

function historyReducer(state, action) {
  switch (action.type) {
    case "set": {
      const past = [...state.past.slice(-49), state.present];
      return { past, present: action.value, future: [] };
    }
    case "undo": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    case "reset":
      return { past: [], present: action.value, future: [] };
    default:
      return state;
  }
}

const DEMO_BY_TYPE = {
  square: "Sample value",
  curly: "sample_value",
  double: "sample_variable",
  angle: "example",
  natural: "Example",
};

export default function PromptEditor({ prompt, isFullscreen, onToggleFullscreen }) {
  const { show } = useToast();
  const promptId = prompt?.id ?? prompt?.number ?? "unknown";
  const originalPrompt = prompt?.prompt || "";

  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: originalPrompt,
    future: [],
  });
  const body = history.present;

  const [values, setValues] = useState({});
  const [activePhKey, setActivePhKey] = useState(null);

  const [mode, setMode] = useState("read"); // "edit" = raw textarea, "read" = highlighted with clickable placeholders
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceValue, setReplaceValue] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [activeMatch, setActiveMatch] = useState(0);

  // Load / persist per prompt id.
  const loadedRef = useRef(false);
  useEffect(() => {
    loadedRef.current = false;
    try {
      const raw = localStorage.getItem(storageKey(promptId));
      if (raw) {
        const saved = JSON.parse(raw);
        dispatch({ type: "reset", value: saved.body ?? originalPrompt });
        setValues(saved.values ?? {});
      } else {
        dispatch({ type: "reset", value: originalPrompt });
        setValues({});
      }
    } catch {
      dispatch({ type: "reset", value: originalPrompt });
      setValues({});
    }
    setActivePhKey(null);
    setSearchOpen(false);
    setSearchQuery("");
    setReplaceMode(false);
    setReplaceValue("");
    const t = setTimeout(() => {
      loadedRef.current = true;
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(storageKey(promptId), JSON.stringify({ body, values }));
    } catch {}
  }, [body, values, promptId]);

  const tokens = useMemo(() => tokenizePrompt(body), [body]);
  const variables = useMemo(() => extractVariables(tokens), [tokens]);
  const finalText = useMemo(() => applyValues(body, values), [body, values]);
  const strippedText = useMemo(() => {
    return tokens
      .map((t) => {
        if (t.kind === "text") return t.text;
        const key = t.phType === "natural" ? t.raw.toLowerCase() : t.raw;
        return values[key] || "";
      })
      .join("");
  }, [tokens, values]);

  const stats = useMemo(
    () => ({
      chars: finalText.length,
      words: wordCount(finalText),
      tokens: estimateTokens(finalText),
    }),
    [finalText]
  );

  const totalFilled = variables.filter((v) => values[v.key]).length;
  const remaining = variables.length - totalFilled;
  const percent = variables.length === 0 ? 100 : Math.round((totalFilled / variables.length) * 100);
  const allReady = variables.length === 0 || remaining === 0;

  const setBody = useCallback((v) => dispatch({ type: "set", value: v }), []);
  const onValueChange = useCallback((key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const focusPh = useCallback((key) => {
    setActivePhKey(key);
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-var-key="${CSS.escape(key)}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
    });
  }, []);

  const reset = () => {
    dispatch({ type: "reset", value: originalPrompt });
    setValues({});
    show("Restored original");
  };
  const clearAll = () => {
    setValues({});
    show("Variables cleared");
  };
  const fillDemo = () => {
    const next = { ...values };
    for (const v of variables) {
      if (!next[v.key]) next[v.key] = `${DEMO_BY_TYPE[v.type] || "value"} · ${v.name}`;
    }
    setValues(next);
    show("Demo data filled");
  };

  const doCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      show(label);
    } catch {
      show("Copy failed");
    }
  };

  const importJSON = (obj) => {
    if (!obj || typeof obj !== "object") return;
    const next = { ...values };
    for (const v of variables) {
      if (obj[v.key] != null) next[v.key] = String(obj[v.key]);
      else if (obj[v.name] != null) next[v.key] = String(obj[v.name]);
      else if (obj[v.name.toLowerCase()] != null) next[v.key] = String(obj[v.name.toLowerCase()]);
    }
    setValues(next);
    show("Imported variables");
  };
  const exportJSON = async () => {
    const obj = {};
    for (const v of variables) obj[v.name] = values[v.key] || "";
    await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    show("Copied variables JSON");
  };
  const loadPreset = (presetValues) => {
    setValues({ ...presetValues });
    show("Preset loaded");
  };

  const doReplace = () => {
    if (!searchQuery) return;
    const idx = body.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return;
    setBody(body.slice(0, idx) + replaceValue + body.slice(idx + searchQuery.length));
  };
  const doReplaceAll = () => {
    if (!searchQuery) return;
    const re = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    setBody(body.replace(re, replaceValue));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(true);
        setReplaceMode(false);
      } else if (meta && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setSearchOpen(true);
        setReplaceMode(true);
      } else if (meta && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: "undo" });
      } else if (meta && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: "redo" });
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      } else if (
        e.key === "Tab" &&
        variables.length > 0 &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        const idx = variables.findIndex((v) => v.key === activePhKey);
        const nextIdx = e.shiftKey
          ? (idx - 1 + variables.length) % variables.length
          : (idx + 1) % variables.length;
        focusPh(variables[nextIdx].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, variables, activePhKey, body, focusPh]);

  const variablesPanel = (
    <VariablesPanelWithRefs
      variables={variables}
      values={values}
      onChange={onValueChange}
      activePhKey={activePhKey}
      onActivate={focusPh}
      onClearAll={clearAll}
      onFillDemo={fillDemo}
      onImportJSON={importJSON}
      onExportJSON={exportJSON}
      onLoadPreset={loadPreset}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <div className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-0.5">
            <SegBtn active={mode === "read"} onClick={() => setMode("read")} icon={<Eye className="h-3.5 w-3.5" />}>
              Read
            </SegBtn>
            <SegBtn active={mode === "edit"} onClick={() => setMode("edit")} icon={<Pencil className="h-3.5 w-3.5" />}>
              Edit
            </SegBtn>
          </div>
          <ToolbarBtn onClick={() => setSearchOpen((s) => !s)} icon={<SearchIcon className="h-3.5 w-3.5" />} active={searchOpen}>
            <span className="hidden sm:inline">Find</span>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => setLineNumbers((v) => !v)} icon={<Hash className="h-3.5 w-3.5" />} active={lineNumbers}>
            <span className="hidden sm:inline">Lines</span>
          </ToolbarBtn>
          <ToolbarBtn onClick={reset} icon={<RotateCcw className="h-3.5 w-3.5" />}>
            <span className="hidden sm:inline">Reset</span>
          </ToolbarBtn>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* Desktop: side panel toggle */}
          <ToolbarBtn
            onClick={() => setPanelOpen((p) => !p)}
            icon={panelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
            className="hidden md:inline-flex"
          >
            <span className="hidden lg:inline">Variables</span>
          </ToolbarBtn>
          {/* Mobile: variables drawer toggle */}
          <ToolbarBtn
            onClick={() => setMobilePanelOpen(true)}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            className="md:hidden"
          >
            {variables.length > 0 && (
              <span className="rounded-full bg-[var(--color-brand)] px-1.5 text-[9px] font-bold text-[var(--color-bg)]">
                {totalFilled}/{variables.length}
              </span>
            )}
          </ToolbarBtn>
          <ToolbarBtn
            onClick={onToggleFullscreen}
            icon={isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 font-mono text-[10px] text-[var(--color-muted)]">
        <span>{stats.chars.toLocaleString()} chars</span>
        <span className="opacity-40">·</span>
        <span>{stats.words.toLocaleString()} words</span>
        <span className="opacity-40">·</span>
        <span>~{stats.tokens.toLocaleString()} tokens</span>
        {variables.length > 0 && (
          <>
            <span className="opacity-40">·</span>
            <span>
              {totalFilled}/{variables.length} filled
            </span>
            <span className="opacity-40">·</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold ${
                allReady
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {allReady ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </>
              ) : (
                <>⚠ {percent}%</>
              )}
            </span>
          </>
        )}
        <div className="ml-auto flex min-w-[80px] items-center gap-1.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allReady ? "bg-emerald-500" : "bg-[var(--color-brand)]"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] p-2">
          <PromptSearch
            query={searchQuery}
            onQuery={(q) => {
              setSearchQuery(q);
              setActiveMatch(0);
            }}
            matchCount={matchCount}
            activeIndex={activeMatch}
            onPrev={() => setActiveMatch((i) => (matchCount ? (i - 1 + matchCount) % matchCount : 0))}
            onNext={() => setActiveMatch((i) => (matchCount ? (i + 1) % matchCount : 0))}
            onClose={() => setSearchOpen(false)}
            replaceMode={replaceMode}
            onToggleReplace={() => setReplaceMode((r) => !r)}
            replaceValue={replaceValue}
            onReplaceValue={setReplaceValue}
            onReplace={doReplace}
            onReplaceAll={doReplaceAll}
          />
        </div>
      )}

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
            {mode === "edit" ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-full min-h-[280px] w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 font-mono text-[13px] leading-relaxed text-[var(--color-fg)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-soft)] sm:p-5"
                spellCheck={false}
                placeholder="Edit the prompt text..."
              />
            ) : (
              <PlaceholderHighlighter
                originalText={body}
                values={values}
                search={searchQuery}
                activeMatchIndex={activeMatch}
                activePhKey={activePhKey}
                onPlaceholderClick={(key) => focusPh(key)}
                lineNumbers={lineNumbers}
                onMatchesChange={setMatchCount}
              />
            )}
          </div>

          {/* Copy toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <CopyBtn onClick={() => doCopy(finalText, "Copied filled prompt")} primary>
              <Copy className="h-3.5 w-3.5" /> Copy Prompt
            </CopyBtn>
            <CopyBtn onClick={() => doCopy(originalPrompt, "Copied original")}>
              <ClipboardCopy className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Original</span>
            </CopyBtn>
            <CopyBtn onClick={() => doCopy(strippedText, "Copied without placeholders")}>
              <FileText className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Plain</span>
            </CopyBtn>
            <CopyBtn onClick={() => doCopy(finalText, "Copied as markdown")}>
              <BookOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Markdown</span>
            </CopyBtn>
          </div>
        </div>

        {/* Desktop variables panel */}
        {panelOpen && (
          <div className="hidden min-h-0 shrink-0 overflow-hidden border-l border-[var(--color-border)] md:block md:w-72 lg:w-80">
            {variablesPanel}
          </div>
        )}
      </div>

      {/* Mobile variables drawer */}
      {mobilePanelOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobilePanelOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
              <div className="mx-auto h-1 w-10 rounded-full bg-[var(--color-border)]" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{variablesPanel}</div>
            <button
              type="button"
              onClick={() => setMobilePanelOpen(false)}
              className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-3 text-xs font-semibold text-[var(--color-fg)]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VariablesPanelWithRefs(props) {
  return (
    <div className="flex h-full max-h-full min-h-0 flex-col">
      <ScopedRoot variables={props.variables}>
        <VariablesPanel {...props} />
      </ScopedRoot>
    </div>
  );
}
function ScopedRoot({ children, variables }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const inputs = root.querySelectorAll("textarea");
    let i = 0;
    inputs.forEach((el) => {
      if (variables[i]) el.setAttribute("data-var-key", variables[i].key);
      i++;
    });
  });
  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col">
      {children}
    </div>
  );
}

function ToolbarBtn({ children, onClick, icon, active, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-fg)]"
          : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
      } ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function CopyBtn({ children, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-bg)] shadow-sm transition hover:opacity-90"
          : "inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
      }
    >
      {children}
    </button>
  );
}
