import { useState } from "react";
import {
  X,
  Github,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  SearchCode,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanModal({ onClose, onScanComplete }) {
  const { settings } = useSettings();
  const [repoUrl, setRepoUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!repoUrl.trim()) return;
    setScanning(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`http://localhost:5000/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.authToken}`,
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Scan failed.");
        return;
      }

      setResult(data);
      onScanComplete(data.apis);
    } catch (err) {
      setError("Network connectivity error. Please check your gateway.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-white/[0.08] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-800 border border-white/[0.06] text-violet-400">
              <SearchCode size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Scan Repository
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Automated API Discovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Paste a public GitHub repository URL. Our engine will analyze the
            source code to discover Express/Mongoose patterns and import them
            into your workbench.
          </p>

          <div className="relative group mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-500 transition-colors">
              <Github size={18} />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="https://github.com/username/repo"
              className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-100 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 outline-none font-mono transition-all placeholder:text-zinc-700"
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-3 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3 mb-6"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-3 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6"
              >
                <CheckCircle2 size={16} /> Found {result.count} API routes.
              </motion.div>
            )}
          </AnimatePresence>

          {result?.apis?.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
              {result.apis.map((api, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2 bg-zinc-950 border border-white/[0.04] rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 font-mono">
                      {api.method}
                    </span>
                    <span className="text-[11px] text-zinc-300 font-mono truncate">
                      {api.apiName}
                    </span>
                  </div>
                  <ChevronRight size={12} className="text-zinc-700" />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-xs font-medium text-zinc-400 border border-white/[0.08] rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all"
            >
              {result ? "Dismiss" : "Cancel"}
            </button>
            {!result && (
              <button
                onClick={handleScan}
                disabled={scanning || !repoUrl.trim()}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Analyzing
                    Source...
                  </>
                ) : (
                  <>
                    <SearchCode size={16} /> Start Scan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
