/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * The item type.
 */
export enum ItemType {
    /** Melee weapon */
    MELEE_WEAPON = 1,

    /** Short range single shot weapon */
    SHORT_RANGE_WEAPON = 2,

    /** Medium range single shot weapon */
    MEDIUM_RANGE_WEAPON = 3,

    /** Long range single shot weapon */
    LONG_RANGE_WEAPON = 4,

    /** Short range burst/auto weapon */
    SHORT_RANGE_AUTO_WEAPON = 5,

    /** Medium range burst/auto weapon */
    MEDIUM_RANGE_AUTO_WEAPON = 6,

    /** Long range burst/auto weapon */
    LONG_RANGE_AUTO_WEAPON = 7,

    /** Medium range rocket */
    MEDIUM_RANGE_ROCKET_WEAPON = 8,

    /** Long range rocket */
    LONG_RANGE_ROCKET_WEAPON = 9,

    /** Short range energy weapon */
    SHORT_RANGE_ENERGY_WEAPON = 10,

    /** Medium range energy weapon */
    MEDIUM_RANGE_ENERGY_WEAPON = 11,

    /** Long range energy weapon */
    LONG_RANGE_ENERGY_WEAPON = 12,

    /** Explosive weapon */
    EXPLOSIVE_WEAPON = 13,

    /** Ammunition */
    AMMO = 14,

    /** Armor */
    ARMOR = 15,

    /** Standard item  = Like ropes, books, ... */
    STANDARD = 16,

    /** Special items  = Jewelry, Fruit, Clay pot */
    SPECIAL = 17,

    /** Quest items  = Keys, Android parts, ... */
    QUEST = 18
}
