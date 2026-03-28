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
} from "lucide-react";

const METHOD_COLORS = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function PassRateBar({ passed, failed, pending, total }) {
  if (total === 0) {
    return <p className="text-xs text-gray-400 italic">No test cases yet</p>;
  }
  const passW = Math.round((passed / total) * 100);
  const failW = Math.round((failed / total) * 100);
  const pendW = Math.round((pending / total) * 100);
  return (
    <div className="flex rounded-full overflow-hidden h-2 w-full bg-gray-100">
      {passW > 0 && (
        <div
          className="bg-green-400 transition-all"
          style={{ width: `${passW}%` }}
        />
      )}
      {failW > 0 && (
        <div
          className="bg-red-400  transition-all"
          style={{ width: `${failW}%` }}
        />
      )}
      {pendW > 0 && (
        <div
          className="bg-gray-300 transition-all"
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all your APIs and test results
          </p>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Go to Workbench →
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Layers size={20} />}
          label="Total APIs"
          value={stats?.totalApis}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<FlaskConical size={20} />}
          label="Total Test Cases"
          value={stats?.totalCases}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Overall Pass Rate"
          value={
            stats?.overallPassRate != null ? `${stats.overallPassRate}%` : "—"
          }
          sub={`${stats?.totalPassed} passed · ${stats?.totalFailed} failed`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pending"
          value={stats?.totalPending}
          sub="not yet run"
          color="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Per-API table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">APIs</h2>
        </div>

        {stats?.perApi?.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FlaskConical size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No APIs yet. Head to the workbench to create one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats?.perApi?.map((api) => (
              <div
                key={api._id}
                onClick={() => navigate("/home")}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition group"
              >
                {/* Method badge */}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-[52px] text-center ${METHOD_COLORS[api.method] || "bg-gray-100 text-gray-600"}`}
                >
                  {api.method}
                </span>

                {/* API name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {api.apiName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {api.lastRun
                      ? `Last run ${new Date(api.lastRun).toLocaleString()}`
                      : "Never run"}
                  </p>
                </div>

                {/* Pass rate bar */}
                <div className="w-32 hidden md:block">
                  <PassRateBar
                    passed={api.passed}
                    failed={api.failed}
                    pending={api.pending}
                    total={api.total}
                  />
                </div>

                {/* Counts */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {api.total > 0 ? (
                    <>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 size={13} /> {api.passed}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle size={13} /> {api.failed}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock size={13} /> {api.pending}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">No cases</span>
                  )}
                </div>

                {/* Pass rate % */}
                <div className="w-12 text-right">
                  {api.passRate != null ? (
                    <span
                      className={`text-sm font-bold ${
                        api.passRate === 100
                          ? "text-green-600"
                          : api.passRate >= 50
                            ? "text-yellow-600"
                            : "text-red-500"
                      }`}
                    >
                      {api.passRate}%
                    </span>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </div>

                <ChevronRight
                  size={16}
                  className="text-gray-300 group-hover:text-gray-500 transition"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
