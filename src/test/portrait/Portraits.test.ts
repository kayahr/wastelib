/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertSame, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { openAsBlob } from "node:fs";
import { Portraits } from "../../main/portrait/Portraits.ts";
import { assertMatchImage } from "../support/image.ts";
import { createImageData } from "../support/canvas.ts";

describe("Portraits", () => {
    it("is iterable", async () => {
        const portraits = Portraits.fromArray(await readFile("src/test/data/allpics1"));
        let index = 0;
        for (const portrait of portraits) {
            assertSame(portrait, portraits.getPortrait(index++));
        }
        assertEquals(index, 2);
    });
    describe("fromArray", () => {
        it("reads all portrait records from array", async () => {
            const portraits = Portraits.fromArray(await readFile("src/test/data/allpics1"));
            assertEquals(portraits.getPortraitCount(), 2);
            await assertMatchImage(portraits.getPortrait(0).toImageData(createImageData(96, 84)), "portraits/000");
            await assertMatchImage(portraits.getPortrait(1).toImageData(createImageData(96, 84)), "portraits/001");
        });
    });
    describe("fromBlob", () => {
        it("reads all portrait records from blob", async () => {
            const portraits = await Portraits.fromBlob(await openAsBlob("src/test/data/allpics1"));
            assertEquals(portraits.getPortraitCount(), 2);
            await assertMatchImage(portraits.getPortrait(0).toImageData(createImageData(96, 84)), "portraits/000");
            await assertMatchImage(portraits.getPortrait(1).toImageData(createImageData(96, 84)), "portraits/001");
        });
    });
    describe("fromArrays", () => {
        it("concatenates portrait records from both arrays", async () => {
            const array = await readFile("src/test/data/allpics1");
            const portraits = Portraits.fromArrays(array, array);
            assertEquals(portraits.getPortraitCount(), 4);
            await assertMatchImage(portraits.getPortrait(2).toImageData(createImageData(96, 84)), "portraits/000");
            await assertMatchImage(portraits.getPortrait(3).toImageData(createImageData(96, 84)), "portraits/001");
        });
    });
    describe("fromBlobs", () => {
        it("concatenates portrait records from both blobs", async () => {
            const blob = await openAsBlob("src/test/data/allpics1");
            const portraits = await Portraits.fromBlobs(blob, blob);
            assertEquals(portraits.getPortraitCount(), 4);
            await assertMatchImage(portraits.getPortrait(2).toImageData(createImageData(96, 84)), "portraits/000");
            await assertMatchImage(portraits.getPortrait(3).toImageData(createImageData(96, 84)), "portraits/001");
        });
    });
    describe("getPortrait", () => {
        it("throws exception if the index is out of bounds", async () => {
            const portraits = Portraits.fromArray(await readFile("src/test/data/allpics1"));
            assertThrowWithMessage(() => portraits.getPortrait(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => portraits.getPortrait(2), RangeError, "Index out of bounds: 2");
        });
    });
});
