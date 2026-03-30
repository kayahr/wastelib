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
    portraitMappings,
    promotionStrings,
    savegameOffset0,
    savegameOffset1,
    sharedLocations,
    shopItemListOffsets,
    shopStrings,
    tileMapOffsets,
    tilesetDisks,
    tilesetFileOffsets,
    tilesetSizes
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
    describe("getPortraitIndex", () => {
        it("returns portrait indices for both ALLPICS files", async () => {
            const exe = await readPackedExe();
            for (const { disk, portraitId, index } of portraitMappings) {
                assertEquals(exe.getPortraitIndex(disk, portraitId), index);
            }
        });
        it("throws for invalid portrait disks and unknown portrait IDs", async () => {
            const exe = await readPackedExe();
            assertThrowWithMessage(() => exe.getPortraitIndex(-1, 0), RangeError, "Invalid portrait disk: -1");
            assertThrowWithMessage(() => exe.getPortraitIndex(2, 0), RangeError, "Invalid portrait disk: 2");
            assertThrowWithMessage(() => exe.getPortraitIndex(0, 4), Error, "No portrait index found for disk 0 and portrait ID 4");
            assertThrowWithMessage(() => exe.getPortraitIndex(1, 3), Error, "No portrait index found for disk 1 and portrait ID 3");
        });
    });
    describe("getPortraitOffset", () => {
        it("returns portrait record offsets for both ALLPICS files", async () => {
            const exe = await readPackedExe();
            for (const { disk, portraitId, offset } of portraitMappings) {
                assertEquals(exe.getPortraitOffset(disk, portraitId), offset);
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
    describe("getSharedLocation", () => {
        it("returns shared locations for derelict building IDs", async () => {
            const exe = await readPackedExe();
            for (let derelictLocation = 0; derelictLocation < sharedLocations.length; ++derelictLocation) {
                assertEquals(exe.getSharedLocation(derelictLocation), sharedLocations[derelictLocation]);
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
    describe("getTilesetOffset", () => {
        it("returns the tileset offsets within the corresponding ALLHTDS file", async () => {
            const exe = await readPackedExe();
            for (let tilesetId = 0; tilesetId < tilesetFileOffsets.length; ++tilesetId) {
                assertEquals(exe.getTilesetOffset(tilesetId), tilesetFileOffsets[tilesetId]);
            }
        });
        it("throws exception if the tileset ID is out of bounds", async () => {
            const exe = await readPackedExe();
            assertThrowWithMessage(() => exe.getTilesetOffset(-1), RangeError, "Invalid tileset ID: -1");
            assertThrowWithMessage(() => exe.getTilesetOffset(9), RangeError, "Invalid tileset ID: 9");
        });
    });
    describe("getTilesetDisk", () => {
        it("returns the tileset disk", async () => {
            const exe = await readPackedExe();
            for (let tilesetId = 0; tilesetId < tilesetDisks.length; ++tilesetId) {
                assertEquals(exe.getTilesetDisk(tilesetId), tilesetDisks[tilesetId]);
            }
        });
        it("throws exception if the tileset ID is out of bounds", async () => {
            const exe = await readPackedExe();
            assertThrowWithMessage(() => exe.getTilesetDisk(-1), RangeError, "Invalid tileset ID: -1");
            assertThrowWithMessage(() => exe.getTilesetDisk(9), RangeError, "Invalid tileset ID: 9");
        });
    });
    describe("getTilesetSize", () => {
        it("returns the compressed tileset sizes", async () => {
            const exe = await readPackedExe();
            for (let tilesetId = 0; tilesetId < tilesetSizes.length; ++tilesetId) {
                assertEquals(exe.getTilesetSize(tilesetId), tilesetSizes[tilesetId]);
            }
        });
        it("throws exception if the tileset ID is out of bounds", async () => {
            const exe = await readPackedExe();
            assertThrowWithMessage(() => exe.getTilesetSize(-1), RangeError, "Invalid tileset ID: -1");
            assertThrowWithMessage(() => exe.getTilesetSize(9), RangeError, "Invalid tileset ID: 9");
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
