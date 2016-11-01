/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
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
     * @return the skill ID.
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Returns the skill level.
     *
     * @return The skill level.
     */
    public getLevel(): number {
        return this.level;
    }
}
