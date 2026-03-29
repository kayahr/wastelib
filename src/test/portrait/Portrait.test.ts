/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertInstanceOf, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { openAsBlob } from "node:fs";
import { Portrait } from "../../main/portrait/Portrait.ts";
import { PortraitPlayer } from "../../main/portrait/PortraitPlayer.ts";
import type { ImageDataLike } from "../../main/sys/canvas.ts";
import { BinaryReader } from "../../main/io/BinaryReader.ts";
import { decodeHuffman } from "../../main/io/huffman.ts";
import { assertMatchImage } from "../support/image.ts";
import { createImageData } from "../support/canvas.ts";

const portrait2Offset = 0x0556;

function getAnimationBlockOffset(array: Uint8Array, portraitOffset: number): number {
    const reader = new BinaryReader(array, portraitOffset);
    const imageSize = reader.readUint32();
    reader.readString(3);
    reader.readUint8();
    decodeHuffman(reader, imageSize);
    return portraitOffset + reader.getByteIndex();
}

function createStrip(...frames: ImageDataLike[]): ImageDataLike {
    const width = frames.length * 96;
    const height = 84;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let frameIndex = 0; frameIndex < frames.length; ++frameIndex) {
        const frame = frames[frameIndex];
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < 96; ++x) {
                const src = (y * 96 + x) * 4;
                const dst = (y * width + frameIndex * 96 + x) * 4;
                data[dst] = frame.data[src];
                data[dst + 1] = frame.data[src + 1];
                data[dst + 2] = frame.data[src + 2];
                data[dst + 3] = frame.data[src + 3];
            }
        }
    }
    return { width, height, data };
}

describe("Portrait", () => {
    describe("fromArray", () => {
        it("reads the first portrait record from a given offset", async () => {
            const portrait = Portrait.fromArray(await readFile("src/test/data/allpics1"), 0);
            assertEquals(portrait.getWidth(), 96);
            assertEquals(portrait.getHeight(), 84);
            assertEquals(portrait.getScriptCount(), 1);
            assertEquals(portrait.getScript(0).getLineCount(), 12);
            await assertMatchImage(portrait.toImageData(createImageData(96, 84)), "portraits/000");
        });
        it("reads the second portrait record from a given offset", async () => {
            const portrait = Portrait.fromArray(await readFile("src/test/data/allpics1"), portrait2Offset);
            assertEquals(portrait.getWidth(), 96);
            assertEquals(portrait.getHeight(), 84);
            assertEquals(portrait.getScriptCount(), 2);
            assertEquals(portrait.getScript(0).getLineCount(), 4);
            assertEquals(portrait.getScript(1).getLineCount(), 2);
            assertEquals(portrait.getScript(0).getLine(0).getDelay(), 1);
            assertEquals(portrait.getScript(1).getLine(0).getDelay(), 2);
            assertEquals(portrait.getScript(1).getLine(1).getDelay(), 4);
            assertEquals(portrait.getScript(1).getLine(0).getUpdate(), 4);
            await assertMatchImage(portrait.toImageData(createImageData(96, 84)), "portraits/001");
        });
        it("throws error when base frame data block is corrupt", async () => {
            const valid = await readFile("src/test/data/allpics1");
            const invalidBaseFrame = Uint8Array.from(valid);
            invalidBaseFrame[7] = 2;
            assertThrowWithMessage(() => Portrait.fromArray(invalidBaseFrame, 0), Error, "Invalid base frame data block");
        });
        it("throws error when animation data block is corrupt", async () => {
            const valid = await readFile("src/test/data/allpics1");
            const invalidAnimationBlock = Uint8Array.from(valid);
            const animationBlockOffset = getAnimationBlockOffset(valid, 0);
            invalidAnimationBlock[animationBlockOffset + 7] = 1;
            assertThrowWithMessage(() => Portrait.fromArray(invalidAnimationBlock, 0), Error, "Invalid animation data block: msq10");
        });
    });
    describe("fromBlob", () => {
        it("reads a portrait record from blob", async () => {
            const portrait = await Portrait.fromBlob(await openAsBlob("src/test/data/allpics1"), portrait2Offset);
            assertEquals(portrait.getWidth(), 96);
            assertEquals(portrait.getHeight(), 84);
            await assertMatchImage(portrait.toImageData(createImageData(96, 84)), "portraits/001");
        });
    });
    describe("getScript", () => {
        it("throws exception if the index is out of bounds", async () => {
            const portrait = Portrait.fromArray(await readFile("src/test/data/allpics1"), 0);
            assertThrowWithMessage(() => portrait.getScript(-1), Error, "Index out of bounds: -1");
            assertThrowWithMessage(() => portrait.getScript(1), Error, "Index out of bounds: 1");
        });
    });
    describe("getUpdate", () => {
        it("throws exception if the index is out of bounds", async () => {
            const portrait = Portrait.fromArray(await readFile("src/test/data/allpics1"), portrait2Offset);
            assertThrowWithMessage(() => portrait.getUpdate(-1), RangeError, "Index out of bounds: -1");
            assertThrowWithMessage(() => portrait.getUpdate(5), RangeError, "Index out of bounds: 5");
        });
    });
    describe("createPlayer", () => {
        it("creates and animates the robot portrait", async () => {
            const portrait = Portrait.fromArray(await readFile("src/test/data/allpics1"), 0);
            const frames: ImageDataLike[] = [];
            const player = portrait.createPlayer(frame => { frames.push(frame.toImageData(createImageData(96, 84))); });
            assertInstanceOf(player, PortraitPlayer);
            for (let i = 1; i < 12; ++i) {
                player.next();
            }
            await assertMatchImage(createStrip(...frames), "portraits/000-strip");
        });
        it("creates and animates the tape drive portrait", async () => {
            const portrait = Portrait.fromArray(await readFile("src/test/data/allpics1"), portrait2Offset);
            const frames: ImageDataLike[] = [];
            const player = portrait.createPlayer(frame => { frames.push(frame.toImageData(createImageData(96, 84))); });
            assertInstanceOf(player, PortraitPlayer);
            for (let i = 1; i < 12; ++i) {
                player.next();
            }
            await assertMatchImage(createStrip(...frames), "portraits/001-strip");
        });
    });
});
