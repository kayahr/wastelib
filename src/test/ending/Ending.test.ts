/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertInstanceOf, assertSame, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { assertMatchImage } from "../support/image.ts";
import { createCanvasContext2D } from "../support/canvas.ts";
import { Ending } from "../../main/ending/Ending.ts";
import { openAsBlob } from "node:fs";
import { EndingPlayer } from "../../main/ending/EndingPlayer.ts";
import { BaseImage } from "../../main/image/BaseImage.ts";

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
            assertEquals(ending.getUpdateCount(), 15);
            await assertMatchImage(ending.toImageData(createCanvasContext2D()), "ending/000");
        });
        it("throws error when file is corrupt", async () => {
            const invalidBaseFrame = await readFile("src/test/data/broken/end-invalid-base-frame.cpa");
            const invalidAnimationBlock = await readFile("src/test/data/broken/end-invalid-animation-block.cpa");
            const invalidAnimationSize = await readFile("src/test/data/broken/end-invalid-animation-size.cpa");
            const invalidAnimationEnd = await readFile("src/test/data/broken/end-invalid-animation-end.cpa");
            assertThrowWithMessage(() => Ending.fromArray(invalidBaseFrame), Error, "Invalid base frame data block");
            assertThrowWithMessage(() => Ending.fromArray(invalidAnimationBlock), Error, "Invalid animation data block");
            assertThrowWithMessage(() => Ending.fromArray(invalidAnimationSize), Error, "Invalid animation data block size");
            assertThrowWithMessage(() => Ending.fromArray(invalidAnimationEnd), Error, "Invalid animation data block end");
        });
    });
    describe("fromBlob", () => {
        it("reads END.CPA from blob", async () => {
            const ending = await Ending.fromBlob(await openAsBlob("src/test/data/end.cpa"));
            assertEquals(ending.getWidth(), 288);
            assertEquals(ending.getHeight(), 128);
            assertEquals(ending.getUpdateCount(), 15);
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
    describe("createPlayer", () => {
        it("creates and returns an animation player", async (t) => {
            const ending = Ending.fromArray(await readFile("src/test/data/end.cpa"));
            const onDraw = t.mock.fn<(frame: BaseImage) => void>();
            const player = ending.createPlayer(onDraw);
            assertInstanceOf(player, EndingPlayer);

            // Check if onDraw was called with base frame
            assertEquals(onDraw.mock.callCount(), 1);
            const frame = onDraw.mock.calls[0].arguments[0];
            assertInstanceOf(frame, BaseImage);
            await assertMatchImage(frame.toImageData(createCanvasContext2D()), "ending/000");

            const delays = [ 60, 5, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4 ];

            // Check the next 15 frames
            for (let i = 1; i < 16; i++) {
                onDraw.mock.resetCalls();
                assertEquals(player.getNextDelay(), (delays.shift() ?? 0) * 50);
                player.next();
                assertEquals(onDraw.mock.callCount(), 1);
                const frame = onDraw.mock.calls[0].arguments[0];
                assertInstanceOf(frame, BaseImage);
                await assertMatchImage(frame.toImageData(createCanvasContext2D()), `ending/${i.toString().padStart(3, "0")}`);
            }

            // After frame 15 the original game loops back to frame 12.
            onDraw.mock.resetCalls();
            player.next();
            assertEquals(onDraw.mock.callCount(), 1);
            const loopFrame = onDraw.mock.calls[0].arguments[0];
            assertInstanceOf(loopFrame, BaseImage);
            await assertMatchImage(loopFrame.toImageData(createCanvasContext2D()), "ending/012");
        });
    });
});
