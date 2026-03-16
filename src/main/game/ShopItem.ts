/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { BinaryReader } from "../io/BinaryReader.ts";
import type { ItemType } from "./ItemType.ts";

/**
 * Shop item
 */
export class ShopItem {
    /** The price */
    private readonly price: number;

    /** The stock */
    private readonly stock: number;

    /** The item type */
    private readonly type: ItemType;

    /** If weapon is a demolition weapon (Affects splash-damage on auto-miss roles and playing a sound effect */
    private readonly demolition: boolean;

    /** The ammo capacity */
    private readonly capacity: number;

    /** The skill which is used for this item */
    private readonly skill: number;

    /** The base damage (1D6) */
    private readonly damage: number;

    /** The item used for ammunition */
    private readonly ammo: number;

    /**
     * Creates a new shop item read from the given reader
     *
     * @param reader - The reader to read the shop item data from.
     * @internal
     */
    public constructor(reader: BinaryReader) {
        this.price = reader.readUint16();
        this.stock = reader.readUint8();
        const b = reader.readUint8();
        this.type = (b >> 3) as ItemType;
        if ((b & 7) > 1) {
            throw new Error("Demolition flag is higher than 1");
        }
        this.demolition = (b & 7) === 1;
        this.capacity = reader.readUint8();
        this.skill = reader.readUint8();
        this.damage = reader.readUint8();
        this.ammo = reader.readUint8();
    }

    /**
     * @returns The ammo.
     */
    public getAmmo(): number {
        return this.ammo;
    }

    /**
     * @returns The capacity.
     */
    public getCapacity(): number {
        return this.capacity;
    }

    /**
     * @returns The damage.
     */
    public getDamage(): number {
        return this.damage;
    }

    /**
     * @returns The price.
     */
    public getPrice(): number {
        return this.price;
    }

    /**
     * @returns The skill.
     */
    public getSkill(): number {
        return this.skill;
    }

    /**
     * @returns The stock.
     */
    public getStock(): number {
        return this.stock;
    }

    /**
     * @returns The type.
     */
    public getType(): ItemType {
        return this.type;
    }

    /**
     * Returns true if item is a demolition weapon. This affects for example the playing of a sound effect when the weapon is fired.
     *
     * @returns The demolition flag.
     */
    public isDemolition(): boolean {
        return this.demolition;
    }
}
