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

    /** Unknown check type 4. */
    UNKNOWN4: 4,

    /** Unknown check type 5. */
    UNKNOWN5: 5,

    /** Unknown check type 6. */
    UNKNOWN6: 6,

    /** Unknown check type 7. */
    UNKNOWN7: 7
} as const;
export type CheckType = (typeof CheckType)[keyof typeof CheckType];
