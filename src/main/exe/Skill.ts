/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

/**
 * Skill data.
 */
export class Skill {
    readonly #id: number;
    readonly #name: string;
    readonly #minIQ: number;
    readonly #cost: number;
    readonly #attribute: number;

    /**
     * Creates skill data.
     *
     * @param id        - The skill ID (1-35).
     * @param name      - The skill name.
     * @param minIQ     - The minimum IQ needed to learn the skill.
     * @param cost      - How many skill points it costs to learn this skill.
     * @param attribute - The connected attribute (0 = Strength, ..., 6 = Charisma).
     */
    public constructor(id: number, name: string, minIQ: number, cost: number, attribute: number) {
        this.#id = id;
        this.#name = name;
        this.#minIQ = minIQ;
        this.#cost = cost;
        this.#attribute = attribute
    }

    /**
     * @returns The skill ID (1-35).
     */
    public getId(): number {
        return this.#id;
    }

    /**
     * @returns The skill name.
     */
    public getName(): string {
        return this.#name;
    }

    /**
     * @returns The minimum IQ needed to learn the skill.
     */
    public getMinIQ(): number {
        return this.#minIQ;
    }

    /**
     * @returns How many skill points it costs to learn this skill.
     */
    public getCost(): number {
        return this.#cost;
    }

    /**
     * @returns The connected attribute (0 = Strength, ..., 6 = Charisma).
     */
    public getAttribute(): number {
        return this.#attribute;
    }
}
