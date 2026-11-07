const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.join(__dirname, "..", "..");
const clientDir = path.join(repoRoot, "client");
const clientDist = path.join(clientDir, "dist");
const serverDist = path.join(__dirname, "..", "dist");

function run(command, args, cwd) {
  const res = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      await copyDir(s, d);
    } else if (entry.isFile()) {
      // eslint-disable-next-line no-await-in-loop
      await fs.promises.copyFile(s, d);
    }
  }
}

async function main() {
  if (!fs.existsSync(clientDir)) {
    throw new Error(`Client directory not found: ${clientDir}`);
  }

  console.log("Building client...");
  run("npm", ["run", "build"], clientDir);

  if (!fs.existsSync(clientDist)) {
    throw new Error(`Client dist not found after build: ${clientDist}`);
  }

  console.log("Syncing client/dist -> server/dist ...");
  await fs.promises.rm(serverDist, { recursive: true, force: true });
  await copyDir(clientDist, serverDist);

  console.log("Done. Server will serve ./dist automatically.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

