import {
  Plus,
  X,
  MoreVertical,
  Trash2,
  Search,
  Github,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const METHOD_CONFIG = {
  GET: {
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
  POST: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  PUT: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  DELETE: {
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
  },
};

export default function ApiSidebar({
  apiData,
  selected,
  search,
  setSearch,
  showAddForm,
  setShowAddForm,
  newApiName,
  setNewApiName,
  newMethod,
  setNewMethod,
  createApi,
  setSelected,
  setMethod,
  onDeleteApi,
  onScanClick,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const filtered = apiData.filter((api) =>
    api.apiName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-72 bg-zinc-950 border-r border-white/[0.06] flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight font-mono">
            ApiWorkbench
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search APIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-white/[0.08] text-zinc-300 placeholder-zinc-600 text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-violet-500/20"
          >
            {showAddForm ? <X size={13} /> : <Plus size={13} />}
            {showAddForm ? "Cancel" : "New API"}
          </button>
          <button
            onClick={onScanClick}
            title="Scan GitHub repo"
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
          >
            <Github size={14} />
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2 p-3 bg-zinc-900 rounded-xl border border-white/[0.06]">
                <input
                  type="text"
                  placeholder="API name..."
                  value={newApiName}
                  onChange={(e) => setNewApiName(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/[0.08] text-zinc-200 placeholder-zinc-600 text-xs rounded-lg px-3 py-2 outline-none focus:border-violet-500/50 transition-all"
                />
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/[0.08] text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-violet-500/50 transition-all"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
                <button
                  onClick={createApi}
                  className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Create API
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* API List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
        <p className="px-2 py-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          Endpoints · {filtered.length}
        </p>

        <AnimatePresence>
          {filtered.map((api, i) => {
            const mc = METHOD_CONFIG[api.method] || METHOD_CONFIG.GET;
            const isSelected = selected?._id === api._id;

            return (
              <motion.div
                key={api._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`relative group rounded-lg mb-0.5 transition-all ${
                  isSelected ? "bg-zinc-800 shadow-inner" : "hover:bg-zinc-900"
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-full" />
                )}

                <div
                  className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                  onClick={() => {
                    setSelected(api);
                    setMethod(api.method);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono ${mc.bg} ${mc.text} ${mc.border}`}
                    >
                      {api.method}
                    </span>
                    <span
                      className={`text-xs font-medium truncate ${isSelected ? "text-zinc-100" : "text-zinc-400"}`}
                    >
                      {api.apiName}
                    </span>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === api._id ? null : api._id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all"
                    >
                      <MoreVertical size={13} />
                    </button>

                    <AnimatePresence>
                      {openMenuId === api._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -5 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              onDeleteApi(api._id);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 size={12} />
                            Delete API
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-700">
            <Zap size={24} className="mb-2" />
            <p className="text-xs">No APIs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
