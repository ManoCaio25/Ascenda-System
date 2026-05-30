import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const scanRoots = [
  "AscendaSystem-React",
  "AscendaSystem-Node/src",
  "AscendaSystem-Node/database",
].map((entry) => path.join(repoRoot, entry));

const ignoredDirs = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  ".vite",
  "coverage",
  "assets",
]);

const ignoredFiles = new Set([
  "package-lock.json",
]);

const scannedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".sql",
]);

const allowedLocalStorageFiles = new Map([
  ["AscendaSystem-React/LoadingPage/src/App.jsx", /UI_STORAGE_KEY|"ascenda_login_preferences"/],
  ["AscendaSystem-React/Login/src/App.jsx", /UI_STORAGE_KEY|"ascenda_login_preferences"/],
  ["AscendaSystem-React/InternPortal/src/Components/utils/i18n.jsx", /["']ascenda-language["']/],
  [
    "AscendaSystem-React/InternPortal/src/Components/utils/accessibility.jsx",
    /["']ascenda-(high-contrast|focus-mode)["']/,
  ],
  ["AscendaSystem-React/InternPortal/src/layout.jsx", /["']ascenda-(theme|focus-mode)["']/],
  ["AscendaSystem-React/InternPortal/src/Pages/Settings.jsx", /["']ascenda-theme["']/],
  ["AscendaSystem-React/MentorPortal/src/i18n/LanguageProvider.jsx", /STORAGE_KEY|["']language["']/],
  ["AscendaSystem-React/MentorPortal/src/i18n/index.jsx", /STORAGE_KEY|["']language["']/],
  ["AscendaSystem-React/MentorPortal/src/components/theme/ThemeProvider.jsx", /["']theme["']/],
]);

const forbiddenPatterns = [
  { name: "stored API token key", pattern: /ascenda_api_token/i },
  { name: "stored auth accounts key", pattern: /ascenda_auth_accounts/i },
  { name: "stored current user key", pattern: /ascenda_current_user_id/i },
  { name: "stored current session key", pattern: /ascenda_current_session/i },
  { name: "local quiz draft storage", pattern: /ascenda_quizzes/i },
  { name: "demo password", pattern: /123@Mudar|123456/i },
  { name: "demo email/persona", pattern: /paulo\.viera|caio\.alvarenga|Caio Menezes|Caio Alvarenga/i },
  { name: "stock/demo image", pattern: /images\.unsplash|steamstatic|lumiere/i },
  { name: "frontend mock IA generator", pattern: /fakeAscendaIA|mock service|Option A/i },
];

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirs.has(entry.name) ? [] : listFiles(fullPath);
    }

    if (!entry.isFile()) return [];
    if (ignoredFiles.has(entry.name)) return [];
    return scannedExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function localStorageCalls(content) {
  return content.matchAll(/\b(?:window\.)?localStorage\.(?:getItem|setItem|removeItem)\(\s*([\s\S]*?)\)/g);
}

const findings = [];

for (const filePath of scanRoots.flatMap(listFiles)) {
  const repoPath = toRepoPath(filePath);
  const content = fs.readFileSync(filePath, "utf8");

  for (const { name, pattern } of forbiddenPatterns) {
    const match = pattern.exec(content);
    if (match) {
      findings.push(`${repoPath}:${lineNumberFor(content, match.index)} ${name}`);
    }
  }

  for (const match of localStorageCalls(content)) {
    const allowedKeyPattern = allowedLocalStorageFiles.get(repoPath);
    if (!allowedKeyPattern) {
      findings.push(`${repoPath}:${lineNumberFor(content, match.index)} localStorage outside UI-preference allowlist`);
      continue;
    }

    const keyExpression = match[1].split(",")[0].trim();
    if (!allowedKeyPattern.test(keyExpression)) {
      findings.push(`${repoPath}:${lineNumberFor(content, match.index)} non-approved localStorage key: ${keyExpression}`);
    }
  }
}

if (findings.length > 0) {
  console.error("Sensitive hardcode/storage audit failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Sensitive hardcode/storage audit passed.");
