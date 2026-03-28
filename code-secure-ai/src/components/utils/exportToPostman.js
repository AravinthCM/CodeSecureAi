// utils/exportToPostman.js

export function exportToPostman(apiName, url, method, testCases) {
  const items = testCases.map((tc) => {
    const payload = tc.payload?.payload;

    return {
      name: tc.payload?.title || "Untitled",
      request: {
        method: method,
        header: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
        body:
          method !== "GET"
            ? {
                mode: "raw",
                raw: JSON.stringify(payload, null, 2),
                options: {
                  raw: { language: "json" },
                },
              }
            : undefined,
        url: {
          raw: url,
          protocol: url.split("://")[0],
          host: url.split("://")[1]?.split("/")[0]?.split("."),
          path: url.split("://")[1]?.split("/").slice(1),
        },
        description: tc.payload?.description || "",
      },
      response: [],
    };
  });

  const collection = {
    info: {
      name: apiName,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: items,
  };

  // Trigger download
  const blob = new Blob([JSON.stringify(collection, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${apiName.replace(/\s+/g, "_")}_postman_collection.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
