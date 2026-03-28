import { useState, useEffect } from "react";
import ApiSidebar from "./ApiSidebar";
import ApiWorkbench from "./ApiWorkbench";
import { useSettings } from "../../context/SettingsContext";

export default function ApiPage() {
  const { settings } = useSettings();
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
  const [isRunning, setIsRunning] = useState(false);
  const [runningId, setRunningId] = useState(null); // which case is currently running

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${settings.baseUrl}/api/apis`, {
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

    const res = await fetch(`${settings.baseUrl}/api/apis`, {
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

    const res = await fetch(`${settings.baseUrl}/api/apis/${id}`, {
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

  // 1. Pass apiId when calling generateAiPayloads
  const generateAiPayloads = async (combinedDescription) => {
    if (!url) return alert("Please enter a URL first");

    setIsGenerating(true);

    try {
      const res = await fetch(`${settings.baseUrl}/api/ai/generate-payloads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          url,
          apiName: selected.apiName,
          apiDescription: combinedDescription,
          apiId: selected._id, // 👈 added
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPayloads(data.payloads); // payloads now have _id, snapshot, lastRun
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

  // 2. Fetch saved test cases when switching APIs
  const fetchTestCases = async (apiId) => {
    try {
      const res = await fetch(`${settings.baseUrl}/api/test-cases/${apiId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPayloads(data);
    } catch (err) {
      console.error("Failed to fetch test cases", err);
      setPayloads([]);
    }
  };

  // 3. Call fetchTestCases when an API is selected from sidebar
  // Update the setSelected calls to also fetch:
  const handleSelectApi = (api) => {
    setSelected(api);
    setMethod(api.method);
    fetchTestCases(api._id); // 👈 load its saved test cases
  };

  const runAllTestCases = async () => {
    if (!url) return alert("Please enter a URL first");
    if (!payloads.length) return alert("No test cases to run");
    const updatedPayloads = [];
    setIsRunning(true);

    for (const testCase of payloads) {
      setRunningId(testCase._id);

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body:
            method !== "GET"
              ? JSON.stringify(testCase.payload.payload)
              : undefined,
        });

        const statusCode = res.status;

        // ✅ Read body once as text, then try to parse as JSON
        const rawText = await res.text();
        let actualResponse;
        try {
          actualResponse = JSON.parse(rawText);
        } catch {
          actualResponse = { raw: rawText };
        }

        const patchRes = await fetch(
          `${settings.baseUrl}/api/test-cases/${testCase._id}/result`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ statusCode, actualResponse }),
          },
        );

        const patchData = await patchRes.json();

        if (patchData.success) {
          updatedPayloads.push(patchData.testCase); // 👈 collect
          setPayloads((prev) =>
            prev.map((p) => (p._id === testCase._id ? patchData.testCase : p)),
          );
        } else {
          updatedPayloads.push(testCase);
        }
      } catch (err) {
        console.error(`Failed to run test case ${testCase._id}:`, err);
        updatedPayloads.push(testCase);
      }
    }

    await saveRunHistory("all", updatedPayloads); // 👈 after loop
    setRunningId(null);
    setIsRunning(false);
  };

  const runSingleTestCase = async (testCase) => {
    if (!url) return alert("Please enter a URL first");

    setRunningId(testCase._id);
    setIsRunning(true);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:
          method !== "GET"
            ? JSON.stringify(testCase.payload.payload)
            : undefined,
      });

      const statusCode = res.status;
      const rawText = await res.text();
      let actualResponse;
      try {
        actualResponse = JSON.parse(rawText);
      } catch {
        actualResponse = { raw: rawText };
      }

      const patchRes = await fetch(
        `${settings.baseUrl}/api/test-cases/${testCase._id}/result`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ statusCode, actualResponse }),
        },
      );

      const patchData = await patchRes.json();

      if (patchData.success) {
        setPayloads((prev) =>
          prev.map((p) => (p._id === testCase._id ? patchData.testCase : p)),
        );
      }
    } catch (err) {
      console.error(`Failed to run test case ${testCase._id}:`, err);
    } finally {
      setPayloads((prev) => {
        const latest = prev.find((p) => p._id === testCase._id) || testCase;
        saveRunHistory("single", [latest]); // 👈 record single run
        return prev;
      });
      setRunningId(null);
      setIsRunning(false);
    }
  };

  const resetSnapshot = async (id) => {
    try {
      await fetch(`${settings.baseUrl}/api/test-cases/${id}/result`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ resetSnapshot: true }),
      });

      // Clear snapshot locally so next run captures fresh
      setPayloads((prev) =>
        prev.map((p) =>
          p._id === id
            ? { ...p, snapshot: null, lastRun: { ...p.lastRun, passed: null } }
            : p,
        ),
      );
    } catch (err) {
      console.error("Failed to reset snapshot:", err);
    }
  };

  const deleteTestCase = async (id) => {
    try {
      await fetch(`${settings.baseUrl}/api/test-cases/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayloads((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete test case:", err);
    }
  };

  const saveRunHistory = async (runType, ranCases) => {
    try {
      await fetch(`${settings.baseUrl}/api/run-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          apiId: selected._id,
          apiName: selected.apiName,
          runType,
          results: ranCases.map((tc) => ({
            testCaseId: tc._id,
            title: tc.payload?.title || "Untitled",
            statusCode: tc.lastRun?.statusCode ?? null,
            passed: tc.lastRun?.passed ?? null,
          })),
        }),
      });
    } catch (err) {
      console.error("Failed to save run history", err);
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
        setSelected={handleSelectApi}
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
        payloads={payloads}
        generateAiPayloads={generateAiPayloads}
        isGenerating={isGenerating}
        isRunning={isRunning}
        runningId={runningId}
        runAllTestCases={runAllTestCases}
        resetSnapshot={resetSnapshot}
        deleteTestCase={deleteTestCase}
        runSingleTestCase={runSingleTestCase}
      />
    </div>
  );
}
