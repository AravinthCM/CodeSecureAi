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
} from "lucide-react";
import { useState, useEffect } from "react";
import { exportToPostman } from "../utils/exportToPostman";
import { Download } from "lucide-react";
// Diff view — highlights keys that differ between snapshot and actual
function DiffView({ snapshot, actual }) {
  if (!snapshot && !actual) return null;

  const snapshotStr = JSON.stringify(snapshot, null, 2) || "";
  const actualStr = JSON.stringify(actual, null, 2) || "";

  const snapshotLines = snapshotStr.split("\n");
  const actualLines = actualStr.split("\n");

  const maxLines = Math.max(snapshotLines.length, actualLines.length);

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
      {/* Snapshot column */}
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
          Snapshot (expected)
        </p>
        <div className="bg-gray-50 rounded border border-gray-200 overflow-x-auto p-2 space-y-0.5">
          {Array.from({ length: maxLines }).map((_, i) => {
            const line = snapshotLines[i] ?? "";
            const actualLine = actualLines[i] ?? "";
            const isDiff = line !== actualLine;
            return (
              <div
                key={i}
                className={`px-1 rounded whitespace-pre ${
                  isDiff ? "bg-red-100 text-red-700" : "text-gray-700"
                }`}
              >
                {line || " "}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actual column */}
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
          Actual (last run)
        </p>
        <div className="bg-gray-50 rounded border border-gray-200 overflow-x-auto p-2 space-y-0.5">
          {Array.from({ length: maxLines }).map((_, i) => {
            const line = actualLines[i] ?? "";
            const snapshotLine = snapshotLines[i] ?? "";
            const isDiff = line !== snapshotLine;
            return (
              <div
                key={i}
                className={`px-1 rounded whitespace-pre ${
                  isDiff ? "bg-green-100 text-green-700" : "text-gray-700"
                }`}
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

// Individual test case card
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

  const isThisRunning = runningId === testCase._id;
  const hasRun = testCase.lastRun?.timestamp !== null;
  const isFirstRun =
    hasRun &&
    testCase.snapshot !== null &&
    testCase.lastRun?.passed === true &&
    JSON.stringify(testCase.lastRun?.actualResponse) ===
      JSON.stringify(testCase.snapshot);
  const passed = testCase.lastRun?.passed;
  const statusCode = testCase.lastRun?.statusCode;

  const p = testCase.payload; // the AI-generated payload object

  // Border color based on state
  const borderClass = isThisRunning
    ? "border-blue-400 shadow-blue-100"
    : passed === true
      ? "border-green-400"
      : passed === false
        ? "border-red-400"
        : "border-gray-200";

  return (
    <div
      className={`bg-white border-2 rounded-xl shadow-sm transition-all ${borderClass}`}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          {/* Status icon */}
          {isThisRunning ? (
            <Loader2 size={16} className="animate-spin text-blue-500" />
          ) : passed === true ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : passed === false ? (
            <XCircle size={16} className="text-red-500" />
          ) : (
            <Clock size={16} className="text-gray-300" />
          )}

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {p.title || `Case ${idx + 1}`}
            </p>
            <p className="text-[11px] text-gray-400">
              {p.type} · {p.description?.slice(0, 60)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusCode && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                statusCode < 300
                  ? "bg-green-100 text-green-700"
                  : statusCode < 500
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {statusCode}
            </span>
          )}
          {testCase.snapshot && (
            <span className="text-[10px] text-purple-500 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
              snapshot
            </span>
          )}
          <span className="text-[10px] text-gray-300">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {/* Payload sent */}
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
              Payload sent
            </p>
            <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto text-gray-700">
              {JSON.stringify(p.payload, null, 2)}
            </pre>
          </div>
          {/* First run — snapshot captured */}
          {hasRun &&
            testCase.snapshot &&
            passed === true &&
            JSON.stringify(testCase.lastRun?.actualResponse) ===
              JSON.stringify(testCase.snapshot) && (
              <div className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2">
                📸 Snapshot captured on first run. Future runs will diff against
                this.
              </div>
            )}

          {/* AI Expected vs Actual */}
          {testCase.snapshot && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {/* Expected column */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Expected (AI)
                  </p>
                  <div className="bg-gray-50 rounded border border-gray-200 p-2 space-y-1">
                    <div
                      className={`px-1 rounded ${
                        testCase.lastRun?.statusCode ===
                        testCase.snapshot.expectedStatus
                          ? "bg-green-100 text-green-700"
                          : testCase.lastRun?.statusCode
                            ? "bg-red-100 text-red-700"
                            : "text-gray-500"
                      }`}
                    >
                      Status: {testCase.snapshot.expectedStatus}
                    </div>
                    <div className="px-1 text-gray-600 whitespace-pre-wrap">
                      {testCase.snapshot.expectedResult}
                    </div>
                  </div>
                </div>

                {/* Actual column */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Actual (last run)
                  </p>
                  <div className="bg-gray-50 rounded border border-gray-200 p-2 space-y-1">
                    <div
                      className={`px-1 rounded ${
                        testCase.lastRun?.statusCode ===
                        testCase.snapshot.expectedStatus
                          ? "bg-green-100 text-green-700"
                          : testCase.lastRun?.statusCode
                            ? "bg-red-100 text-red-700"
                            : "text-gray-500"
                      }`}
                    >
                      Status: {testCase.lastRun?.statusCode ?? "—"}
                    </div>
                    <div className="px-1 text-gray-600 whitespace-pre-wrap overflow-x-auto">
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
            </div>
          )}
          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {/* Run this case */}
            <button
              onClick={() => runSingleTestCase(testCase)}
              disabled={isRunning}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-40 transition"
            >
              {isThisRunning ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Play size={12} />
              )}
              {isThisRunning ? "Running..." : "Run"}
            </button>

            {testCase.snapshot && (
              <button
                onClick={() => resetSnapshot(testCase._id)}
                disabled={isRunning}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <RotateCcw size={12} /> Reset snapshot
              </button>
            )}

            <button
              onClick={() => deleteTestCase(testCase._id)}
              disabled={isRunning}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition ml-auto"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
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
      setModelFile(parsed.modelFile || "");
      setControllerFile(parsed.controllerFile || "");
      setUrl(parsed.url || "");
    } else {
      setModelFile("");
      setControllerFile("");
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
      <div className="flex-1 flex items-center justify-center text-gray-400 italic">
        Select an API from the sidebar to start testing
      </div>
    );
  }

  const handleTestClick = () => {
    if (!modelFile.trim() && !controllerFile.trim()) {
      alert("Please provide at least a Model or a Controller function!");
      return;
    }
    generateAiPayloads(`
      ### BACKEND MODEL:
      ${modelFile}
      ### CONTROLLER FUNCTION:
      ${controllerFile}
    `);
  };

  const passedCount = payloads.filter((p) => p.lastRun?.passed === true).length;
  const failedCount = payloads.filter(
    (p) => p.lastRun?.passed === false,
  ).length;
  const pendingCount = payloads.filter(
    (p) => p.lastRun?.passed === null,
  ).length;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {/* Header — replace existing header div with this */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              {selected.apiName}
            </h1>
            <p className="text-sm text-gray-500">
              Target URL: {url || "Not set"}
            </p>
          </div>

          {/* Export button — only show when test cases exist */}
          {payloads.length > 0 && (
            <button
              onClick={() =>
                exportToPostman(selected.apiName, url, method, payloads)
              }
              disabled={!url}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition text-gray-600"
              title={
                !url ? "Enter a URL first" : "Export as Postman collection"
              }
            >
              <Download size={15} />
              Export to Postman
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex gap-3">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[200px]">
            <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
              <Code2 size={14} className="text-gray-500" />
              <h2 className="text-xs font-bold text-gray-600 uppercase">
                Schema / Model
              </h2>
            </div>
            <textarea
              className="flex-1 p-3 font-mono text-xs outline-none resize-none"
              placeholder="Paste Mongoose Schema here..."
              value={modelFile}
              onChange={(e) => setModelFile(e.target.value)}
            />
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[200px]">
            <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
              <Terminal size={14} className="text-gray-500" />
              <h2 className="text-xs font-bold text-gray-600 uppercase">
                Controller Function
              </h2>
            </div>
            <textarea
              className="flex-1 p-3 font-mono text-xs outline-none resize-none"
              placeholder="Paste Express Controller function here..."
              value={controllerFile}
              onChange={(e) => setControllerFile(e.target.value)}
            />
          </div>

          <button
            onClick={handleTestClick}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:bg-blue-300 shadow-lg"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Sparkles size={20} />
            )}
            {isGenerating ? "Analyzing Logic..." : "GENERATE AI TEST SUITE"}
          </button>
        </div>

        {/* Right column — test cases panel */}
        <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
            <h2 className="text-md font-semibold text-purple-800 flex items-center gap-2">
              <Sparkles size={18} /> Test Cases
            </h2>

            <div className="flex items-center gap-2">
              {/* Stats */}
              {payloads.some((p) => p.lastRun?.timestamp) && (
                <div className="flex gap-1 text-[11px] font-bold">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {passedCount} pass
                  </span>
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {failedCount} fail
                  </span>
                  {pendingCount > 0 && (
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {pendingCount} pending
                    </span>
                  )}
                </div>
              )}

              {/* Run all button */}
              {payloads.length > 0 && (
                <button
                  onClick={runAllTestCases}
                  disabled={isRunning || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:bg-green-300 transition"
                >
                  {isRunning ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Play size={13} />
                  )}
                  {isRunning ? "Running..." : "Run All"}
                </button>
              )}
            </div>
          </div>

          {/* Cards list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {payloads.length === 0 && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                <div className="mb-4 p-4 bg-gray-100 rounded-full">
                  <Terminal size={40} />
                </div>
                <p className="text-sm">
                  Provide your backend logic to generate precise test cases.
                </p>
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
