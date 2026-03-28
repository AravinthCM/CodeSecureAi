// components/Settings/SettingsPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { Save, RotateCcw, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-8 py-5 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0 w-72">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const navigate = useNavigate();

  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local draft state — only commit on Save
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your workspace preferences
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

      <div className="max-w-2xl">
        {/* API Configuration section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase pt-5 pb-3 border-b border-gray-100">
            API Configuration
          </h2>

          <SettingRow
            label="Base URL"
            description="Prepended to all API calls. Change this when switching between local, staging, and production."
          >
            <input
              type="text"
              value={draft.baseUrl}
              onChange={(e) =>
                setDraft((d) => ({ ...d, baseUrl: e.target.value }))
              }
              placeholder="http://localhost:5000"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </SettingRow>

          <SettingRow
            label="Default Method"
            description="Pre-selected HTTP method when creating a new API."
          >
            <select
              value={draft.defaultMethod}
              onChange={(e) =>
                setDraft((d) => ({ ...d, defaultMethod: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </SettingRow>
        </div>

        {/* Auth section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase pt-5 pb-3 border-b border-gray-100">
            Authentication
          </h2>

          <SettingRow
            label="Auth Token"
            description="Bearer token sent with every request. Auto-populated on login — update this if your token expires."
          >
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={draft.authToken}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, authToken: e.target.value }))
                }
                placeholder="Paste your JWT here"
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
              <button
                onClick={() => setShowToken((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </SettingRow>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            <RotateCcw size={14} /> Reset to defaults
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {saved ? (
              <>
                <CheckCircle2 size={15} /> Saved!
              </>
            ) : (
              <>
                <Save size={15} /> Save settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
