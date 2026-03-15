/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertThrowWithMessage } from "@kayahr/assert";
import { Title } from "../../main/title/Title.ts";
import { readFile } from "node:fs/promises";
import { assertMatchImage } from "../support/image.ts";
import { createCanvas, createCanvasContext2D } from "../support/canvas.ts";
import { openAsBlob } from "node:fs";

describe("Title", () => {
    describe("fromArray", () => {
        it("reads TITLE.PIC from array", async () => {
            const title = Title.fromArray(await readFile("src/test/data/title.pic"));
            assertEquals(title.getWidth(), 288);
            assertEquals(title.getHeight(), 128);
            await assertMatchImage(title.toImageData(createCanvasContext2D()), "title");
        });
    });
    describe("fromBlob", () => {
        it("reads TITLE.PIC from blob", async () => {
            const title = await Title.fromBlob(await openAsBlob("src/test/data/title.pic"));
            assertEquals(title.getWidth(), 288);
            assertEquals(title.getHeight(), 128);
            await assertMatchImage(title.toImageData(createCanvasContext2D()), "title");
        });
    });
    describe("toCanvas", () => {
        it("draws TITLE.PIC to canvas", async () => {
            const title = await Title.fromBlob(await openAsBlob("src/test/data/title.pic"));
            assertEquals(title.getWidth(), 288);
            assertEquals(title.getHeight(), 128);
            const canvas = createCanvas();
            title.toCanvas(canvas);
            await assertMatchImage(canvas.dump(), "title");
        });
    });
    describe("getData", () => {
        it("returns the raw pixel data with two 4 bit color pixels in each byte", async t => {
            const title = Title.fromArray(await readFile("src/test/data/title.pic"));
            t.assert.snapshot(title.getData());
        });
    });
    describe("getColor", () => {
        it("returns a pixel at given position as RGBA value", async t => {
            const title = Title.fromArray(await readFile("src/test/data/title.pic"));
            const pixels: number[] = [];
            for (let y = 0; y < title.getHeight(); y++) {
                for (let x = 0; x < title.getHeight(); x++) {
                    pixels.push(title.getColor(x, y));
                }
            }
            t.assert.snapshot(pixels);
        });
        it("throws exception when coordinates are out of bounds", async () => {
            const title = Title.fromArray(await readFile("src/test/data/title.pic"));
            assertThrowWithMessage(() => title.getColor(-1, -1), RangeError, `Coordinates outside of image boundary: -1, -1`);
            assertThrowWithMessage(() => title.getColor(-1, 0), RangeError, `Coordinates outside of image boundary: -1, 0`);
            assertThrowWithMessage(() => title.getColor(288, 0), RangeError, `Coordinates outside of image boundary: 288, 0`);
            assertThrowWithMessage(() => title.getColor(0, -1), RangeError, `Coordinates outside of image boundary: 0, -1`);
            assertThrowWithMessage(() => title.getColor(0, 128), RangeError, `Coordinates outside of image boundary: 0, 128`);
            assertThrowWithMessage(() => title.getColor(288, 128), RangeError, `Coordinates outside of image boundary: 288, 128`);
        });
    });
});
