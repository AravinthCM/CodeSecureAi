import { Sparkles, Loader2, Code2, Terminal } from "lucide-react";
import { useState, useEffect } from "react";

export default function ApiWorkbench({
  selected,
  method,
  setMethod,
  url,
  setUrl,
  response,
  payloads,
  generateAiPayloads,
  isGenerating,
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

    const data = {
      modelFile,
      controllerFile,
      url,
    };

    localStorage.setItem(`api_state_${selected._id}`, JSON.stringify(data));
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

    const combinedDescription = `
      ### BACKEND MODEL:
      ${modelFile}

      ### CONTROLLER FUNCTION:
      ${controllerFile}
      `;

    generateAiPayloads(combinedDescription);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {selected.apiName}
          </h1>
          <p className="text-sm text-gray-500">
            Target URL: {url || "Not set"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Left Column: Input Fields (Model & Controller) */}
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

          {/* Model Area */}
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

          {/* Controller Area */}
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

        {/* Right Column: AI Results */}
        <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
            <h2 className="text-md font-semibold text-purple-800 flex items-center gap-2">
              <Sparkles size={18} /> Generated Test Payloads
            </h2>
            {payloads.length > 0 && (
              <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-bold">
                {payloads.length} Cases
              </span>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
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

            {payloads.map((p, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-400 transition-all shadow-sm hover:shadow-md"
              >
                <div className="absolute top-2 right-2 text-[10px] uppercase font-black text-gray-300 group-hover:text-purple-400">
                  Case {idx + 1}
                </div>
                <pre className="text-xs font-mono text-gray-700 overflow-x-auto pt-2">
                  {JSON.stringify(p, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
