import { Plus, X, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

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
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const filtered = apiData.filter((api) =>
    api.apiName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    // Changed: border-r is already gray by default in most configs,
    // but we can be explicit with border-gray-200
    <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Search APIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // Changed focus ring to gray
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none"
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            // Changed background to a dark gray for a sleek look
            className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {showAddForm && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="text"
              placeholder="API Name"
              value={newApiName}
              onChange={(e) => setNewApiName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-500"
            />
            <select
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
            <button
              onClick={createApi}
              // Changed to a medium gray
              className="w-full py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition"
            >
              Create API
            </button>
          </div>
        )}
      </div>

      {/* API List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((api) => (
          <div
            key={api._id}
            className={`p-3 mb-1 rounded-lg transition ${
              selected?._id === api._id
                ? "bg-gray-100 border border-gray-400" // Changed from blue-50/blue-200 to gray
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => {
                setSelected(api);
                setMethod(api.method);
              }}
            >
              {/* Select API */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700 border border-gray-300">
                  {api.method}
                </span>
                <span
                  className={`text-sm font-medium ${selected?._id === api._id ? "text-gray-900" : "text-gray-600"}`}
                >
                  {api.apiName}
                </span>
              </div>

              {/* 3-dot menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === api._id ? null : api._id);
                  }}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                >
                  <MoreVertical size={16} />
                </button>

                {openMenuId === api._id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        onDeleteApi(api._id);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete API
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
