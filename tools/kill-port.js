import { execSync } from "child_process";

function uniq(a) {
  return Array.from(new Set(a.filter(Boolean)));
}

function killPids(pids) {
  const killed = [];
  for (const pid of uniq(pids)) {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      } else {
        try {
          process.kill(Number(pid), "SIGKILL");
        } catch {
          execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        }
      }
      killed.push(String(pid));
    } catch {}
  }
  return killed;
}

function windowsPids(port) {
  try {
    const out = execSync("netstat -ano -p tcp", { stdio: ["ignore", "pipe", "ignore"] }).toString();
    const lines = out.split(/\r?\n/);
    const re = new RegExp(`:${port}\\s`, "i");
    const pids = [];
    for (const line of lines) {
      if (re.test(line) && /LISTENING/i.test(line)) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) pids.push(pid);
      }
    }
    return uniq(pids);
  } catch {
    return [];
  }
}

function posixPids(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { stdio: ["ignore", "pipe", "ignore"] }).toString();
    return uniq(out.split(/\r?\n/).filter(Boolean));
  } catch {
    try {
      const out = execSync(`ss -ltnp 'sport = :${port}'`, { shell: "/bin/bash", stdio: ["ignore", "pipe", "ignore"] }).toString();
      const pids = [];
      const re = /pid=(\d+)/g;
      let m;
      while ((m = re.exec(out))) pids.push(m[1]);
      return uniq(pids);
    } catch {
      try {
        execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
        return [];
      } catch {
        return [];
      }
    }
  }
}

function main() {
  const port = Number(process.argv[2] || "3000");
  if (!port || Number.isNaN(port)) {
    process.stderr.write("Invalid port\n");
    process.exit(1);
  }
  const pids = process.platform === "win32" ? windowsPids(port) : posixPids(port);
  if (pids.length === 0) {
    process.stdout.write("No processes found\n");
    process.exit(0);
  }
  const killed = killPids(pids);
  process.stdout.write(`Killed PIDs: ${killed.join(", ")}\n`);
}

main();
