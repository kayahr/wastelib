/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";

/**
 * A character skill level.
 */
export class SkillLevel {
    readonly #id: number;
    readonly #level: number;

    private constructor(id: number, level: number) {
        this.#id = id;
        this.#level = level;
    }

    /** @internal */
    public static read(reader: BinaryReader): SkillLevel | null {
        const id = reader.readUint8();
        const level = reader.readUint8();
        return id === 0 || level === 0 ? null : new SkillLevel(id, level);
    }

    /**
     * @returns The skill ID (1-35).
     */
    public getId(): number {
        return this.#id;
    }

    /**
     * @returns The skill level (1-n).
     */
    public getLevel(): number {
        return this.#level;
    }
}
