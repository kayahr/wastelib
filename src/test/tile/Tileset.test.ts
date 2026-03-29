/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertSame, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { Tilesets } from "../../main/tile/Tilesets.ts";
import { Tileset } from "../../main/tile/Tileset.ts";
import { assertMatchImage } from "../support/image.ts";
import { createImageData } from "../support/canvas.ts";

describe("Tileset", () => {
    it("is iterable", async () => {
        const tileset = Tilesets.fromArray(await readFile("src/test/data/allhtds1")).getTileset(0);
        let index = 0;
        for (const tile of tileset) {
            assertSame(tile, tileset.getTile(index++));
        }
    });
    describe("getDisk", () => {
        it("returns 0 for ALLHTDS1", async () => {
            const tilesets = Tilesets.fromArray(await readFile("src/test/data/allhtds1"));
            for (const tileset of tilesets) {
                assertEquals(tileset.getDisk(), 0);
            }
        });
        it("returns 1 for ALLHTDS2", async () => {
            const tilesets = Tilesets.fromArray(await readFile("src/test/data/allhtds2"));
            for (const tileset of tilesets) {
                assertEquals(tileset.getDisk(), 1);
            }
        });
    });
    describe("getTile", () => {
        it("throws exception if the index is out of bounds", async () => {
            const tileset = Tilesets.fromArray(await readFile("src/test/data/allhtds1")).getTileset(1);
            assertThrowWithMessage(() => tileset.getTile(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => tileset.getTile(3), RangeError, "Index out of bounds: 3");
        });
    });
    describe("fromArray", () => {
        it("reads a single tileset block from a given offset", async () => {
            const array = await readFile("src/test/data/allhtds1");
            const tileset = Tileset.fromArray(array, 0x8a);
            assertEquals(tileset.getDisk(), 0);
            assertEquals(tileset.getTileCount(), 3);
            await assertMatchImage(tileset.getTile(0).toImageData(createImageData(16, 16)), "tilesets/001/000");
            await assertMatchImage(tileset.getTile(1).toImageData(createImageData(16, 16)), "tilesets/001/001");
            await assertMatchImage(tileset.getTile(2).toImageData(createImageData(16, 16)), "tilesets/001/002");
        });
    });
});
