/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { Exe } from "../../main/exe/Exe.ts";
import {
    savegameOffset0,
    savegameOffset1
} from "../exe/exe-data.ts";
import { openAsBlob } from "node:fs";

describe("Exe", () => {
    describe("fromArray", () => {
        it("reads unpacked WL.EXE array", async () => {
            const exe = Exe.fromArray(await readFile("src/test/data/wlu.exe"));
            assertEquals(exe.getSavegameOffset(0), savegameOffset0);
            assertEquals(exe.getSavegameOffset(1), savegameOffset1);
        });
        it("reads packed WL.EXE array", async () => {
            const exe = Exe.fromArray(await readFile("src/test/data/wl.exe"));
            assertEquals(exe.getSavegameOffset(0), savegameOffset0);
            assertEquals(exe.getSavegameOffset(1), savegameOffset1);
        });
    });
    describe("fromBlob", () => {
        it("reads unpacked WL.EXE blob", async () => {
            const exe = await Exe.fromBlob(await openAsBlob("src/test/data/wlu.exe"));
            assertEquals(exe.getSavegameOffset(0), savegameOffset0);
            assertEquals(exe.getSavegameOffset(1), savegameOffset1);
        });
        it("reads packed WL.EXE blob", async () => {
            const exe = await Exe.fromBlob(await openAsBlob("src/test/data/wl.exe"));
            assertEquals(exe.getSavegameOffset(0), savegameOffset0);
            assertEquals(exe.getSavegameOffset(1), savegameOffset1);
        });
    });
    describe("getSavegameOffset", () => {
        it("returns savegame offset in GAME1", async () => {
            const exe = Exe.fromArray(await readFile("src/test/data/wl.exe"));
            assertEquals(exe.getSavegameOffset(0), savegameOffset0);
        });
        it("returns savegame offset in GAME2", async () => {
            const exe = Exe.fromArray(await readFile("src/test/data/wl.exe"));
            assertEquals(exe.getSavegameOffset(1), savegameOffset1);
        });
    });
});
