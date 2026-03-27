/**
 * Prepares the Next.js standalone output for electron-builder packaging.
 * Copies the standalone server, static assets, and public files into
 * a structure that electron-builder will bundle into app resources.
 */
const fs = require("fs");
const path = require("path");

const clientDir = path.join(__dirname, "..");
const standaloneBase = path.join(clientDir, ".next", "standalone");
const staticSrc = path.join(clientDir, ".next", "static");
const publicSrc = path.join(clientDir, "public");
const outDir = path.join(clientDir, "electron-dist", "standalone");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Clean output
if (fs.existsSync(path.join(clientDir, "electron-dist"))) {
  fs.rmSync(path.join(clientDir, "electron-dist"), { recursive: true });
}

console.log("Copying standalone server...");
copyRecursive(standaloneBase, outDir);

// Next.js standalone doesn't include .next/static — copy it in
const staticDest = path.join(outDir, "packages", "client", ".next", "static");
console.log("Copying static assets...");
copyRecursive(staticSrc, staticDest);

// Copy public folder
const publicDest = path.join(outDir, "packages", "client", "public");
console.log("Copying public assets...");
copyRecursive(publicSrc, publicDest);

console.log("Build prep complete! Output in electron-dist/standalone");
