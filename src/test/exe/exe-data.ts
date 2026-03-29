/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

// This file contains test data which is written to the test WL.exe. These values are also the expected values used in the unit tests.

export const introStrings = [
    "",
    "Intro\r",
    "Copyright stuff\r",
    "It's not looking good in the Wasteland...\r",
];

export const messageStrings = [
    "",
    "\rNothing happens.\r",
    "\x07You can't do that.\r\x06",
    "shreds h\fim\fer\f to rips"
];

export const inventoryStrings = [
    "",
    "Climbing",
    "Small weapons",
    "Ax\n\nes\n"
];

export const characterCreationStrings = [
    "",
    "Create character",
    "Keep character",
    "Delete character"
];

export const promotionStrings = [
    "",
    "Ensign",
    "Lieutenant",
    "Commander",
    "Captain",
    "Admiral",
    "Overlord",
    "Programmer"
];

export const libraryStrings = [
    "",
    "\x07You are to thick to learn anything.\r\x06",
    "Wanna enter?\r",
    "You are an annoying know-it-all\r"
];

export const shopStrings = [
    "",
    "Who wants stuff?\r",
    "You are broke!\x03",
    "\x06The 6 quick brown foxes jumps over the 7 lazy dogs!?\r\x06",
];

export const infirmaryStrings = [
    "",
    "Food poisoning",
    "Who wants some?\r",
    "\x04You are clean.\r\x06"
];

export const endingStrings = [
    "",
    "Base goes boom.\r",
    "Robots die dramatically.\r",
    "\x0b was killed in the blast.\r",
    "\"The rangers won.\"\r",
    "\"Humanity survives another day.\"\r",
    "",
    "\rExcerpt from The History of the Rangers.\r"
];

export interface LocationEntry {
    readonly location: number;
    readonly disk: number;
    readonly map: number;
}

const disk0MapOrder = Array.from({ length: 20 }, (_, index) => index * 7 % 20);
const disk1MapOrder = Array.from({ length: 22 }, (_, index) => index * 5 % 22);

const entries: LocationEntry[] = [];
let location = 0;
for (let i = 0; i < 22; ++i) {
    if (i < 20) {
        entries.push({ location: location++, disk: 0, map: disk0MapOrder[i] });
    }
    entries.push({ location: location++, disk: 1, map: disk1MapOrder[i] });
}

export const locations = entries;

export const invalidLocations = Array.from({ length: 50 - locations.length }, (_, index) => locations.length + index);

export const locationMapping = Array.from({ length: 50 }, (_, index) => {
    const entry = locations[index];
    return entry == null ? 0 : (((entry.disk + 1) ^ 3) << 6) | entry.map;
});

export const mapSizes = Array.from({ length: 50 }, (_, index) => index < locations.length ? 24 + index * 3 : 0);

export const tileMapOffsets = Array.from({ length: 50 }, (_, index) => index < locations.length ? 0x0200 + index * 0x23 : 0);

export const mapOffsets = [
    ...Array.from({ length: 20 }, (_, map) => 0x00100000 + map * 0x00010101),
    ...Array.from({ length: 22 }, (_, map) => 0x00200000 + map * 0x00020202)
];

export const tilesetFileOffsets = [
    0x0000,
    0x1402,
    0x3ee8,
    0x69fc,
    0x0000,
    0x222c,
    0x3c97,
    0x5676,
    0x70eb
];

export const tilesetCumulativeOffsets = [
    0x0000,
    0x1402,
    0x3ee8,
    0x69fc,
    0x8603,
    0xa82f,
    0xc29a,
    0xdc79,
    0xf6ee
];

export const tilesetSizes = [
    0x1402,
    0x2ae6,
    0x2b14,
    0x1c07,
    0x222c,
    0x1a6b,
    0x19df,
    0x1a75,
    0x2853
];

export const tilesetDisks = tilesetFileOffsets.map((_, index) => index < 4 ? 0 : 1);

export const savegameOffset0 = 0x012389ab;
export const savegameOffset1 = 0x4567cdef;
export const savegameSize = 0x0055;

export const shopItemListBaseOffsets = [
    0x0111,
    0x0222,
    0x0333,
    0x0444
];

export const shopItemListOffsets = [
    ...shopItemListBaseOffsets.map(offset => savegameOffset0 + savegameSize + offset),
    savegameOffset1 + savegameSize
];
