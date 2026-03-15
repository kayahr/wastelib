/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { Sprites } from "../../main/sprite/Sprites.ts";

describe("Sprite", () => {
    describe("getColor", () => {
        it("returns a pixel at given position as RGBA value", async t => {
            const sprites = Sprites.fromArrays(
                await readFile("src/test/data/ico0_9.wlf"),
                await readFile("src/test/data/masks.wlf")
            );
            const sprite = sprites.getSprite(2);
            const pixels: number[] = [];
            for (let y = 0; y < sprite.getHeight(); y++) {
                for (let x = 0; x < sprite.getHeight(); x++) {
                    pixels.push(sprite.getColor(x, y));
                }
            }
            t.assert.snapshot(pixels);
        });
        it("throws exception when coordinates are out of bounds", async () => {
            const sprites = Sprites.fromArrays(
                await readFile("src/test/data/ico0_9.wlf"),
                await readFile("src/test/data/masks.wlf")
            );
            const sprite = sprites.getSprite(2);
            assertThrowWithMessage(() => sprite.getColor(-1, -1), RangeError, `Coordinates outside of image boundary: -1, -1`);
            assertThrowWithMessage(() => sprite.getColor(-1, 0), RangeError, `Coordinates outside of image boundary: -1, 0`);
            assertThrowWithMessage(() => sprite.getColor(16, 0), RangeError, `Coordinates outside of image boundary: 16, 0`);
            assertThrowWithMessage(() => sprite.getColor(0, -1), RangeError, `Coordinates outside of image boundary: 0, -1`);
            assertThrowWithMessage(() => sprite.getColor(0, 16), RangeError, `Coordinates outside of image boundary: 0, 16`);
            assertThrowWithMessage(() => sprite.getColor(16, 16), RangeError, `Coordinates outside of image boundary: 16, 16`);
        });
    });
});
