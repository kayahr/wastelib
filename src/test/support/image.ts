import { PNG } from "pngjs";

import type { ImageDataLike } from "../../main/sys/canvas.ts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import pixelmatch from "pixelmatch";
import { AssertionError, assertSame } from "@kayahr/assert";
import { basename, dirname, join } from "node:path";

export async function loadImageData(file: string): Promise<ImageDataLike> {
    const buffer = await readFile(file);
    const png = PNG.sync.read(buffer);
    return {
        data: new Uint8ClampedArray(png.data),
        width: png.width,
        height: png.height
    };
}

export function cloneImageData(imageData: ImageDataLike): ImageDataLike {
    return {
        data: new Uint8ClampedArray(imageData.data),
        width: imageData.width,
        height: imageData.height
    };
}

function createPNG(imageData: ImageDataLike): Uint8Array {
    const png = new PNG({ width: imageData.width, height: imageData.height });
    png.data.set(imageData.data);
    return PNG.sync.write(png);
}

export async function assertMatchImage(actualImageData: ImageDataLike, name: string): Promise<void> {
    const expectedFile = join("src/test/expected", `${name}.png`);
    const expectedImageData = await loadImageData(expectedFile);
    const { width, height } = expectedImageData;
    assertSame(actualImageData.width, width, "Width does not match");
    assertSame(actualImageData.height, height, "Height does not match");
    const diffImageData = { width, height, data: new Uint8ClampedArray(width * height * 4) };
    const mismatchedPixels = pixelmatch(actualImageData.data, expectedImageData.data, diffImageData.data, width, height);
    if (mismatchedPixels > 0) {
        const actualFile = join("lib/test/actual", basename(expectedFile));
        await mkdir(dirname(actualFile), { recursive: true });
        const diffFile = join("lib/test/diffs", basename(expectedFile));
        await mkdir(dirname(diffFile), { recursive: true });
        await writeFile(actualFile, createPNG(actualImageData));
        await writeFile(diffFile, createPNG(diffImageData));
        throw new AssertionError(`Image mismatched <${mismatchedPixels}> pixels.\n`
            + `  Actual  : ${actualFile}\n`
            + `  Expected: ${expectedFile}\n`
            + `  Diff    : ${diffFile}`, { actual: actualFile, expected: expectedFile });
    }
}
