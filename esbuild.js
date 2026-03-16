import { build } from "esbuild";
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const srcDemoDir = join(rootDir, "src/demo");
const outDemoDir = join(rootDir, "lib/site/demo");
const entryPoint = join(rootDir, "lib/demo/demo.js");
const outFile = join(outDemoDir, "demo.js");

async function copyStaticFiles(srcDir, dstDir) {
    await mkdir(dstDir, { recursive: true });
    const entries = await readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = join(srcDir, entry.name);
        const dstPath = join(dstDir, entry.name);
        if (entry.isDirectory()) {
            await copyStaticFiles(srcPath, dstPath);
        } else if (entry.isFile() && entry.name !== "index.html" && !entry.name.endsWith(".ts")) {
            await mkdir(dirname(dstPath), { recursive: true });
            await copyFile(srcPath, dstPath);
        }
    }
}

async function copyIndexHtml() {
    const srcPath = join(srcDemoDir, "index.html");
    const dstPath = join(outDemoDir, "index.html");
    const html = await readFile(srcPath, "utf8");
    const updatedHtml = html.replace("../../lib/demo/demo.js", "./demo.js");
    if (updatedHtml === html) {
        throw new Error("Failed to adjust demo script include in src/demo/index.html");
    }
    await writeFile(dstPath, updatedHtml, "utf8");
}

await rm(outDemoDir, { recursive: true, force: true });
await mkdir(outDemoDir, { recursive: true });

await build({
    entryPoints: [entryPoint],
    outfile: outFile,
    bundle: true,
    format: "esm",
    platform: "browser",
    sourcemap: true
});

await copyIndexHtml();
await copyStaticFiles(srcDemoDir, outDemoDir);
