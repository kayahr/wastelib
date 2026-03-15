/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * Enum with the five possible types of a mob.
 *
 * @see https://wasteland.gamepedia.com/Map_Data_Monster_Body
 *
 * @enum
 */
export const MobType = {
    /** Mob is an animal. */
    ANIMAL: 1,

    /** Mob is a mutant. */
    MUTANT: 2,

    /** Mob is a humanoid. */
    HUMANOID: 3,

    /** Mob is a cyborg. */
    CYBORG: 4,

    /** Mob is a robot. */
    ROBOT: 5
} as const;
export type MobType = (typeof MobType)[keyof typeof MobType];
