/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Enum with the 16 possible action classes for a map tile.
 *
 * @see http://wasteland.gamepedia.com/Map_Tile_Action_Classes
 */
export enum ActionClass {
    /** No action. */
    NONE = 0,

    /** Prints one or more strings & can change the Nibble/Byte tile data. */
    PRINT = 1,

    /** Check square. */
    CHECK = 2,

    /** Pointer to fixed encounter header which holds the pointers to the fixed encounter data. */
    FIXED_ENCOUNTER = 3,

    /**
     * Used to mask other tiles with alternate tile graphic. Used to 'swap' tiles without using the ALTER action class.
     * Used for hidden bases, 'exploding' tiles, smashed doors, etc...
     */
    MASK = 4,

    /** Pointer to loot header which holds the pointers to the loot data. */
    LOOT = 5,

    /**
     * Pointer to special building data like shops, doctors, libraries and the Ranger Center. It is also used to run
     * multiple special actions in addition to handling buildings.
     */
    SPECIAL = 6,

    /** Unused? */
    UNKNOWN$07 = 7,

    /** Used for all popup window dialogue. Contains refs to valid responses and n/bb pairs on pass/fail. */
    DIALOG = 8,

    /** Pointer to radiation header which holds the pointers to the radiation data. */
    RAD = 9,

    /** Pointer to transition header which holds the pointers to the transition data. */
    TRANSITION = 10,

    /** Impassable square. */
    BLOCKED = 11,

    /** Alters tiles. Can be used to alter any tile on a map. */
    ALTER = 12,

    /** Unused? */
    UNKNOWN$0D = 13,

    /** Unused? */
    UNKNOWN$0E = 14,

    /** Pointer to random encounter header which holds the pointers to the random encounter data. */
    RANDOM_ECOUNTER = 15
}
