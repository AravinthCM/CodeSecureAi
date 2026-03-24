import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

export default function ApiPage() {
  const [apiData, setApiData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState("GET");
  const [newApiName, setNewApiName] = useState("");

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/apis", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setApiData(data);
      if (data.length > 0) {
        setSelected(data[0]);
        setMethod(data[0].method);
      }
    } catch (err) {
      console.error("Error fetching APIs:", err.message);
    }
  };

  const createApi = async () => {
    if (!newMethod || !newApiName) return;
    try {
      const res = await fetch("http://localhost:5000/api/apis", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method: newMethod, apiName: newApiName }),
      });
      const data = await res.json();
      setApiData((prev) => [data, ...prev]);
      setNewMethod("GET");
      setNewApiName("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error creating API:", err.message);
    }
  };

  const filtered = apiData.filter((api) =>
    api.apiName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSend = async () => {
    try {
      const res = await fetch(url, { method });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Search APIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {showAddForm ? <X size={20} /> : <Plus size={20} />}
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="API Name"
                value={newApiName}
                onChange={(e) => setNewApiName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <button
                onClick={createApi}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Create API
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((api) => (
            <div
              key={api._id}
              onClick={() => {
                setSelected(api);
                setMethod(api.method);
              }}
              className={`p-3 mb-1 rounded-lg cursor-pointer transition ${
                selected?._id === api._id
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    api.method === "GET"
                      ? "bg-green-100 text-green-700"
                      : api.method === "POST"
                        ? "bg-blue-100 text-blue-700"
                        : api.method === "PUT"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {api.method}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {api.apiName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selected ? (
          <div className="flex-1 flex flex-col p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {selected.apiName}
            </h1>

            <div className="flex gap-3 mb-6">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleSend}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>

            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Response
                </h2>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                  {response || "No response yet"}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-lg">Select an API to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
