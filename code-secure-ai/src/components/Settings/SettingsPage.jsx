// components/Settings/SettingsPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import {
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Settings,
  ChevronRight,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

function SettingRow({ label, description, children, icon: Icon }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 border-b border-white/[0.04] last:border-0">
      <div className="flex gap-3">
        {Icon && (
          <div className="mt-1 p-2 rounded-lg bg-zinc-800/50 border border-white/[0.06] text-zinc-500">
            <Icon size={16} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-200">{label}</p>
          {description && (
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed max-w-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 w-full md:w-80">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const navigate = useNavigate();

  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ ...settings });

  const handleSave = () => {
    Object.entries(draft).forEach(([key, value]) => {
      updateSetting(key, value);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!window.confirm("Reset all settings to defaults?")) return;
    resetSettings();
    setDraft({
      baseUrl: "http://localhost:5000",
      defaultMethod: "GET",
      authToken: "",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center shadow-2xl">
            <Settings className="text-violet-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Workspace Settings
            </h1>
            <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
              Environment & Security
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-xs font-medium text-zinc-400 border border-white/[0.08] rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20"
          >
            Workbench <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* API Configuration section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="px-8 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              Network Configuration
            </h2>
          </div>

          <div className="px-8">
            <SettingRow
              icon={Globe}
              label="Gateway Base URL"
              description="The root address for all API calls. Supports local, staging, or production environments."
            >
              <input
                type="text"
                value={draft.baseUrl}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, baseUrl: e.target.value }))
                }
                placeholder="http://localhost:5000"
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 outline-none font-mono transition-all placeholder:text-zinc-700"
              />
            </SettingRow>

            <SettingRow
              icon={Zap}
              label="Default Verb"
              description="The pre-selected HTTP method for newly initialized API test blocks."
            >
              <select
                value={draft.defaultMethod}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, defaultMethod: e.target.value }))
                }
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-violet-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </SettingRow>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="px-8 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              Identity & Security
            </h2>
          </div>

          <div className="px-8">
            <SettingRow
              icon={ShieldCheck}
              label="Bearer Authentication"
              description="Standard JWT or API Key passed in the authorization header. Encrypted at rest."
            >
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={draft.authToken}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, authToken: e.target.value }))
                  }
                  placeholder="Bearer eyJhbGciOiJIUzI1..."
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 pr-12 text-sm text-zinc-100 focus:border-violet-500/50 outline-none font-mono transition-all placeholder:text-zinc-700"
                />
                <button
                  onClick={() => setShowToken((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </SettingRow>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 px-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl ${
              saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                : "bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} /> Changes Applied
              </>
            ) : (
              <>
                <Save size={16} /> Commit Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
