import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";

const dirname = path.dirname(new URL(import.meta.url).pathname);
const outDir = path.join(dirname, "dist");

const entryPoints = {
  ts: ["popup.tsx", "content.tsx"],
  other: [
    path.join(dirname, "manifest.json"),
    path.join(dirname, "popup.html"),
  ],
};

await esbuild.build({
  entryPoints: entryPoints.ts,
  bundle: true,
  minify: false,
  outdir: outDir,
  jsx: "automatic",
  jsxFactory: "React.createElement",
});

setTimeout(() => {
  entryPoints.other.forEach((file) => {
    const outFile = path.join(outDir, path.basename(file));

    let shouldCopy = true;
    if (fs.existsSync(outFile)) {
      console.log(`Checking ${file} for changes...`);
      const fileContent = fs.readFileSync(file, "utf8");
      const outContent = fs.readFileSync(outFile, "utf8");

      const finalContent = util.diff(fileContent, outContent);

      if (finalContent.length > 0) {
        console.log(`${file} has changed, removing ${outFile}...`);
        fs.rmSync(outFile);
        shouldCopy = true;
      } else {
        console.log(`${file} is up to date, skipping...`);
        shouldCopy = false;
      }
    }

    if (shouldCopy) {
      console.log(`Copying ${file} to ${outFile}...`);
      fs.copyFileSync(file, outFile);
    }
  });
}, 0);
