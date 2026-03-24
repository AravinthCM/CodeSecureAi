import { useState, useEffect } from "react";
import ApiSidebar from "./ApiSidebar";
import ApiWorkbench from "./ApiWorkbench";

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
  const [payloads, setPayloads] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/apis", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch APIs");
      }

      const data = await res.json();
      setApiData(data);

      if (data.length) {
        setSelected(data[0]);
        setMethod(data[0].method);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load APIs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createApi = async () => {
    if (!newMethod || !newApiName) return;

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
    setNewApiName("");
    setNewMethod("GET");
    setShowAddForm(false);
  };

  const handleSend = async () => {
    try {
      const res = await fetch(url, { method });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    }
  };

  const onDeleteApi = async (id) => {
    if (!window.confirm("Delete this API?")) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/apis/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setApiData((prev) => prev.filter((api) => api._id !== id));
    } else {
      alert("Failed to delete API");
    }
  };

  const generateAiPayloads = async (combinedDescription) => {
    if (!url) return alert("Please enter a URL first");

    setIsGenerating(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/ai/generate-payloads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            url,
            apiName: selected.apiName,
            apiDescription: combinedDescription,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setPayloads(data.payloads);
      } else {
        console.error(data);
        alert("AI failed to generate test cases");
      }
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading APIs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md border border-red-200 text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchApis}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ApiSidebar
        apiData={apiData}
        selected={selected}
        search={search}
        setSearch={setSearch}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        newApiName={newApiName}
        setNewApiName={setNewApiName}
        newMethod={newMethod}
        setNewMethod={setNewMethod}
        createApi={createApi}
        setSelected={setSelected}
        setMethod={setMethod}
        onDeleteApi={onDeleteApi}
      />

      <ApiWorkbench
        selected={selected}
        method={method}
        setMethod={setMethod}
        url={url}
        setUrl={setUrl}
        response={response}
        handleSend={handleSend}
        payloads={payloads}
        generateAiPayloads={generateAiPayloads}
        isGenerating={isGenerating}
      />
    </div>
  );
}
