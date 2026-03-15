/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * A character skill.
 */
export class Skill {
    /** The skill ID. */
    private readonly id: number;

    /** The skill level. */
    private readonly level: number;

    /**
     * Creates a new skill.
     *
     * @param id     The skill ID.
     * @param level  The skill level.
     */
    public constructor(id: number, level: number) {
        this.id = id;
        this.level = level;
    }

    /**
     * Returns the skill ID.
     *
     * @returns The skill ID.
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Returns the skill level.
     *
     * @returns The skill level.
     */
    public getLevel(): number {
        return this.level;
    }
}
