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
import { Cursors } from "../../main/cursor/Cursors.ts";

describe("Cursors", () => {
    it("is iterable", async () => {
        const cursors = Cursors.fromArray(await readFile("src/test/data/curs"));
        let index = 0;
        for (const curs of cursors) {
            assertSame(curs, cursors.getCursor(index++));
        }
    });
    describe("fromArrays", () => {
        it("reads CURS from array", async () => {
            const cursors = Cursors.fromArray(await readFile("src/test/data/curs"));
            assertEquals(cursors.getCursorCount(), 2);
            const cursor0 = cursors.getCursor(0);
            const cursor1 = cursors.getCursor(1);
            assertEquals(Array.from(cursors), [ cursor0, cursor1 ]);
            await assertMatchImage(cursor0.toImageData(createImageData(16, 16)), "cursors/000");
            await assertMatchImage(cursor1.toImageData(createImageData(16, 16)), "cursors/001");
        });
    });
    describe("fromBlob", () => {
        it("reads CURS from array", async () => {
            const cursors = await Cursors.fromBlob(await openAsBlob("src/test/data/curs"));
            assertEquals(cursors.getCursorCount(), 2);
            const cursor0 = cursors.getCursor(0);
            const cursor1 = cursors.getCursor(1);
            assertEquals(Array.from(cursors), [ cursor0, cursor1 ]);
            await assertMatchImage(cursor0.toImageData(createImageData(16, 16)), "cursors/000");
            await assertMatchImage(cursor1.toImageData(createImageData(16, 16)), "cursors/001");
        });
    });
    describe("getCursor", () => {
        it("throws exception if the index is out of bounds", async () => {
            const cursors = Cursors.fromArray(await readFile("src/test/data/curs"));
            assertThrowWithMessage(() => cursors.getCursor(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => cursors.getCursor(2), RangeError, "Index out of bounds: 2");
        });
    });
});
