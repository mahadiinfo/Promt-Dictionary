"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  BookOpen,
  ClipboardCopy,
  Code2,
  Copy,
  Eye,
  Hash,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  RotateCcw,
  Search as SearchIcon,
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

// Undo/redo reducer over prompt-body edits (Editing Mode textarea) — the
// variable panel keeps its own history via textarea inputs. For values,
// undo/redo mirrors the whole values object on each commit.
function historyReducer(state, action) {
  switch (action.type) {
    case "set": {
      // Commit a new snapshot, truncate any redo tail.
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
    case "reset": {
      return { past: [], present: action.value, future: [] };
    }
    default:
      return state;
  }
}

const DEMO_BY_TYPE = {
  square: "Sample value",
  curly: "sample_value",
  double: "sample_variable",
  angle: "example",
};

export default function PromptEditor({ prompt, isFullscreen, onToggleFullscreen }) {
  const { show } = useToast();
  const promptId = prompt?.id ?? prompt?.number ?? "unknown";
  const originalPrompt = prompt?.prompt || "";

  // Body (editable text) history
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: originalPrompt,
    future: [],
  });
  const body = history.present;

  // Variable values
  const [values, setValues] = useState({});
  const [activePhKey, setActivePhKey] = useState(null);

  // Modes
  const [mode, setMode] = useState("edit"); // "edit" | "read"
  const [panelOpen, setPanelOpen] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(false);
  const [rawMode, setRawMode] = useState(false); // free-text editing of body

  // Search / replace
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceValue, setReplaceValue] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [activeMatch, setActiveMatch] = useState(0);

  // Load / persist to localStorage per prompt id.
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
    // small delay so we don't clobber the just-loaded state
    const t = setTimeout(() => {
      loadedRef.current = true;
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(
        storageKey(promptId),
        JSON.stringify({ body, values })
      );
    } catch {
      /* quota exceeded — silently ignore */
    }
  }, [body, values, promptId]);

  // Derived
  const tokens = useMemo(() => tokenizePrompt(body), [body]);
  const variables = useMemo(() => extractVariables(tokens), [tokens]);
  const finalText = useMemo(() => applyValues(body, values), [body, values]);
  const stats = useMemo(
    () => ({
      chars: finalText.length,
      words: wordCount(finalText),
      tokens: estimateTokens(finalText),
    }),
    [finalText]
  );

  // ----- Handlers -----
  const setBody = useCallback((v) => dispatch({ type: "set", value: v }), []);

  const onValueChange = useCallback((key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const focusPh = useCallback((key) => {
    setActivePhKey(key);
    // scroll input into view in the side panel
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-var-key="${CSS.escape(key)}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const reset = () => {
    dispatch({ type: "reset", value: originalPrompt });
    setValues({});
    show("Restored original");
  };

  const clearAll = () => setValues({});
  const fillDemo = () => {
    const next = { ...values };
    for (const v of variables) {
      if (!next[v.key]) next[v.key] = `${DEMO_BY_TYPE[v.type] || "value"} · ${v.name}`;
    }
    setValues(next);
  };

  const copyFilled = async () => {
    await navigator.clipboard.writeText(finalText);
    show("Copied filled prompt");
  };
  const copyOriginal = async () => {
    await navigator.clipboard.writeText(originalPrompt);
    show("Copied original");
  };
  const copyMarkdown = async () => {
    // Filled prompt is already markdown-compatible.
    await navigator.clipboard.writeText(finalText);
    show("Copied as markdown");
  };

  const importJSON = (obj) => {
    if (!obj || typeof obj !== "object") return;
    const next = { ...values };
    // Match either by raw key (`[Name]`) or by inner name (`Name`).
    for (const v of variables) {
      if (obj[v.key] != null) next[v.key] = String(obj[v.key]);
      else if (obj[v.name] != null) next[v.key] = String(obj[v.name]);
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

  // Replace helpers work against the ORIGINAL body text.
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
      } else if (e.key === "Tab" && variables.length > 0 && document.activeElement?.tagName !== "TEXTAREA" && document.activeElement?.tagName !== "INPUT") {
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

  const totalFilled = variables.filter((v) => values[v.key]).length;
  const allReady = variables.length === 0 || totalFilled === variables.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border)] px-3 py-2 text-xs">
        <ToolbarBtn
          onClick={() => setMode(mode === "edit" ? "read" : "edit")}
          icon={mode === "edit" ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
        >
          {mode === "edit" ? "Read" : "Edit"}
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setSearchOpen((s) => !s)} icon={<SearchIcon className="h-3.5 w-3.5" />}>
          Find
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => setRawMode((r) => !r)}
          icon={<Code2 className="h-3.5 w-3.5" />}
          active={rawMode}
        >
          Raw
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => setLineNumbers((v) => !v)}
          icon={<Hash className="h-3.5 w-3.5" />}
          active={lineNumbers}
        >
          Lines
        </ToolbarBtn>
        <ToolbarBtn onClick={reset} icon={<RotateCcw className="h-3.5 w-3.5" />}>
          Reset
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => setPanelOpen((p) => !p)}
          icon={panelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
        >
          <span className="hidden sm:inline">Variables</span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={onToggleFullscreen}
          icon={isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        >
          <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Full"}</span>
        </ToolbarBtn>

        <div className="ml-auto flex items-center gap-2 whitespace-nowrap font-mono text-[10px] text-[var(--color-muted)]">
          <span>{stats.chars} ch</span>
          <span>·</span>
          <span>{stats.words} w</span>
          <span>·</span>
          <span>~{stats.tokens} tok</span>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-[var(--color-border)] p-2">
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

      {!allReady && variables.length > 0 && (
        <div className="border-b border-amber-500/30 bg-[var(--color-brand-soft)]/60 px-4 py-1.5 text-[11px] text-[var(--color-fg)]">
          ⚠ {variables.length - totalFilled} placeholder
          {variables.length - totalFilled === 1 ? "" : "s"} still need your input.
        </div>
      )}

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-h-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {rawMode && mode === "edit" ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[240px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--color-fg)] outline-none focus:border-[var(--color-brand)] sm:p-5"
                spellCheck={false}
              />
            ) : (
              <PlaceholderHighlighter
                text={finalText}
                originalText={body}
                values={values}
                search={searchQuery}
                activeMatchIndex={activeMatch}
                activePhKey={activePhKey}
                onPlaceholderClick={mode === "read" ? undefined : (key) => focusPh(key)}
                lineNumbers={lineNumbers}
                onMatchesChange={setMatchCount}
              />
            )}
          </div>

          {/* Copy row */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--color-border)] px-3 py-2">
            <CopyBtn onClick={copyFilled} primary>
              <Copy className="h-3.5 w-3.5" /> Copy Prompt
            </CopyBtn>
            <CopyBtn onClick={copyOriginal}>
              <ClipboardCopy className="h-3.5 w-3.5" /> Original
            </CopyBtn>
            <CopyBtn onClick={copyMarkdown}>
              <BookOpen className="h-3.5 w-3.5" /> Markdown
            </CopyBtn>
          </div>
        </div>

        {/* Variables side / bottom drawer */}
        {panelOpen && (
          <div className="max-h-[45vh] shrink-0 border-t border-[var(--color-border)] md:max-h-none md:w-72 md:border-l md:border-t-0 lg:w-80">
            <div data-var-keys-root>
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper that adds data-var-key attributes so `focusPh` can scroll to inputs.
function VariablesPanelWithRefs(props) {
  return (
    <div className="flex h-full max-h-full min-h-0 flex-col [&_textarea]:font-sans">
      <ScopedRoot values={props.values} variables={props.variables}>
        <VariablesPanel {...props} />
      </ScopedRoot>
    </div>
  );
}
function ScopedRoot({ children, variables }) {
  // Add data attributes for scroll targeting.
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

function ToolbarBtn({ children, onClick, icon, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[11px] font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-brand-soft)] ${
        active ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]" : ""
      }`}
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
          ? "inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-bg)] transition hover:opacity-90"
          : "inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-brand-soft)]"
      }
    >
      {children}
    </button>
  );
}
