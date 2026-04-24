// components/Dashboard/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FlaskConical,
  TrendingUp,
  ChevronRight,
  Activity,
  Zap,
  Settings,
  History,
} from "lucide-react";
import { motion } from "framer-motion";

const METHOD_COLORS = {
  GET: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  POST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

// Mini sparkline SVG
function Sparkline({ data = [], color = "#6d28d9" }) {
  if (!data || data.length < 2) {
    // Render a flat placeholder
    const w = 80,
      h = 24;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <line
          x1="0"
          y1={h / 2}
          x2={w}
          y2={h / 2}
          stroke="#3f3f46"
          strokeWidth="1.5"
          strokeDasharray="3,3"
        />
      </svg>
    );
  }
  const w = 80,
    h = 24;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `${pts[0].split(",")[0]},${h} ${polyline} ${pts[pts.length - 1].split(",")[0]},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Pulsing status dot
function PulseDot({ color = "emerald" }) {
  const colors = {
    emerald: { ring: "bg-emerald-400", glow: "bg-emerald-400" },
    rose: { ring: "bg-rose-400", glow: "bg-rose-400" },
    amber: { ring: "bg-amber-400", glow: "bg-amber-400" },
    violet: { ring: "bg-violet-400", glow: "bg-violet-400" },
  };
  const c = colors[color] || colors.emerald;
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.glow} opacity-50`}
      ></span>
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${c.ring}`}
      ></span>
    </span>
  );
}

function MetricTile({
  icon,
  label,
  value,
  sub,
  color,
  sparkData,
  sparkColor,
  trend,
  dot,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-all"
    >
      {/* Subtle gradient overlay */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${color} to-transparent`}
      />

      <div className="relative flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl bg-zinc-800 border border-white/[0.06]`}
            >
              {icon}
            </div>
            {dot && <PulseDot color={dot} />}
          </div>
          <Sparkline data={sparkData} color={sparkColor} />
        </div>

        <p className="text-2xl font-bold text-zinc-100 font-mono tabular-nums">
          {value ?? "—"}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        {sub && (
          <p className="text-[10px] text-zinc-700 mt-1 font-mono">{sub}</p>
        )}
        {trend != null && (
          <div
            className={`mt-2 text-[10px] font-semibold ${trend >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PassRateBar({ passed, failed, pending, total }) {
  if (total === 0)
    return <p className="text-[10px] text-zinc-700 italic">No tests yet</p>;
  const passW = Math.round((passed / total) * 100);
  const failW = Math.round((failed / total) * 100);
  const pendW = Math.round((pending / total) * 100);
  return (
    <div className="flex rounded-full overflow-hidden h-1 w-full bg-zinc-800">
      {passW > 0 && (
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${passW}%` }}
        />
      )}
      {failW > 0 && (
        <div
          className="bg-rose-500 transition-all"
          style={{ width: `${failW}%` }}
        />
      )}
      {pendW > 0 && (
        <div
          className="bg-zinc-600 transition-all"
          style={{ width: `${pendW}%` }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-zinc-600 text-xs font-mono">
            Loading command center...
          </p>
        </div>
      </div>
    );
  }

  // Mock sparkline data — replace with real 24h activity data from backend
  const mockSparkA = [3, 5, 2, 8, 6, 4, 9, 7, 5, 11, 8, 6];
  const mockSparkB = [1, 2, 4, 3, 6, 5, 8, 6, 9, 7, 10, 9];
  const mockSparkC = [8, 6, 5, 4, 7, 8, 6, 4, 5, 6, 7, 8];

  const passRate = stats?.overallPassRate;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Command Center</h1>
            <p className="text-[11px] text-zinc-600">API health overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 border border-white/[0.08] rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
          >
            <History size={12} /> History
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 border border-white/[0.08] rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
          >
            <Settings size={12} /> Settings
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-white bg-violet-600 hover:bg-violet-500 rounded-lg font-semibold transition-all shadow-lg shadow-violet-500/20"
          >
            Workbench <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricTile
          icon={<Layers size={16} className="text-sky-400" />}
          label="Total APIs"
          value={stats?.totalApis}
          sub="across all workspaces"
          color="from-sky-500/5"
          sparkData={mockSparkA}
          sparkColor="#38bdf8"
          dot="violet"
        />
        <MetricTile
          icon={<FlaskConical size={16} className="text-violet-400" />}
          label="Test Cases"
          value={stats?.totalCases}
          sub={`${stats?.totalPassed ?? 0} passed · ${stats?.totalFailed ?? 0} failed`}
          color="from-violet-500/5"
          sparkData={mockSparkB}
          sparkColor="#a78bfa"
          dot="violet"
        />
        <MetricTile
          icon={<TrendingUp size={16} className="text-emerald-400" />}
          label="Pass Rate"
          value={passRate != null ? `${passRate}%` : "—"}
          sub={`${stats?.totalPassed ?? 0}P · ${stats?.totalFailed ?? 0}F`}
          color="from-emerald-500/5"
          sparkData={mockSparkC}
          sparkColor="#34d399"
          trend={passRate != null ? 4 : null}
          dot={passRate >= 80 ? "emerald" : "rose"}
        />
        <MetricTile
          icon={<Clock size={16} className="text-amber-400" />}
          label="Pending"
          value={stats?.totalPending}
          sub="awaiting first run"
          color="from-amber-500/5"
          sparkData={[2, 1, 3, 2, 1, 0, 1, 2, 0, 1, 2, 1]}
          sparkColor="#fbbf24"
          dot="amber"
        />
      </div>

      {/* Per-API table */}
      <div className="bg-zinc-900 rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-zinc-600" />
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              API Endpoints
            </h2>
          </div>
          <span className="text-[10px] text-zinc-700 font-mono">
            {stats?.perApi?.length ?? 0} total
          </span>
        </div>

        {!stats?.perApi?.length ? (
          <div className="p-16 text-center text-zinc-700">
            <FlaskConical size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs">
              No APIs yet — head to the workbench to create one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {stats.perApi.map((api, i) => (
              <motion.div
                key={api._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate("/home")}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-800/50 cursor-pointer transition-all group"
              >
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono min-w-[44px] text-center ${METHOD_COLORS[api.method] || "bg-zinc-800 text-zinc-500 border-zinc-700"}`}
                >
                  {api.method}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-300 truncate group-hover:text-zinc-100 transition-colors">
                    {api.apiName}
                  </p>
                  <p className="text-[10px] text-zinc-700 font-mono mt-0.5">
                    {api.lastRun
                      ? `${new Date(api.lastRun).toLocaleString()}`
                      : "Never run"}
                  </p>
                </div>

                <div className="w-24 hidden md:flex flex-col gap-1">
                  <PassRateBar
                    passed={api.passed}
                    failed={api.failed}
                    pending={api.pending}
                    total={api.total}
                  />
                  <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-700">
                    <span>{api.passed}P</span>
                    <span>{api.failed}F</span>
                    <span>{api.pending}·</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold w-8 justify-end">
                  {api.passRate != null ? (
                    <span
                      className={`font-mono ${api.passRate === 100 ? "text-emerald-400" : api.passRate >= 50 ? "text-amber-400" : "text-rose-400"}`}
                    >
                      {api.passRate}%
                    </span>
                  ) : (
                    <span className="text-zinc-700">—</span>
                  )}
                </div>

                <ChevronRight
                  size={13}
                  className="text-zinc-700 group-hover:text-zinc-500 transition-colors"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
