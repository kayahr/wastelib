/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * Check type.
 *
 * @enum
 */
export const CheckType = {
    /** Constant for skill check */
    SKILL: 0,

    /** Constant for item check */
    ITEM: 1,

    /** Constant for attribute check */
    ATTRIBUTE: 2,

    /** Constant for party member check */
    MEMBERS: 3,

    /** Constant for money check. */
    MONEY: 4
} as const;
export type CheckType = (typeof CheckType)[keyof typeof CheckType];
