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

export const sharedLocations = Array.from({ length: 125 }, (_, index) => index < 64 ? 5 : 11);

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

export const portraitOffsets1 = [
    0x0000,
    0x07d1,
    0x1394,
    0x1e6a,
    0x2639,
    0x3329,
    0x3f44,
    0x4d73,
    0x5db3,
    0x68e6,
    0x7261,
    0x84f5,
    0x8da4,
    0x9669,
    0xa5ab,
    0xafe7,
    0xb86c,
    0xc6a3,
    0xd04c,
    0xdbca,
    0xe691,
    0xf8f2,
    0x10332,
    0x10bc7,
    0x116af,
    0x120b5,
    0x120b5,
    0x15763,
    0x15eff,
    0x16920,
    0x17181,
    0x17bd1,
    0x186cb,
    0x19129
];

export const portraitOffsets2 = [
    0x0000,
    0x07d1,
    0x1394,
    0x1e6a,
    0x28be,
    0x38fe,
    0x41ad,
    0x4992,
    0x515e,
    0x5c9a,
    0x66f8,
    0x7287,
    0x7bbc,
    0x8871,
    0x8e3d,
    0x9927,
    0xa2d6,
    0xac0d,
    0xb758,
    0xc12e,
    0xcd0f,
    0xd6d4,
    0xe671,
    0xef36,
    0xf88d,
    0x1009b,
    0x10acf,
    0x11a37,
    0x122fe,
    0x12d71,
    0x13686,
    0x14282,
    0x14d49,
    0x15721,
    0x1653b,
    0x16f6f,
    0x1797a,
    0x18688,
    0x19451,
    0x19dd4,
    0x1a50d,
    0x1aefe,
    0x1bcc6,
    0x1c931,
    0x1d4e0,
    0x1dda9,
    0x1eadf,
    0x1f49f,
    0x1fe8f
];

export const portraitIndices1 = [
    0x00, 0x01, 0x02, 0x03, 0x80, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0x0c, 0x80, 0x80, 0x0d, 0x0e, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x0f, 0x80,
    0x80, 0x80, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
    0x18, 0x19, 0x1a, 0x80, 0x1b, 0x1c, 0x1d, 0x80, 0x1e, 0x1f,
    0x20, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x21, 0x80
];

export const portraitIndices2 = [
    0x00, 0x01, 0x02, 0x80, 0x03, 0x80, 0x80, 0x80, 0x04, 0x80,
    0x80, 0x80, 0x05, 0x80, 0x06, 0x07, 0x80, 0x80, 0x08, 0x09,
    0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13,
    0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x80, 0x1c,
    0x1d, 0x1e, 0x80, 0x80, 0x80, 0x1f, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x20, 0x80, 0x80,
    0x80, 0x21, 0x22, 0x80, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x80, 0x80
];

export interface PortraitMappingEntry {
    readonly disk: number;
    readonly portraitId: number;
    readonly index: number;
    readonly offset: number;
}

export const portraitMappings: PortraitMappingEntry[] = [
    { disk: 0, portraitId: 0, index: 0, offset: 0x0000 },
    { disk: 0, portraitId: 1, index: 1, offset: 0x07d1 },
    { disk: 0, portraitId: 2, index: 2, offset: 0x1394 },
    { disk: 0, portraitId: 3, index: 3, offset: 0x1e6a },
    { disk: 0, portraitId: 5, index: 4, offset: 0x2639 },
    { disk: 0, portraitId: 6, index: 5, offset: 0x3329 },
    { disk: 0, portraitId: 7, index: 6, offset: 0x3f44 },
    { disk: 0, portraitId: 8, index: 7, offset: 0x4d73 },
    { disk: 0, portraitId: 9, index: 8, offset: 0x5db3 },
    { disk: 0, portraitId: 10, index: 9, offset: 0x68e6 },
    { disk: 0, portraitId: 11, index: 10, offset: 0x7261 },
    { disk: 0, portraitId: 12, index: 11, offset: 0x84f5 },
    { disk: 0, portraitId: 13, index: 12, offset: 0x8da4 },
    { disk: 0, portraitId: 16, index: 13, offset: 0x9669 },
    { disk: 0, portraitId: 17, index: 14, offset: 0xa5ab },
    { disk: 0, portraitId: 38, index: 15, offset: 0xafe7 },
    { disk: 0, portraitId: 42, index: 16, offset: 0xb86c },
    { disk: 0, portraitId: 43, index: 17, offset: 0xc6a3 },
    { disk: 0, portraitId: 44, index: 18, offset: 0xd04c },
    { disk: 0, portraitId: 45, index: 19, offset: 0xdbca },
    { disk: 0, portraitId: 46, index: 20, offset: 0xe691 },
    { disk: 0, portraitId: 47, index: 21, offset: 0xf8f2 },
    { disk: 0, portraitId: 48, index: 22, offset: 0x10332 },
    { disk: 0, portraitId: 49, index: 23, offset: 0x10bc7 },
    { disk: 0, portraitId: 50, index: 24, offset: 0x116af },
    { disk: 0, portraitId: 51, index: 25, offset: 0x120b5 },
    { disk: 0, portraitId: 52, index: 26, offset: 0x120b5 },
    { disk: 0, portraitId: 54, index: 27, offset: 0x15763 },
    { disk: 0, portraitId: 55, index: 28, offset: 0x15eff },
    { disk: 0, portraitId: 56, index: 29, offset: 0x16920 },
    { disk: 0, portraitId: 58, index: 30, offset: 0x17181 },
    { disk: 0, portraitId: 59, index: 31, offset: 0x17bd1 },
    { disk: 0, portraitId: 60, index: 32, offset: 0x186cb },
    { disk: 0, portraitId: 78, index: 33, offset: 0x19129 },
    { disk: 1, portraitId: 0, index: 0, offset: 0x0000 },
    { disk: 1, portraitId: 1, index: 1, offset: 0x07d1 },
    { disk: 1, portraitId: 2, index: 2, offset: 0x1394 },
    { disk: 1, portraitId: 4, index: 3, offset: 0x1e6a },
    { disk: 1, portraitId: 8, index: 4, offset: 0x28be },
    { disk: 1, portraitId: 12, index: 5, offset: 0x38fe },
    { disk: 1, portraitId: 14, index: 6, offset: 0x41ad },
    { disk: 1, portraitId: 15, index: 7, offset: 0x4992 },
    { disk: 1, portraitId: 18, index: 8, offset: 0x515e },
    { disk: 1, portraitId: 19, index: 9, offset: 0x5c9a },
    { disk: 1, portraitId: 20, index: 10, offset: 0x66f8 },
    { disk: 1, portraitId: 21, index: 11, offset: 0x7287 },
    { disk: 1, portraitId: 22, index: 12, offset: 0x7bbc },
    { disk: 1, portraitId: 23, index: 13, offset: 0x8871 },
    { disk: 1, portraitId: 24, index: 14, offset: 0x8e3d },
    { disk: 1, portraitId: 25, index: 15, offset: 0x9927 },
    { disk: 1, portraitId: 26, index: 16, offset: 0xa2d6 },
    { disk: 1, portraitId: 27, index: 17, offset: 0xac0d },
    { disk: 1, portraitId: 28, index: 18, offset: 0xb758 },
    { disk: 1, portraitId: 29, index: 19, offset: 0xc12e },
    { disk: 1, portraitId: 30, index: 20, offset: 0xcd0f },
    { disk: 1, portraitId: 31, index: 21, offset: 0xd6d4 },
    { disk: 1, portraitId: 32, index: 22, offset: 0xe671 },
    { disk: 1, portraitId: 33, index: 23, offset: 0xef36 },
    { disk: 1, portraitId: 34, index: 24, offset: 0xf88d },
    { disk: 1, portraitId: 35, index: 25, offset: 0x1009b },
    { disk: 1, portraitId: 36, index: 26, offset: 0x10acf },
    { disk: 1, portraitId: 37, index: 27, offset: 0x11a37 },
    { disk: 1, portraitId: 39, index: 28, offset: 0x122fe },
    { disk: 1, portraitId: 40, index: 29, offset: 0x12d71 },
    { disk: 1, portraitId: 41, index: 30, offset: 0x13686 },
    { disk: 1, portraitId: 45, index: 31, offset: 0x14282 },
    { disk: 1, portraitId: 57, index: 32, offset: 0x14d49 },
    { disk: 1, portraitId: 61, index: 33, offset: 0x15721 },
    { disk: 1, portraitId: 62, index: 34, offset: 0x1653b },
    { disk: 1, portraitId: 64, index: 35, offset: 0x16f6f },
    { disk: 1, portraitId: 65, index: 36, offset: 0x1797a },
    { disk: 1, portraitId: 66, index: 37, offset: 0x18688 },
    { disk: 1, portraitId: 67, index: 38, offset: 0x19451 },
    { disk: 1, portraitId: 68, index: 39, offset: 0x19dd4 },
    { disk: 1, portraitId: 69, index: 40, offset: 0x1a50d },
    { disk: 1, portraitId: 70, index: 41, offset: 0x1aefe },
    { disk: 1, portraitId: 71, index: 42, offset: 0x1bcc6 },
    { disk: 1, portraitId: 72, index: 43, offset: 0x1c931 },
    { disk: 1, portraitId: 73, index: 44, offset: 0x1d4e0 },
    { disk: 1, portraitId: 74, index: 45, offset: 0x1dda9 },
    { disk: 1, portraitId: 75, index: 46, offset: 0x1eadf },
    { disk: 1, portraitId: 76, index: 47, offset: 0x1f49f },
    { disk: 1, portraitId: 77, index: 48, offset: 0x1fe8f }
];

export const mobSpriteMap = [ 0, 6, 3, 4, 2, 1 ];

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
