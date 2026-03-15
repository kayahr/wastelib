/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { Cursors } from "../../main/cursor/Cursors.ts";

describe("Cursor", () => {
    describe("getColor", () => {
        it("returns a pixel at given position as RGBA value", async t => {
            const cursors = Cursors.fromArray(await readFile("src/test/data/curs"));
            const sprite = cursors.getCursor(1);
            const pixels: number[] = [];
            for (let y = 0; y < sprite.getHeight(); y++) {
                for (let x = 0; x < sprite.getHeight(); x++) {
                    pixels.push(sprite.getColor(x, y));
                }
            }
            t.assert.snapshot(pixels);
        });
        it("throws exception when coordinates are out of bounds", async () => {
            const cursors = Cursors.fromArray(await readFile("src/test/data/curs"));
            const cursor = cursors.getCursor(1);
            assertThrowWithMessage(() => cursor.getColor(-1, -1), RangeError, `Coordinates outside of image boundary: -1, -1`);
            assertThrowWithMessage(() => cursor.getColor(-1, 0), RangeError, `Coordinates outside of image boundary: -1, 0`);
            assertThrowWithMessage(() => cursor.getColor(16, 0), RangeError, `Coordinates outside of image boundary: 16, 0`);
            assertThrowWithMessage(() => cursor.getColor(0, -1), RangeError, `Coordinates outside of image boundary: 0, -1`);
            assertThrowWithMessage(() => cursor.getColor(0, 16), RangeError, `Coordinates outside of image boundary: 0, 16`);
            assertThrowWithMessage(() => cursor.getColor(16, 16), RangeError, `Coordinates outside of image boundary: 16, 16`);
        });
    });
});
