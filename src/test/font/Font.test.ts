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
import { Font } from "../../main/font/Font.ts";

describe("Font", () => {
    it("is iterable", async () => {
        const font = Font.fromArray(await readFile("src/test/data/colorf.fnt"));
        let index = 0;
        for (const char of font) {
            assertSame(char, font.getChar(index++));
        }
    });
    describe("fromArrays", () => {
        it("reads COLORF.FNT from array", async () => {
            const font = Font.fromArray(await readFile("src/test/data/colorf.fnt"));
            assertEquals(font.getSize(), 3);
            const char0 = font.getChar(0);
            const char1 = font.getChar(1);
            const char2 = font.getChar(2);
            assertEquals(Array.from(font), [ char0, char1, char2 ]);
            await assertMatchImage(char0.toImageData(createCanvasContext2D()), "font/000");
            await assertMatchImage(char1.toImageData(createCanvasContext2D()), "font/001");
            await assertMatchImage(char2.toImageData(createCanvasContext2D()), "font/002");
        });
    });
    describe("fromBlob", () => {
        it("reads COLORF.FNT from array", async () => {
            const font = await Font.fromBlob(await openAsBlob("src/test/data/colorf.fnt"));
            assertEquals(font.getSize(), 3);
            const char0 = font.getChar(0);
            const char1 = font.getChar(1);
            const char2 = font.getChar(2);
            assertEquals(Array.from(font), [ char0, char1, char2 ]);
            await assertMatchImage(char0.toImageData(createCanvasContext2D()), "font/000");
            await assertMatchImage(char1.toImageData(createCanvasContext2D()), "font/001");
            await assertMatchImage(char2.toImageData(createCanvasContext2D()), "font/002");
        });
    });
    describe("getChar", () => {
        it("throws exception if the index is out of bounds", async () => {
            const font = await Font.fromBlob(await openAsBlob("src/test/data/colorf.fnt"));
            assertThrowWithMessage(() => font.getChar(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => font.getChar(3), RangeError, "Index out of bounds: 3");
        });
    });
});
