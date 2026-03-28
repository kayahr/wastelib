/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals, assertThrowWithMessage } from "@kayahr/assert";
import { readFile } from "node:fs/promises";
import { openAsBlob } from "node:fs";
import { Exe } from "../../main/exe/Exe.ts";
import {
    characterCreationStrings,
    endingStrings,
    infirmaryStrings,
    introStrings,
    invalidLocations,
    inventoryStrings,
    libraryStrings,
    locations,
    mapOffsets,
    mapSizes,
    messageStrings,
    promotionStrings,
    savegameOffset0,
    savegameOffset1,
    shopItemListOffsets,
    shopStrings,
    tileMapOffsets
} from "./exe-data.ts";

async function readPackedExe(): Promise<Exe> {
    return Exe.fromArray(await readFile("src/test/data/wl.exe"));
}

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
        it("reads packed WL.EXE array with relocation entries", async () => {
            const exe = Exe.fromArray(await readFile("src/test/data/wl-reloc.exe"));
            assertEquals(exe.getSavegameOffset(0), 0x012389ab);
            assertEquals(exe.getSavegameOffset(1), 0x4567cdef);
        });
        it("throws error when exe signature is invalid", async () => {
            const brokenExe = await readFile("src/test/data/broken/wl-no-exe.exe");
            assertThrowWithMessage(() => Exe.fromArray(brokenExe), Error, "No EXE file");
        });
        it("throws error when exepack signature is invalid", async () => {
            const brokenExe = await readFile("src/test/data/broken/wl-not-exepack.exe");
            assertThrowWithMessage(() => Exe.fromArray(brokenExe), Error, "Not an EXEPACK file");
        });
        it("throws error when packed data contains an unknown command", async () => {
            const brokenExe = await readFile("src/test/data/broken/wl-unknown-command.exe");
            assertThrowWithMessage(() => Exe.fromArray(brokenExe), Error, "Unknown command 0 at position 9");
        });
        it("throws error when unpacked EXE does not match expected size", async () => {
            const brokenExe = await readFile("src/test/data/broken/wl-double-packed.exe");
            assertThrowWithMessage(() => Exe.fromArray(brokenExe), Error, "Expected unpacked EXE of size 169824 but got 1920");
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
            const exe = await readPackedExe();
            assertEquals(exe.getSavegameOffset(0), savegameOffset0);
        });
        it("returns savegame offset in GAME2", async () => {
            const exe = await readPackedExe();
            assertEquals(exe.getSavegameOffset(1), savegameOffset1);
        });
    });
    describe("getShopItemListOffset", () => {
        it("returns all shop item list offsets", async () => {
            const exe = await readPackedExe();
            for (let shop = 0; shop < shopItemListOffsets.length; ++shop) {
                assertEquals(exe.getShopItemListOffset(shop), shopItemListOffsets[shop]);
            }
        });
    });
    describe("getLocation", () => {
        it("returns location indices", async () => {
            const exe = await readPackedExe();
            for (const { location, disk, map } of locations) {
                assertEquals(exe.getLocation(disk, map), location);
            }
        });
    });
    describe("getLocationDisk", () => {
        it("returns location disks", async () => {
            const exe = await readPackedExe();
            for (const { location, disk } of locations) {
                assertEquals(exe.getLocationDisk(location), disk);
            }
        });
        it("throws error for invalid locations", async () => {
            const exe = await readPackedExe();
            for (const location of invalidLocations) {
                assertThrowWithMessage(() => exe.getLocationDisk(location), Error, `Invalid location: ${location}`);
            }
        });
    });
    describe("getLocationMap", () => {
        it("returns location maps", async () => {
            const exe = await readPackedExe();
            for (const { location, map } of locations) {
                assertEquals(exe.getLocationMap(location), map);
            }
        });
        it("throws error for invalid locations", async () => {
            const exe = await readPackedExe();
            for (const location of invalidLocations) {
                assertThrowWithMessage(() => exe.getLocationMap(location), Error, `Invalid location: ${location}`);
            }
        });
    });
    describe("getMapSize", () => {
        it("returns map sizes and tile map offsets", async () => {
            const exe = await readPackedExe();
            for (const { location, disk, map } of locations) {
                assertEquals(exe.getMapSize(disk, map), mapSizes[location]);
            }
        });
    });
    describe("getTileMapOffset", () => {
        it("returns tile map offsets", async () => {
            const exe = await readPackedExe();
            for (const { location, disk, map } of locations) {
                assertEquals(exe.getTileMapOffset(disk, map), tileMapOffsets[location]);
            }
        });
    });
    describe("getMapOffset", () => {
        it("returns map offsets", async () => {
            const exe = await readPackedExe();
            for (let map = 0; map < 20; ++map) {
                assertEquals(exe.getMapOffset(0, map), mapOffsets[map]);
            }
            for (let map = 0; map < 22; ++map) {
                assertEquals(exe.getMapOffset(1, map), mapOffsets[20 + map]);
            }
        });
    });
    describe("getIntroStrings", () => {
        it("returns intro strings", async () => {
            assertEquals((await readPackedExe()).getIntroStrings(), introStrings);
        });
    });
    describe("getMessageStrings", () => {
        it("returns message strings", async () => {
            assertEquals((await readPackedExe()).getMessageStrings(), messageStrings);
        });
    });
    describe("getInventoryStrings", () => {
        it("returns inventory strings", async () => {
            assertEquals((await readPackedExe()).getInventoryStrings(), inventoryStrings);
        });
    });
    describe("getCharacterCreationStrings", () => {
        it("returns character creation strings", async () => {
            assertEquals((await readPackedExe()).getCharacterCreationStrings(), characterCreationStrings);
        });
    });
    describe("getPromotionStrings", () => {
        it("returns promotion strings", async () => {
            assertEquals((await readPackedExe()).getPromotionStrings(), promotionStrings);
        });
    });
    describe("getLibraryStrings", () => {
        it("returns library strings", async () => {
            assertEquals((await readPackedExe()).getLibraryStrings(), libraryStrings);
        });
    });
    describe("getShopStrings", () => {
        it("returns shop strings", async () => {
            assertEquals((await readPackedExe()).getShopStrings(), shopStrings);
        });
    });
    describe("getInfirmaryStrings", () => {
        it("returns infirmary strings", async () => {
            assertEquals((await readPackedExe()).getInfirmaryStrings(), infirmaryStrings);
        });
    });
    describe("getEndingStrings", () => {
        it("returns ending strings", async () => {
            assertEquals((await readPackedExe()).getEndingStrings(), endingStrings);
        });
    });
});
