/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertSame, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { assertMatchImage } from "../support/image.ts";
import { createImageData } from "../support/canvas.ts";
import { openAsBlob } from "node:fs";
import { Tilesets } from "../../main/tile/Tilesets.ts";

describe("Tilesets", () => {
    it("is iterable", async () => {
        const tilesets = Tilesets.fromArray(await readFile("src/test/data/allhtds1"));
        let index = 0;
        for (const tileset of tilesets) {
            assertSame(tileset, tilesets.getTileset(index++));
        }
    });
    describe("fromArray", () => {
        it("reads ALLHTDS1 from array", async () => {
            const tilesets = Tilesets.fromArray(await readFile("src/test/data/allhtds1"));
            assertEquals(tilesets.getTilesetCount(), 2);
            const tileset0 = tilesets.getTileset(0);
            const tileset1 = tilesets.getTileset(1);
            assertEquals(Array.from(tilesets), [ tileset0, tileset1 ]);
            assertEquals(tileset0.getTileCount(), 2);
            assertEquals(tileset1.getTileCount(), 3);
            await assertMatchImage(tileset0.getTile(0).toImageData(createImageData(16, 16)), "tilesets/000/000");
            await assertMatchImage(tileset0.getTile(1).toImageData(createImageData(16, 16)), "tilesets/000/001");
            await assertMatchImage(tileset1.getTile(0).toImageData(createImageData(16, 16)), "tilesets/001/000");
            await assertMatchImage(tileset1.getTile(1).toImageData(createImageData(16, 16)), "tilesets/001/001");
            await assertMatchImage(tileset1.getTile(2).toImageData(createImageData(16, 16)), "tilesets/001/002");
        });
        it("throws error when file is corrupt", async () => {
            const array = await readFile("src/test/data/broken/allhtds1");
            assertThrowWithMessage(() => Tilesets.fromArray(array), Error, "Invalid data block");
        });
    });
    describe("fromBlob", () => {
        it("reads ALLHTDS1 from blob", async () => {
            const tilesets = await Tilesets.fromBlob(await openAsBlob("src/test/data/allhtds1"));
            assertEquals(tilesets.getTilesetCount(), 2);
            const tileset0 = tilesets.getTileset(0);
            const tileset1 = tilesets.getTileset(1);
            assertEquals(Array.from(tilesets), [ tileset0, tileset1 ]);
            assertEquals(tileset0.getTileCount(), 2);
            assertEquals(tileset1.getTileCount(), 3);
            await assertMatchImage(tileset0.getTile(0).toImageData(createImageData(16, 16)), "tilesets/000/000");
            await assertMatchImage(tileset0.getTile(1).toImageData(createImageData(16, 16)), "tilesets/000/001");
            await assertMatchImage(tileset1.getTile(0).toImageData(createImageData(16, 16)), "tilesets/001/000");
            await assertMatchImage(tileset1.getTile(1).toImageData(createImageData(16, 16)), "tilesets/001/001");
            await assertMatchImage(tileset1.getTile(2).toImageData(createImageData(16, 16)), "tilesets/001/002");
        });
    });
    describe("fromArrays", () => {
        it("reads ALLHTDS1 and ALLHTDS2 from arrays", async () => {
            const tilesets = Tilesets.fromArrays(
                await readFile("src/test/data/allhtds1"),
                await readFile("src/test/data/allhtds2")
            );
            assertEquals(tilesets.getTilesetCount(), 4);
        });
    });
    describe("fromBlobs", () => {
        it("reads ALLHTDS1 and ALLHTDS2 from blobs", async () => {
            const tilesets = await Tilesets.fromBlobs(
                await openAsBlob("src/test/data/allhtds1"),
                await openAsBlob("src/test/data/allhtds2")
            );
            assertEquals(tilesets.getTilesetCount(), 4);
        });
    });
    describe("getTileset", () => {
        it("throws exception if the index is out of bounds", async () => {
            const tilesets = await Tilesets.fromBlob(await openAsBlob("src/test/data/allhtds1"));
            assertThrowWithMessage(() => tilesets.getTileset(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => tilesets.getTileset(2), RangeError, "Index out of bounds: 2");
        });
    });
});
