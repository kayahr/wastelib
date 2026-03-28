/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * A character skill level.
 */
export class SkillLevel {
    /** The skill ID. */
    private readonly id: number;

    /** The skill level. */
    private readonly level: number;

    /**
     * Creates a new skill.
     *
     * @param id    - The skill ID (1-35).
     * @param level - The skill level.
     */
    public constructor(id: number, level: number) {
        this.id = id;
        this.level = level;
    }

    /**
     * @returns The skill ID (1-35).
     */
    public getId(): number {
        return this.id;
    }

    /**
     * @returns The skill level.
     */
    public getLevel(): number {
        return this.level;
    }
}
