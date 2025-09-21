import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const rootDir = path.dirname(url.fileURLToPath(import.meta.url));

const distDir = path.join(rootDir, "dist");

await esbuild.build({
  entryPoints: [
    "src/extension/popup/index.tsx",
    "src/extension/content/index.tsx",
  ],
  bundle: true,
  minify: false,
  outdir: distDir,
  jsx: "automatic",
  jsxFactory: "React.createElement",

  // Load ttf fonts
  loader: {
    ".ttf": "copy",
  },
});

setTimeout(() => {
  console.log("Copying assets");
  const assetsPath = path.join(rootDir, "src/assets");
  fs.cpSync(assetsPath, distDir, { recursive: true });

  console.log("Copying manifest");
  const manifestPath = path.join(rootDir, "manifest.json");
  const manifestContent = fs.readFileSync(manifestPath, "utf8");
  fs.writeFileSync(path.join(distDir, "manifest.json"), manifestContent);

  console.log("Copying popup");
  const popupPath = path.join(rootDir, "src/extension/popup/index.html");
  const popupContent = fs.readFileSync(popupPath, "utf8");
  fs.writeFileSync(path.join(distDir, "popup/index.html"), popupContent);

  console.log("Wrapping CSS with @scope (#focus-mode-extension-root)");
  const contentCssPath = path.join(distDir, "content/index.css");
  const contentCssContent = fs.readFileSync(contentCssPath, "utf8");
  fs.writeFileSync(
    path.join(distDir, "content/index.css"),
    `@scope (#focus-mode-extension-root) { ${contentCssContent} }`
  );

  // Copy public folder
  const publicPath = path.join(rootDir, "public");
  fs.cpSync(publicPath, distDir, { recursive: true });
}, 0);
