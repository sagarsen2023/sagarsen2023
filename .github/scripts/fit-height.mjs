import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [target, ...files] = process.argv.slice(2);
const height = Number(target);
if (!Number.isFinite(height) || height <= 0) {
  console.error("usage: node fit-height.mjs <height> file.svg [more.svg ...]");
  process.exit(1);
}

for (const file of files) {
  if (!existsSync(file)) {
    console.log(`skip ${file} (missing)`);
    continue;
  }

  const svg = readFileSync(file, "utf8");
  const open = svg.match(/<svg\b[^>]*>/);
  const current = open?.[0].match(/\sheight=(["'])([\d.]+)(?:px)?\1/);
  if (!current) {
    console.warn(`skip ${file} (no height on root svg)`);
    continue;
  }
  if (Number(current[2]) >= height) {
    console.log(`skip ${file} (already ${current[2]}px)`);
    continue;
  }

  const resized = open[0]
    .replace(current[0], ` height="${height}"`)
    .replace(/viewBox=(["'])([^"']+)\1/, (_, q, box) => {
      const [x, y, w] = box.trim().split(/[\s,]+/);
      return `viewBox=${q}${x} ${y} ${w} ${height}${q}`;
    });

  writeFileSync(file, svg.replace(open[0], resized));
  console.log(`fit ${file} ${current[2]} -> ${height}`);
}
