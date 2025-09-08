// Custom
import { loadConfig, type UserInputConfig } from "c12";
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

// Dirs
const root = process.cwd();
const outDir = path.join(root, "dist");
const srcDir = path.join(root, "src");
const extensionRoot = path.join(srcDir, "extension");
const extensionDirs = fs.readdirSync(extensionRoot, { recursive: false });

// Manifest
const manifestPath = {
  in: path.join(root, "manifest.json"),
  out: path.join(outDir, "manifest.json"),
};

const manifest = JSON.parse(fs.readFileSync(manifestPath.in, "utf8"));

// Read meta files, update manifest and generate html
async function readMetaFiles() {
  const metaFiles = extensionDirs.map(async (dir) => {
    if (typeof dir !== "string") {
      const message = "Directory is not a string";
      console.error(message, dir);
      throw new Error(message);
    }

    // Meta path without extension
    const metaPath = path.join(extensionRoot, dir, "meta");

    const { config } = await loadConfig({ configFile: metaPath });

    const inPath = path.join(extensionRoot, dir, "index.tsx");

    return { config, entryPoint: inPath, dir };
  });

  return Promise.all(metaFiles);
}

function createContentScript(
  dir: string,
  { in: field, ...config }: UserInputConfig
) {
  if (field !== "content_scripts") return;

  const relativeJs = path.relative(outDir, path.join(outDir, dir, "index.js"));

  const relativeCss = path.relative(
    outDir,
    path.join(outDir, dir, "index.css")
  );

  const initialContent = Array.isArray(manifest.content_scripts)
    ? manifest.content_scripts
    : [];

  manifest.content_scripts = [
    ...initialContent,
    {
      ...config,
      js: [relativeJs],
      css: [relativeCss],
    },
  ];
}

function createAction(dir: string, { in: field, ...config }: UserInputConfig) {
  if (field !== "action") return;

  const htmlOut = path.join(outDir, dir, "index.html");
  const htmlRelativeOut = path.relative(outDir, htmlOut);

  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="index.css">
          <script src="index.js" type="module" defer></script>
        </head>
      </html>
    `;

  fs.writeFileSync(htmlOut, htmlContent);

  const initialContent =
    typeof manifest.action === "object" && manifest.action !== null
      ? manifest.action
      : {};

  manifest.action = {
    ...initialContent,
    [config.as]: htmlRelativeOut,
  };
}

async function main() {
  const loadedMetaFiles = await readMetaFiles();

  // Build
  await esbuild.build({
    entryPoints: loadedMetaFiles.map((m) => m.entryPoint),
    bundle: true,
    minify: false,
    outdir: outDir,
    jsx: "automatic",
    jsxFactory: "React.createElement",

    // Load ttf fonts
    loader: {
      ".ttf": "copy",
    },
  });

  // Create actions and content scripts
  loadedMetaFiles.forEach((m) => {
    createAction(m.dir, m.config);
    createContentScript(m.dir, m.config);
  });

  // Update manifest
  fs.writeFileSync(manifestPath.out, JSON.stringify(manifest, null, 2));

  // Copy /public to dist
  fs.cpSync(path.join(root, "public"), outDir, { recursive: true });
}

main();
