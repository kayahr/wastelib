/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertSame, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { assertMatchImage } from "../support/image.ts";
import { createCanvasContext2D } from "../support/canvas.ts";
import { openAsBlob } from "node:fs";
import { Sprites } from "../../main/sprite/Sprites.ts";

describe("Sprites", () => {
    it("is iterable", async () => {
        const sprites = Sprites.fromArrays(
            await readFile("src/test/data/ic0_9.wlf"),
            await readFile("src/test/data/masks.wlf")
        );
        let index = 0;
        for (const sprite of sprites) {
            assertSame(sprite, sprites.getSprite(index++));
        }
    });
    describe("fromArrays", () => {
        it("reads IC0_9.WLF and MASKS.WLF from array", async () => {
            const sprites = Sprites.fromArrays(
                await readFile("src/test/data/ic0_9.wlf"),
                await readFile("src/test/data/masks.wlf")
            );
            assertEquals(sprites.getSize(), 3);
            const sprite0 = sprites.getSprite(0);
            const sprite1 = sprites.getSprite(1);
            const sprite2 = sprites.getSprite(2);
            assertEquals(Array.from(sprites), [ sprite0, sprite1, sprite2 ]);
            await assertMatchImage(sprite0.toImageData(createCanvasContext2D()), "sprites/000");
            await assertMatchImage(sprite1.toImageData(createCanvasContext2D()), "sprites/001");
            await assertMatchImage(sprite2.toImageData(createCanvasContext2D()), "sprites/002");
        });
        it("throws error when number of images from IC0_9.WLF does not match number of images from MASKS.WLF", async () => {
            assertThrowWithMessage(() => Sprites.fromArrays(new Uint8Array(1280), new Uint8Array(288)), Error,
                "Number of images (10) does not match number of masks (9)");
        });
    });
    describe("fromBlob", () => {
        it("reads IC0_9.WLF and MASKS.WLF from array", async () => {
            const sprites = await Sprites.fromBlobs(
                await openAsBlob("src/test/data/ic0_9.wlf"),
                await openAsBlob("src/test/data/masks.wlf")
            );
            assertEquals(sprites.getSize(), 3);
            const sprite0 = sprites.getSprite(0);
            const sprite1 = sprites.getSprite(1);
            const sprite2 = sprites.getSprite(2);
            assertEquals(Array.from(sprites), [ sprite0, sprite1, sprite2 ]);
            await assertMatchImage(sprite0.toImageData(createCanvasContext2D()), "sprites/000");
            await assertMatchImage(sprite1.toImageData(createCanvasContext2D()), "sprites/001");
            await assertMatchImage(sprite2.toImageData(createCanvasContext2D()), "sprites/002");
        });
    });
    describe("getSprite", () => {
        it("throws exception if the index is out of bounds", async () => {
            const sprites = await Sprites.fromBlobs(
                await openAsBlob("src/test/data/ic0_9.wlf"),
                await openAsBlob("src/test/data/masks.wlf")
            );
            assertThrowWithMessage(() => sprites.getSprite(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => sprites.getSprite(3), RangeError, "Index out of bounds: 3");
        });
    });
});
