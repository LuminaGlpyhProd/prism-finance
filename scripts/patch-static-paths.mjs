/**
 * Makes static export work with Electron file:// and Capacitor local WebView.
 * Run after `next build` when packaging desktop/mobile shells.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith(".html") || name.endsWith(".js") || name.endsWith(".css"))
      files.push(p);
  }
  return files;
}

function patch(content) {
  return content
    .replace(/href="\/_next\//g, 'href="./_next/')
    .replace(/src="\/_next\//g, 'src="./_next/')
    .replace(/href="\/icons\//g, 'href="./icons/')
    .replace(/href="\/manifest\.json"/g, 'href="./manifest.json"')
    .replace(/"\/_next\//g, '"./_next/');
}

let count = 0;
for (const file of walk(outDir)) {
  const raw = readFileSync(file, "utf8");
  const next = patch(raw);
  if (next !== raw) {
    writeFileSync(file, next);
    count++;
  }
}
console.log(`Patched ${count} files in out/`);
