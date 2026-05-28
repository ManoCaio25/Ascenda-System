import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(rootDir, "dist");
const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const npmBuildArgs =
  process.platform === "win32" ? ["/d", "/s", "/c", "npm run build"] : ["run", "build"];

const apps = [
  {
    name: "Login",
    projectDir: "AscendaSystem-React/Login",
    publishDir: ".",
  },
  {
    name: "LoadingPage",
    projectDir: "AscendaSystem-React/LoadingPage",
    publishDir: "loading",
  },
  {
    name: "MentorPortal",
    projectDir: "AscendaSystem-React/MentorPortal",
    publishDir: "mentor",
  },
  {
    name: "InternPortal",
    projectDir: "AscendaSystem-React/InternPortal",
    publishDir: "intern",
  },
];

function runBuild(app) {
  const result = spawnSync(npmCommand, npmBuildArgs, {
    cwd: path.join(rootDir, app.projectDir),
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${app.name} build failed`);
  }
}

async function publishApp(app) {
  const appDist = path.join(rootDir, app.projectDir, "dist");
  const targetDir =
    app.publishDir === "." ? outputDir : path.join(outputDir, app.publishDir);

  await mkdir(targetDir, { recursive: true });
  await cp(appDist, targetDir, { recursive: true });
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const app of apps) {
  runBuild(app);
  await publishApp(app);
}

await writeFile(
  path.join(outputDir, "health.txt"),
  "Ascenda System frontend build ready\n",
);

console.log(`Frontend bundle published to ${path.relative(rootDir, outputDir)}`);
