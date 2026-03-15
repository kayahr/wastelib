/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertSame, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { assertMatchImage } from "../support/image.ts";
import { createCanvasContext2D } from "../support/canvas.ts";
import { Ending } from "../../main/ending/Ending.ts";
import { openAsBlob } from "node:fs";

describe("Ending", () => {
    it("is iterable", async () => {
        const ending = Ending.fromArray(await readFile("src/test/data/end.cpa"));
        let index = 0;
        for (const update of ending) {
            assertSame(update, ending.getUpdate(index++));
        }
    });
    describe("fromArray", () => {
        it("reads END.CPA from array", async () => {
            const ending = Ending.fromArray(await readFile("src/test/data/end.cpa"));
            assertEquals(ending.getWidth(), 288);
            assertEquals(ending.getHeight(), 128);
            assertEquals(ending.getSize(), 15);
            await assertMatchImage(ending.toImageData(createCanvasContext2D()), "ending/000");
        });
    });
    describe("fromBlob", () => {
        it("reads END.CPA from blob", async () => {
            const ending = await Ending.fromBlob(await openAsBlob("src/test/data/end.cpa"));
            assertEquals(ending.getWidth(), 288);
            assertEquals(ending.getHeight(), 128);
            assertEquals(ending.getSize(), 15);
            await assertMatchImage(ending.toImageData(createCanvasContext2D()), "ending/000");
        });
    });
    describe("getUpdate", () => {
        it("throws an error for invalid indices", async () => {
            const ending = Ending.fromArray(await readFile("src/test/data/end.cpa"));
            assertThrowWithMessage(() => ending.getUpdate(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => ending.getUpdate(15), RangeError, "Index out of bounds: 15");
        });
    });
});
