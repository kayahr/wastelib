/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * The nationality of a character.
 *
 * @enum
 */
export const Nationality = {
    /** Character is a US citizen */
    US: 0,

    /** Character is russian. */
    RUSSIAN: 1,

    /** Character is mexican */
    MEXICAN: 2,

    /** Character is native american. */
    INDIAN: 3,

    /** Character is chinese. */
    CHINESE: 4
} as const;
export type Nationality = (typeof Nationality)[keyof typeof Nationality];
