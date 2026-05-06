import { spawn } from "node:child_process";

const heartbeatSec = Number(process.env.BUILD_HEARTBEAT_SEC ?? "15");
const isWindows = process.platform === "win32";
const command = isWindows ? "npx.cmd" : "npx";
const args = ["astro", "build"];

const child = spawn(command, args, {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

let lastOutputAt = Date.now();

const heartbeatTimer = setInterval(() => {
  const idleSec = Math.floor((Date.now() - lastOutputAt) / 1000);
  const now = new Date().toISOString();
  process.stdout.write(`${now} [build] still running... idle ${idleSec}s\n`);
}, Math.max(5, heartbeatSec) * 1000);

function forward(stream, target) {
  stream.on("data", (chunk) => {
    lastOutputAt = Date.now();
    target.write(chunk);
  });
}

forward(child.stdout, process.stdout);
forward(child.stderr, process.stderr);

child.on("close", (code, signal) => {
  clearInterval(heartbeatTimer);

  if (signal) {
    process.stderr.write(`[build] terminated by signal: ${signal}\n`);
    process.exit(1);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  clearInterval(heartbeatTimer);
  process.stderr.write(`[build] failed to start: ${error.message}\n`);
  process.exit(1);
});
