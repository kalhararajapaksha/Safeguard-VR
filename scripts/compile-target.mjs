#!/usr/bin/env node
/**
 * Compile a PNG/JPG image into a MindAR `.mind` target file.
 *
 * Usage:
 *   node scripts/compile-target.mjs <inputImage> [outputMindFile]
 *
 * Example:
 *   node scripts/compile-target.mjs public/targets/card.png public/targets/card.mind
 *
 * When no arguments are given, all PNG/JPG files in `public/targets/` are
 * compiled in-place (`foo.png` -> `foo.mind`).
 *
 * NOTE: MindAR's offline compiler depends on the native `canvas` npm module,
 *       which needs Visual Studio C++ build tools on Windows. If `canvas`
 *       failed to build (we install with --ignore-scripts), this script
 *       prints instructions for using MindAR's online compiler instead:
 *       https://hiukim.github.io/mind-ar-js-doc/tools/compile
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function loadCompiler() {
  try {
    const { Compiler } = await import("mind-ar/src/image-target/offline-compiler.js");
    return Compiler;
  } catch (err) {
    console.error("\n[compile-target] MindAR offline compiler is unavailable.");
    console.error(
      "[compile-target] The compiler requires the native `canvas` npm module,",
    );
    console.error(
      "[compile-target] which we install with --ignore-scripts to avoid",
    );
    console.error("[compile-target] needing Visual Studio C++ on Windows.\n");
    console.error("Workarounds:");
    console.error(
      "  1) Use MindAR's online compiler (drag your PNG/JPG, download .mind):",
    );
    console.error("     https://hiukim.github.io/mind-ar-js-doc/tools/compile");
    console.error(
      "  2) Or install build tools and rebuild canvas:",
    );
    console.error(
      "     npm install --build-from-source canvas    (Windows needs VS C++ tools)",
    );
    console.error("\nOriginal error:", err?.message ?? err);
    process.exit(2);
  }
}

async function loadImage(filePath) {
  try {
    const { loadImage: nodeLoadImage } = await import("canvas");
    return await nodeLoadImage(filePath);
  } catch (err) {
    console.error(
      "[compile-target] Could not load `canvas` to read the image:",
      err?.message ?? err,
    );
    process.exit(2);
  }
}

async function compileOne(inputPath, outputPath) {
  const Compiler = await loadCompiler();
  const img = await loadImage(inputPath);

  const compiler = new Compiler();
  console.log(`[compile-target] Compiling ${inputPath} ...`);
  const t0 = Date.now();

  await compiler.compileImageTargets([img], (progress) => {
    process.stdout.write(`\r[compile-target] progress: ${progress.toFixed(1)}%   `);
  });
  process.stdout.write("\n");

  const buffer = await compiler.exportData();
  await fs.writeFile(outputPath, Buffer.from(buffer));
  console.log(
    `[compile-target] Wrote ${outputPath} in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
}

async function main() {
  const [, , inputArg, outputArg] = process.argv;

  if (inputArg) {
    const inputPath = path.resolve(projectRoot, inputArg);
    const outputPath = outputArg
      ? path.resolve(projectRoot, outputArg)
      : inputPath.replace(/\.(png|jpe?g)$/i, ".mind");
    await compileOne(inputPath, outputPath);
    return;
  }

  const targetsDir = path.join(projectRoot, "public", "targets");
  const entries = await fs.readdir(targetsDir).catch(() => []);
  const images = entries.filter((f) => /\.(png|jpe?g)$/i.test(f));
  if (images.length === 0) {
    console.log(
      `[compile-target] No PNG/JPG images in ${targetsDir}. Nothing to do.`,
    );
    return;
  }

  for (const img of images) {
    const inputPath = path.join(targetsDir, img);
    const outputPath = inputPath.replace(/\.(png|jpe?g)$/i, ".mind");
    await compileOne(inputPath, outputPath);
  }
}

main().catch((err) => {
  console.error("[compile-target] Failed:", err);
  process.exit(1);
});
