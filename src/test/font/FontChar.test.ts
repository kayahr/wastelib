/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { Font } from "../../main/font/Font.ts";

describe("FontChar", () => {
    describe("getColor", () => {
        it("returns a pixel at given position as RGBA value", async t => {
            const font = Font.fromArray(await readFile("src/test/data/colorf.fnt"));
            const sprite = font.getChar(1);
            const pixels: number[] = [];
            for (let y = 0; y < sprite.getHeight(); y++) {
                for (let x = 0; x < sprite.getHeight(); x++) {
                    pixels.push(sprite.getColor(x, y));
                }
            }
            t.assert.snapshot(pixels);
        });
        it("throws exception when coordinates are out of bounds", async () => {
            const font = Font.fromArray(await readFile("src/test/data/colorf.fnt"));
            const char = font.getChar(1);
            assertThrowWithMessage(() => char.getColor(-1, -1), RangeError, `Coordinates outside of image boundary: -1, -1`);
            assertThrowWithMessage(() => char.getColor(-1, 0), RangeError, `Coordinates outside of image boundary: -1, 0`);
            assertThrowWithMessage(() => char.getColor(8, 0), RangeError, `Coordinates outside of image boundary: 8, 0`);
            assertThrowWithMessage(() => char.getColor(0, -1), RangeError, `Coordinates outside of image boundary: 0, -1`);
            assertThrowWithMessage(() => char.getColor(0, 8), RangeError, `Coordinates outside of image boundary: 0, 8`);
            assertThrowWithMessage(() => char.getColor(8, 8), RangeError, `Coordinates outside of image boundary: 8, 8`);
        });
    });
});
