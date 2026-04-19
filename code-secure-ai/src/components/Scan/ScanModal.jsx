// components/Scan/ScanModal.jsx
import { useState } from "react";
import { X, Github, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

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
      onScanComplete(data.apis); // pass discovered APIs up to parent
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Github size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">Scan repository</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input */}
        <p className="text-sm text-gray-500 mb-3">
          Paste a public GitHub repository URL. CodeSecureAI will discover all
          Express routes and import them automatically.
        </p>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          placeholder="https://github.com/username/repo"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4"
        />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
            <CheckCircle2 size={15} />
            Found and imported {result.count} route
            {result.count !== 1 ? "s" : ""} from the repository.
          </div>
        )}

        {/* Discovered routes preview */}
        {result?.apis?.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1.5 mb-4">
            {result.apis.map((api, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100"
              >
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    api.method === "GET"
                      ? "bg-green-100 text-green-700"
                      : api.method === "POST"
                        ? "bg-blue-100 text-blue-700"
                        : api.method === "PUT"
                          ? "bg-yellow-100 text-yellow-700"
                          : api.method === "DELETE"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {api.method}
                </span>
                <span className="text-sm text-gray-700 font-mono truncate">
                  {api.apiName}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            {result ? "Close" : "Cancel"}
          </button>
          {!result && (
            <button
              onClick={handleScan}
              disabled={scanning || !repoUrl.trim()}
              className="flex-1 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Scanning...
                </>
              ) : (
                <>
                  <Github size={15} /> Scan repo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
