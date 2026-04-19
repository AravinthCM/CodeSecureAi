import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

const TEMP_DIR = path.join(os.tmpdir(), "repo-scanner");

function getAllJsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !["node_modules", ".git", "dist", "build"].includes(entry.name)
    ) {
      getAllJsFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractRoutes(files) {
  const routeRegex =
    /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/gi;
  const routes = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        sourceFile: file,
        fileContent: content,
      });
    }
  }
  return routes;
}

function extractControllerCode(route) {
  const { fileContent, path: routePath, method } = route;

  // Try to grab the inline handler function body
  const escapedPath = routePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const inlineRegex = new RegExp(
    `(?:router|app)\\.${method.toLowerCase()}\\s*\\(\\s*["'\`]${escapedPath}["'\`]\\s*,\\s*(?:.*?,\\s*)?(async\\s*)?(?:function\\s*)?\\(([^)]*?)\\)\\s*\\{`,
    "i",
  );

  const match = inlineRegex.exec(fileContent);
  if (!match) return fileContent.slice(0, 2000); // fallback — return first 2000 chars

  const startIdx = fileContent.indexOf("{", match.index + match[0].length - 1);
  if (startIdx === -1) return fileContent.slice(0, 2000);

  let depth = 0;
  let i = startIdx;
  while (i < fileContent.length) {
    if (fileContent[i] === "{") depth++;
    else if (fileContent[i] === "}") {
      depth--;
      if (depth === 0) return fileContent.slice(startIdx, i + 1);
    }
    i++;
  }
  return fileContent.slice(startIdx, startIdx + 2000);
}

function findSchemaForController(controllerCode, allFiles) {
  // Extract model names used in the controller — e.g. User.findOne, Product.create
  const modelRegex =
    /\b([A-Z][a-zA-Z]+)\.(find|findOne|create|save|updateOne|deleteOne|findById)/g;
  const modelNames = new Set();
  let m;
  while ((m = modelRegex.exec(controllerCode)) !== null) {
    modelNames.add(m[1]);
  }

  for (const file of allFiles) {
    const content = fs.readFileSync(file, "utf-8");
    for (const modelName of modelNames) {
      if (
        content.includes("mongoose.Schema") &&
        (content.includes(`model("${modelName}"`) ||
          content.includes(`model('${modelName}'`) ||
          content.includes(`${modelName}Schema`))
      ) {
        // Extract the schema block
        const schemaStart = content.indexOf("new mongoose.Schema");
        if (schemaStart === -1) continue;
        const braceStart = content.indexOf("{", schemaStart);
        if (braceStart === -1) continue;
        let depth = 0;
        let i = braceStart;
        while (i < content.length) {
          if (content[i] === "{") depth++;
          else if (content[i] === "}") {
            depth--;
            if (depth === 0) return content.slice(schemaStart, i + 1);
          }
          i++;
        }
      }
    }
  }
  return "";
}

export async function scanRepository(repoUrl) {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

  const repoName = repoUrl.split("/").pop().replace(".git", "");
  const clonePath = path.join(TEMP_DIR, `${repoName}_${Date.now()}`);

  try {
    // Clone
    const git = simpleGit();
    await git.clone(repoUrl, clonePath, ["--depth", "1"]);

    // Get all JS files (limit to 100)
    const allFiles = getAllJsFiles(clonePath).slice(0, 100);

    // Extract routes
    const rawRoutes = extractRoutes(allFiles);

    if (rawRoutes.length === 0) {
      return {
        success: false,
        message: "No Express routes found in this repository.",
      };
    }

    // Enrich each route with controller + schema
    const enriched = rawRoutes.map((route) => {
      const controllerCode = extractControllerCode(route);
      const schemaCode = findSchemaForController(controllerCode, allFiles);
      return {
        method: route.method,
        path: route.path,
        controllerCode,
        schemaCode,
      };
    });

    // Deduplicate by method + path
    const seen = new Set();
    const unique = enriched.filter((r) => {
      const key = `${r.method}:${r.path}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { success: true, routes: unique };
  } catch (err) {
    throw err;
  } finally {
    // Cleanup temp dir
    try {
      fs.rmSync(clonePath, { recursive: true, force: true });
    } catch (_) {}
  }
}
