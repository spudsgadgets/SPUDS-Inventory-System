import net from "net";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoDir = path.resolve(__dirname, "..");
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
function isUp() {
  return new Promise((resolve) => {
    const sock = net.createConnection({ port, host: "127.0.0.1" }, () => {
      sock.end();
      resolve(true);
    });
    sock.on("error", () => resolve(false));
  });
}
async function waitReady(ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await isUp()) return true;
    await new Promise(r => setTimeout(r, 250));
  }
  return false;
}
const run = async () => {
  const up = await isUp();
  if (up) {
    process.stdout.write(`Server running at http://localhost:${port}/\n`);
    process.exit(0);
  }
  try {
    const child = spawn(process.execPath, [path.join(repoDir, "server.js")], {
      cwd: repoDir,
      stdio: "ignore",
      detached: true
    });
    child.unref();
  } catch {}
  const ok = await waitReady(5000);
  process.stdout.write(`Server ${ok ? "running" : "starting"} at http://localhost:${port}/\n`);
  process.exit(0);
};
run();
