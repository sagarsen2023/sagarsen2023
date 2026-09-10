// Desaturates SVG cards in place so colored third-party cards match the monochrome README.
// Usage: node monochrome.mjs file.svg [more.svg ...]  (missing and already converted files are skipped)
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const MARKER = 'data-monochrome="true"';
const FILTER =
  '<defs><filter id="monochrome-filter" color-interpolation-filters="sRGB">' +
  '<feColorMatrix type="saturate" values="0"/></filter></defs>';

for (const file of process.argv.slice(2)) {
  if (!existsSync(file)) {
    console.log(`skip ${file} (missing)`);
    continue;
  }

  const svg = readFileSync(file, "utf8");
  if (svg.includes(MARKER)) {
    console.log(`skip ${file} (already monochrome)`);
    continue;
  }

  const open = svg.match(/<svg\b[^>]*>/);
  const close = svg.lastIndexOf("</svg>");
  if (!open || close === -1) {
    console.warn(`skip ${file} (not an svg)`);
    continue;
  }

  const bodyStart = open.index + open[0].length;
  const converted =
    svg.slice(0, open.index) +
    open[0].replace(/^<svg/, `<svg ${MARKER}`) +
    FILTER +
    '<g filter="url(#monochrome-filter)">' +
    svg.slice(bodyStart, close) +
    "</g>" +
    svg.slice(close);

  writeFileSync(file, converted);
  console.log(`monochrome ${file}`);
}
