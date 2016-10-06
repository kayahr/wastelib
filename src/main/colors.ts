/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/** Transparent RGBA color. */
export const TRANSPARENCY = 0x00000000;

/** A solid black. */
export const BLACK = 0x000000ff;

/**
 * The 16 colors (In RGBA format) used by the game graphics.
 */
export const COLOR_PALETTE = [
    BLACK,      //  0 = black
    0x0000aaff, //  1 = blue
    0x00aa00ff, //  2 = green
    0x00aaaaff, //  3 = cyan
    0xaa0000ff, //  4 = red
    0xaa00aaff, //  5 = magenta
    0xaa5500ff, //  6 = brown
    0xaaaaaaff, //  7 = light gray
    0x555555ff, //  8 = gray
    0x5555ffff, //  9 = light blue
    0x55ff55ff, // 10 = light green
    0x55ffffff, // 11 = light cyan
    0xff5555ff, // 12 = light red
    0xff55ffff, // 13 = light magenta
    0xffff55ff, // 14 = yellow
    0xffffffff  // 15 = white
];
