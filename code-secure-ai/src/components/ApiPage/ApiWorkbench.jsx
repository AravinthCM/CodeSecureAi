import {
  Sparkles,
  Loader2,
  Code2,
  Terminal,
  Play,
  RotateCcw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Copy,
  Check,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { exportToPostman } from "../utils/exportToPostman";
import { useSettings } from "../../context/SettingsContext";

const METHOD_CONFIG = {
  GET: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/30",
    glow: "shadow-sky-500/20",
  },
  POST: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  PUT: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
  DELETE: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    glow: "shadow-rose-500/20",
  },
};

function StatusCodePill({ code }) {
  if (!code) return null;
  const isSuccess = code < 300;
  const isClientErr = code >= 400 && code < 500;
  const isServerErr = code >= 500;

  return (
    <span
      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
        isSuccess
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20"
          : isClientErr
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : isServerErr
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-500/30"
              : "bg-zinc-800 text-zinc-400 border-zinc-700"
      }`}
    >
      {code}
    </span>
  );
}

function DiffView({ snapshot, actual }) {
  if (!snapshot && !actual) return null;
  const snapshotStr = JSON.stringify(snapshot, null, 2) || "";
  const actualStr = JSON.stringify(actual, null, 2) || "";
  const snapshotLines = snapshotStr.split("\n");
  const actualLines = actualStr.split("\n");
  const maxLines = Math.max(snapshotLines.length, actualLines.length);

  return (
    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono">
      <div>
        <p className="text-[9px] uppercase font-bold text-zinc-600 mb-1 tracking-widest">
          Expected
        </p>
        <div className="bg-zinc-950 rounded-lg border border-white/[0.06] overflow-x-auto p-2 space-y-px">
          {Array.from({ length: maxLines }).map((_, i) => {
            const line = snapshotLines[i] ?? "";
            const isDiff = line !== (actualLines[i] ?? "");
            return (
              <div
                key={i}
                className={`px-1.5 py-px rounded text-[11px] whitespace-pre ${isDiff ? "bg-rose-500/10 text-rose-400" : "text-zinc-500"}`}
              >
                {line || " "}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[9px] uppercase font-bold text-zinc-600 mb-1 tracking-widest">
          Actual
        </p>
        <div className="bg-zinc-950 rounded-lg border border-white/[0.06] overflow-x-auto p-2 space-y-px">
          {Array.from({ length: maxLines }).map((_, i) => {
            const line = actualLines[i] ?? "";
            const isDiff = line !== (snapshotLines[i] ?? "");
            return (
              <div
                key={i}
                className={`px-1.5 py-px rounded text-[11px] whitespace-pre ${isDiff ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500"}`}
              >
                {line || " "}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TestCaseCard({
  testCase,
  idx,
  isRunning,
  runningId,
  resetSnapshot,
  deleteTestCase,
  runSingleTestCase,
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(testCase.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const { settings } = useSettings();
  const isThisRunning = runningId === testCase._id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(testCase.payload?.payload, null, 2),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleNotesSave = async () => {
    if (notes === testCase.notes) return;
    setSavingNotes(true);
    try {
      await fetch(`${settings.baseUrl}/api/test-cases/${testCase._id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.authToken}`,
        },
        body: JSON.stringify({ notes }),
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
    } finally {
      setSavingNotes(false);
    }
  };

  const passed = testCase.lastRun?.passed;
  const statusCode = testCase.lastRun?.statusCode;
  const p = testCase.payload;

  const StatusIcon = isThisRunning
    ? () => <Loader2 size={13} className="animate-spin text-violet-400" />
    : passed === true
      ? () => <CheckCircle2 size={13} className="text-emerald-400" />
      : passed === false
        ? () => <XCircle size={13} className="text-rose-400" />
        : () => <Clock size={13} className="text-zinc-600" />;

  const borderColor = isThisRunning
    ? "border-violet-500/40"
    : passed === true
      ? "border-emerald-500/30"
      : passed === false
        ? "border-rose-500/30"
        : "border-white/[0.06]";

  const glowClass = isThisRunning
    ? "shadow-violet-500/10"
    : passed === true
      ? "shadow-emerald-500/5"
      : passed === false
        ? "shadow-rose-500/5"
        : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-zinc-900 border rounded-xl shadow-sm overflow-hidden transition-all ${borderColor} ${glowClass}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusIcon />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate">
              {p.title || `Case ${idx + 1}`}
            </p>
            <p className="text-[10px] text-zinc-600 truncate">
              {p.type} · {p.description?.slice(0, 55)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusCodePill code={statusCode} />
          {testCase.snapshot && (
            <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">
              snap
            </span>
          )}
          {notes && <StickyNote size={11} className="text-amber-500/70" />}
          {expanded ? (
            <ChevronUp size={12} className="text-zinc-600" />
          ) : (
            <ChevronDown size={12} className="text-zinc-600" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-3">
              {/* Payload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">
                    Payload
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={10} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={10} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-zinc-950 border border-white/[0.06] rounded-lg p-3 overflow-x-auto text-zinc-400 max-h-32">
                  {JSON.stringify(p.payload, null, 2)}
                </pre>
              </div>

              {/* Snapshot diff */}
              {testCase.snapshot && (
                <div>
                  <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest mb-1">
                    Diff View
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <p className="text-[9px] text-zinc-600 mb-1">
                        Expected · Status {testCase.snapshot.expectedStatus}
                      </p>
                      <div className="bg-zinc-950 rounded-lg border border-white/[0.06] p-2 text-zinc-500 whitespace-pre-wrap text-[11px]">
                        {testCase.snapshot.expectedResult}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 mb-1">
                        Actual ·{" "}
                        <StatusCodePill code={testCase.lastRun?.statusCode} />
                      </p>
                      <div className="bg-zinc-950 rounded-lg border border-white/[0.06] p-2 text-zinc-500 whitespace-pre-wrap text-[11px] overflow-x-auto max-h-24">
                        {testCase.lastRun?.actualResponse
                          ? JSON.stringify(
                              testCase.lastRun.actualResponse,
                              null,
                              2,
                            )
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest flex items-center gap-1">
                    <StickyNote size={9} /> Notes
                  </p>
                  {savingNotes && (
                    <span className="text-[9px] text-zinc-600">Saving...</span>
                  )}
                  {notesSaved && (
                    <span className="text-[9px] text-emerald-500 flex items-center gap-1">
                      <Check size={9} />
                      Saved
                    </span>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesSave}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full text-[11px] font-mono px-3 py-2 bg-amber-950/20 border border-amber-500/10 rounded-lg resize-none outline-none focus:ring-1 focus:ring-amber-500/20 text-amber-200/70 placeholder-zinc-700 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => runSingleTestCase(testCase)}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40 transition-all"
                >
                  {isThisRunning ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Play size={11} />
                  )}
                  {isThisRunning ? "Running..." : "Run"}
                </button>
                {testCase.snapshot && (
                  <button
                    onClick={() => resetSnapshot(testCase._id)}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-500 hover:bg-zinc-800 disabled:opacity-40 transition-all"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                )}
                <button
                  onClick={() => deleteTestCase(testCase._id)}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 transition-all ml-auto"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ApiWorkbench({
  selected,
  method,
  setMethod,
  url,
  setUrl,
  payloads,
  generateAiPayloads,
  isGenerating,
  isRunning,
  runningId,
  runAllTestCases,
  resetSnapshot,
  deleteTestCase,
  runSingleTestCase,
}) {
  const [modelFile, setModelFile] = useState("");
  const [controllerFile, setControllerFile] = useState("");

  useEffect(() => {
    if (!selected?._id) return;
    const saved = localStorage.getItem(`api_state_${selected._id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setModelFile(parsed.modelFile || selected.schemaCode || "");
      setControllerFile(parsed.controllerFile || selected.controllerCode || "");
      setUrl(parsed.url || "");
    } else {
      setModelFile(selected.schemaCode || "");
      setControllerFile(selected.controllerCode || "");
      setUrl("");
    }
  }, [selected, setUrl]);

  useEffect(() => {
    if (!selected?._id) return;
    localStorage.setItem(
      `api_state_${selected._id}`,
      JSON.stringify({ modelFile, controllerFile, url }),
    );
  }, [modelFile, controllerFile, url]);

  if (!selected) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-zinc-700" />
          </div>
          <p className="text-zinc-600 text-sm">
            Select an API to start testing
          </p>
        </div>
      </div>
    );
  }

  const handleTestClick = () => {
    if (!modelFile.trim() && !controllerFile.trim()) {
      alert("Please provide at least a Model or Controller function!");
      return;
    }
    generateAiPayloads(
      `### BACKEND MODEL:\n${modelFile}\n### CONTROLLER FUNCTION:\n${controllerFile}`,
    );
  };

  const passedCount = payloads.filter((p) => p.lastRun?.passed === true).length;
  const failedCount = payloads.filter(
    (p) => p.lastRun?.passed === false,
  ).length;
  const pendingCount = payloads.filter(
    (p) => p.lastRun?.passed === null,
  ).length;
  const mc = METHOD_CONFIG[method] || METHOD_CONFIG.GET;

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-zinc-950 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-bold text-zinc-100">
              {selected.apiName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono ${mc.bg} ${mc.text} ${mc.border}`}
              >
                {method}
              </span>
              <span className="text-[11px] text-zinc-600 font-mono truncate max-w-xs">
                {url || "No URL set"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {payloads.length > 0 && (
            <button
              onClick={() =>
                exportToPostman(selected.apiName, url, method, payloads)
              }
              disabled={!url}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 border border-white/[0.08] hover:border-white/20 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 transition-all"
            >
              <Download size={12} /> Export
            </button>
          )}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: IDE pane */}
        <div className="flex flex-col w-[45%] border-r border-white/[0.06] overflow-hidden">
          {/* URL bar */}
          <div className="flex gap-2 px-4 py-3 border-b border-white/[0.06] bg-zinc-900/50">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border font-mono outline-none bg-zinc-900 transition-all ${mc.bg} ${mc.text} ${mc.border}`}
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
            <input
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-zinc-900 border border-white/[0.08] text-zinc-300 placeholder-zinc-700 rounded-lg outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/10 transition-all"
            />
          </div>

          {/* Schema editor */}
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="px-4 py-2 border-b border-white/[0.06] bg-zinc-900/30 flex items-center gap-2 shrink-0">
              <Code2 size={12} className="text-zinc-600" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Schema / Model
              </span>
            </div>
            <textarea
              className="flex-1 p-4 font-mono text-[11px] bg-zinc-950 text-zinc-400 outline-none resize-none leading-relaxed placeholder-zinc-800 selection:bg-violet-500/20"
              placeholder={`// Paste your Mongoose Schema here...\nconst UserSchema = new Schema({\n  email: { type: String, required: true },\n  name: String,\n});`}
              value={modelFile}
              onChange={(e) => setModelFile(e.target.value)}
            />
          </div>

          {/* Controller editor */}
          <div className="flex flex-col flex-1 overflow-hidden min-h-0 border-t border-white/[0.06]">
            <div className="px-4 py-2 border-b border-white/[0.06] bg-zinc-900/30 flex items-center gap-2 shrink-0">
              <Terminal size={12} className="text-zinc-600" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Controller
              </span>
            </div>
            <textarea
              className="flex-1 p-4 font-mono text-[11px] bg-zinc-950 text-zinc-400 outline-none resize-none leading-relaxed placeholder-zinc-800 selection:bg-violet-500/20"
              placeholder={`// Paste your Express controller here...\nexport const createUser = async (req, res) => {\n  const { email, name } = req.body;\n  // ...\n};`}
              value={controllerFile}
              onChange={(e) => setControllerFile(e.target.value)}
            />
          </div>

          {/* Generate button */}
          <div className="px-4 py-3 border-t border-white/[0.06] bg-zinc-900/50 shrink-0">
            <button
              onClick={handleTestClick}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-violet-800 disabled:to-indigo-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Sparkles size={14} />
              )}
              {isGenerating ? "Analyzing Logic..." : "Generate AI Test Suite"}
            </button>
          </div>
        </div>

        {/* Right: Test inspector */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-white/[0.06] bg-zinc-900/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-violet-400" />
              <h2 className="text-xs font-bold text-zinc-300">
                Test Inspector
              </h2>
              {payloads.length > 0 && (
                <span className="text-[9px] font-bold bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">
                  {payloads.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {payloads.some((p) => p.lastRun?.timestamp) && (
                <div className="flex gap-1.5 text-[10px] font-bold">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {passedCount}P
                  </span>
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                    {failedCount}F
                  </span>
                  {pendingCount > 0 && (
                    <span className="bg-zinc-800 text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded-full">
                      {pendingCount}·
                    </span>
                  )}
                </div>
              )}
              {payloads.length > 0 && (
                <button
                  onClick={runAllTestCases}
                  disabled={isRunning || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/10"
                >
                  {isRunning ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Play size={11} />
                  )}
                  {isRunning ? "Running..." : "Run All"}
                </button>
              )}
            </div>
          </div>

          {/* Test cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {payloads.length === 0 && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center mb-4">
                  <Terminal size={24} className="text-zinc-700" />
                </div>
                <p className="text-zinc-600 text-xs max-w-[200px]">
                  Paste your backend logic and generate AI-powered test cases.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 size={20} className="animate-spin text-violet-400" />
                <p className="text-xs text-zinc-600">Analyzing your code...</p>
              </div>
            )}

            {payloads.map((testCase, idx) => (
              <TestCaseCard
                key={testCase._id}
                testCase={testCase}
                idx={idx}
                isRunning={isRunning}
                runningId={runningId}
                resetSnapshot={resetSnapshot}
                deleteTestCase={deleteTestCase}
                runSingleTestCase={runSingleTestCase}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
