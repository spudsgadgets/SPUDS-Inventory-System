import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoDir = path.resolve(__dirname, "..");

function hasChanges() {
  try {
    const out = execSync("git status --porcelain", { cwd: repoDir }).toString().trim();
    return out.length > 0;
  } catch {
    return false;
  }
}

function syncNow() {
  try {
    execSync("git add -A", { cwd: repoDir });
    const msg = `Auto-sync: ${new Date().toISOString()}`;
    execSync(`git commit -m "${msg}"`, { cwd: repoDir });
    execSync("git push origin main", { cwd: repoDir });
  } catch {}
}

const once = process.argv.includes("--once");
const check = process.argv.includes("--check");
if (once) {
  if (hasChanges()) syncNow();
  process.exit(0);
}
if (check) {
  try {
    const out = execSync("git status --porcelain", { cwd: repoDir }).toString();
    process.stdout.write(out);
  } catch {}
  process.exit(0);
}

function runLoop() {
  let lastTime = 0;
  const intervalMs = 10000;
  setInterval(() => {
    const now = Date.now();
    if (now - lastTime < intervalMs) return;
    lastTime = now;
    if (hasChanges()) syncNow();
  }, intervalMs);
}

runLoop();

process.on("SIGINT", () => process.exit(0));
