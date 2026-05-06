import { spawn } from "node:child_process";
import { opendir } from "node:fs/promises";
import path from "node:path";

const heartbeatSec = Number(process.env.BUILD_HEARTBEAT_SEC ?? "15");
const imageStallSec = Number(process.env.BUILD_IMAGE_STALL_SEC ?? "180");
const failOnImageStall = process.env.BUILD_FAIL_ON_STALL === "1";
const isWindows = process.platform === "win32";
const command = isWindows ? "npx.cmd" : "npx";
const args = ["astro", "build"];

const child = spawn(command, args, {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

let lastOutputAt = Date.now();
let imagePhaseStartedAt = 0;
let expectedImages = 0;
let lastGeneratedFiles = -1;
let lastImageProgressAt = 0;

async function getDirStats(rootDir) {
  let files = 0;
  let bytes = 0;

  try {
    const dir = await opendir(rootDir);
    for await (const entry of dir) {
      const fullPath = path.join(rootDir, entry.name);
      if (entry.isDirectory()) {
        const nested = await getDirStats(fullPath);
        files += nested.files;
        bytes += nested.bytes;
      } else if (entry.isFile()) {
        files += 1;
      }
    }
  } catch {
    return { files: 0, bytes: 0 };
  }

  return { files, bytes };
}

function readProcessSnapshot(pid) {
  if (process.platform === "win32") return "";

  try {
    const ps = spawn("ps", ["-p", String(pid), "-o", "%cpu=,rss="], {
      stdio: ["ignore", "pipe", "ignore"],
    });

    let output = "";
    ps.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    return new Promise((resolve) => {
      ps.on("close", () => {
        const [cpu = "", rssKb = ""] = output.trim().split(/\s+/);
        if (!cpu && !rssKb) {
          resolve("");
          return;
        }
        const rssMb = rssKb ? (Number(rssKb) / 1024).toFixed(0) : "";
        resolve(`cpu=${cpu}% rss=${rssMb}MB`);
      });
      ps.on("error", () => resolve(""));
    });
  } catch {
    return "";
  }
}

const heartbeatTimer = setInterval(async () => {
  const idleSec = Math.floor((Date.now() - lastOutputAt) / 1000);
  const now = new Date().toISOString();
  const procMeta = await readProcessSnapshot(child.pid);

  if (imagePhaseStartedAt > 0) {
    const imageSec = Math.floor((Date.now() - imagePhaseStartedAt) / 1000);
    const astroDir = path.join(process.cwd(), "dist", "_astro");
    const { files } = await getDirStats(astroDir);
    if (files !== lastGeneratedFiles) {
      lastGeneratedFiles = files;
      lastImageProgressAt = Date.now();
    }
    const stalledForSec = Math.floor((Date.now() - lastImageProgressAt) / 1000);
    const expectedLabel = expectedImages > 0 ? `expected=${expectedImages}` : "expected=?";
    const procLabel = procMeta ? ` ${procMeta}` : "";
    const stallLabel = stalledForSec > 0 ? ` stalled=${stalledForSec}s` : "";
    process.stdout.write(
      `${now} [build] image stage ${imageSec}s, ${expectedLabel}, generated=${files}${stallLabel}${procLabel}\n`,
    );

    if (stalledForSec >= imageStallSec) {
      process.stderr.write(
        `${now} [build] WARNING: image stage stalled for ${stalledForSec}s (no new files in dist/_astro)\n`,
      );
      if (failOnImageStall) {
        process.stderr.write(`${now} [build] exiting due to BUILD_FAIL_ON_STALL=1\n`);
        child.kill("SIGTERM");
      }
    }
    return;
  }

  const procLabel = procMeta ? ` ${procMeta}` : "";
  process.stdout.write(`${now} [build] still running... idle ${idleSec}s${procLabel}\n`);
}, Math.max(5, heartbeatSec) * 1000);

function forward(stream, target) {
  stream.on("data", (chunk) => {
    lastOutputAt = Date.now();
    const text = chunk.toString();
    const optimizingMatch = text.match(/optimizing\s+(\d+)\s+images/i);
    if (optimizingMatch) {
      expectedImages = Number(optimizingMatch[1]) || 0;
      imagePhaseStartedAt = Date.now();
      lastImageProgressAt = Date.now();
      lastGeneratedFiles = -1;
    }
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
