/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * A characters gender
 *
 * @enum
 */
export const Gender = {
    /** Character is male. */
    MALE: 0,

    /** Character is female. */
    FEMALE: 1
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
