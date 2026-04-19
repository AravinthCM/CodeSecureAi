import { scanRepository } from "../utils/repoScanner.js";
import Api from "../models/Api.js";

export const scanRepo = async (req, res) => {
  try {
    const { repoUrl, userId } = req.body;

    console.log("repoUrl", repoUrl);

    if (!repoUrl) {
      return res.status(400).json({ message: "repoUrl is required" });
    }

    // Only allow public GitHub/GitLab URLs
    if (
      !repoUrl.startsWith("https://github.com") &&
      !repoUrl.startsWith("https://gitlab.com")
    ) {
      return res.status(400).json({
        message: "Only public GitHub or GitLab repositories are supported.",
      });
    }

    const result = await scanRepository(repoUrl);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    const uid = req.user.id;

    // Save each discovered route as an Api document
    // Update if method+path already exists for this user, otherwise create
    const savedApis = await Promise.all(
      result.routes.map(async (route) => {
        const apiName = `${route.method} ${route.path}`;
        const existing = await Api.findOne({ user: uid, apiName });
        if (existing) {
          existing.method = route.method;
          existing.controllerCode = route.controllerCode;
          existing.schemaCode = route.schemaCode;
          await existing.save();
          return existing;
        }
        return await Api.create({
          user: uid,
          apiName,
          method: route.method,
          controllerCode: route.controllerCode,
          schemaCode: route.schemaCode,
        });
      }),
    );

    return res.json({
      success: true,
      count: savedApis.length,
      apis: savedApis,
    });
  } catch (err) {
    console.error("❌ scanRepo error:", err);
    if (
      err.message?.includes("not found") ||
      err.message?.includes("Repository")
    ) {
      return res
        .status(404)
        .json({ message: "Repository not found or is private." });
    }
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};
