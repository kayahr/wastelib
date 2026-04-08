/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";
import type { CheckType } from "./CheckType.ts";

/**
 * A check used in the Check Action.
 */
export class Check {
    readonly #type: CheckType;
    readonly #value: number;
    readonly #difficulty: number;
    #newActionClass: number | null = null;
    #newAction: number | null = null;

    /**
     * @internal
     */
    public constructor(
        type: CheckType,
        value: number,
        difficulty: number
    ) {
        this.#type = type;
        this.#value = value;
        this.#difficulty = difficulty;
    }

    /**
     * @internal
     */
    public static read(reader: BinaryReader): Check | null {
        const b = reader.readUint8();
        if (b === 255) {
            return null;
        }
        const type = (b >> 5) as CheckType;
        const difficulty = b & 31;
        const value = reader.readUint8();

        return new Check(type, value, difficulty);
    }

    /**
     * @internal
     */
    public readReplacement(reader: BinaryReader): this {
        this.#newActionClass = reader.readUint8();
        this.#newAction = reader.readUint8();
        return this;
    }


    /**
     * @returns The check value
     */
    public getValue(): number {
        return this.#value;
    }


    /**
     * @returns The difficulty
     */
    public getDifficulty(): number {
        return this.#difficulty;
    }

    /**
     * @returns The type
     */
    public getType(): CheckType {
        return this.#type;
    }

    /**
     * @returns The new action or null if none.
     */
    public getNewAction(): number | null {
        return this.#newAction;
    }

    /**
     * @returns The new action class of null if none.
     */
    public getNewActionClass(): number | null {
        return this.#newActionClass;
    }
}
