// components/History/HistoryPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  Layers,
} from "lucide-react";

const METHOD_COLORS = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
};

function RunCard({ record }) {
  const [expanded, setExpanded] = useState(false);

  const passRate =
    record.totalCases > 0
      ? Math.round((record.passed / record.totalCases) * 100)
      : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Run type badge */}
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            record.runType === "all"
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {record.runType === "all" ? "Full run" : "Single"}
        </span>

        {/* API name + timestamp */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {record.apiName}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(record.runAt).toLocaleString()}
          </p>
        </div>

        {/* Pass/fail counts */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 size={13} /> {record.passed}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <XCircle size={13} /> {record.failed}
          </span>
          {record.pending > 0 && (
            <span className="flex items-center gap-1 text-gray-400">
              <Clock size={13} /> {record.pending}
            </span>
          )}
        </div>

        {/* Pass rate */}
        {passRate != null && (
          <span
            className={`text-sm font-bold w-12 text-right ${
              passRate === 100
                ? "text-green-600"
                : passRate >= 50
                  ? "text-yellow-600"
                  : "text-red-500"
            }`}
          >
            {passRate}%
          </span>
        )}

        {expanded ? (
          <ChevronUp size={15} className="text-gray-400" />
        ) : (
          <ChevronDown size={15} className="text-gray-400" />
        )}
      </div>

      {/* Expanded — per case results */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {record.results.map((r, idx) => (
            <div key={idx} className="flex items-center gap-3 px-5 py-2.5">
              {r.passed === true && (
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              )}
              {r.passed === false && (
                <XCircle size={14} className="text-red-500 shrink-0" />
              )}
              {r.passed === null && (
                <Clock size={14} className="text-gray-300 shrink-0" />
              )}

              <p className="text-sm text-gray-700 flex-1 truncate">
                {r.title || `Case ${idx + 1}`}
              </p>

              {r.statusCode && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    r.statusCode < 300
                      ? "bg-green-100 text-green-700"
                      : r.statusCode < 500
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {r.statusCode}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [apis, setApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingApis, setLoadingApis] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const navigate = useNavigate();

  // Fetch all APIs for the selector
  useEffect(() => {
    const fetchApis = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/apis", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setApis(data);
        if (data.length) setSelectedApi(data[0]);
      } catch (err) {
        console.error("Failed to fetch APIs", err);
      } finally {
        setLoadingApis(false);
      }
    };
    fetchApis();
  }, []);

  // Fetch history when selected API changes
  useEffect(() => {
    if (!selectedApi) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/run-history/${selectedApi._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [selectedApi]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Run History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Past test runs across all your APIs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Workbench →
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* API selector sidebar */}
        <div className="w-56 shrink-0">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">
            APIs
          </p>
          {loadingApis ? (
            <p className="text-sm text-gray-400 px-1">Loading...</p>
          ) : apis.length === 0 ? (
            <p className="text-sm text-gray-400 px-1">No APIs found</p>
          ) : (
            <div className="space-y-1">
              {apis.map((api) => (
                <button
                  key={api._id}
                  onClick={() => setSelectedApi(api)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                    selectedApi?._id === api._id
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      METHOD_COLORS[api.method] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {api.method}
                  </span>
                  <span className="truncate">{api.apiName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* History list */}
        <div className="flex-1">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Play size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No runs yet for this API.</p>
              <p className="text-xs mt-1">
                Head to the workbench and run some test cases.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <RunCard key={record._id} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
