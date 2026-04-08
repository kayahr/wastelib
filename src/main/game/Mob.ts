/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { MobType } from "./MobType.ts";
import type { BinaryReader } from "../io/BinaryReader.ts";
import type { ItemType } from "./ItemType.ts";

/**
 * Mob stats.
 *
 * @see https://wasteland.fandom.com/wiki/Map_Data_Monster_Body
 */
export class Mob {
    private readonly sturdiness: number;
    private readonly combatRating: number;
    private readonly randomDamage: number;
    private readonly maxGroupSize: number;
    private readonly armorClass: number;
    private readonly fixedDamage: number;
    private readonly weaponType: ItemType;
    private readonly mobType: MobType;
    private readonly portrait: number;
    private readonly name: string;

    private constructor(
        sturdiness: number,
        combatRating: number,
        randomDamage: number,
        maxGroupSize: number,
        armorClass: number,
        fixedDamage: number,
        weaponType: ItemType,
        mobType: MobType,
        portrait: number,
        name: string
    ) {
        this.sturdiness = sturdiness;
        this.combatRating = combatRating;
        this.randomDamage = randomDamage;
        this.maxGroupSize = maxGroupSize;
        this.armorClass = armorClass;
        this.fixedDamage = fixedDamage;
        this.weaponType = weaponType;
        this.mobType = mobType;
        this.portrait = portrait;
        this.name = name;
    }

    /**
     * Reads mob data from the given reader and returns it. The mob name must also be passed to this function
     * because it is not part of the mob data block.
     *
     * @param reader - The reader to read the mob data from.
     * @param name   - The mob name.
     * @returns The read mob data.
     * @internal
     */
    public static read(reader: BinaryReader, name: string): Mob {
        const sturdiness = reader.readUint16();
        const combatRating = reader.readUint8();
        const randomDamage = reader.readUint8();
        const maxGroupSize = reader.readBits(4);
        const armorClass = reader.readBits(4);
        const fixedDamage = reader.readBits(4);
        const weaponType = reader.readBits(4) as ItemType;
        const mobType = reader.readUint8() as MobType;
        const portrait = reader.readUint8();
        return new Mob(sturdiness, combatRating, randomDamage, maxGroupSize, armorClass, fixedDamage, weaponType, mobType,
            portrait, name);
    }

    /**
     * Returns the sturdiness value of the mob. This is the raw seed used for both hit point rolls and the awarded
     * experience points.
     *
     * @returns The sturdiness value.
     */
    public getSturdiness(): number {
        return this.sturdiness;
    }

    /**
     * Returns the minimum number of hit points a spawned mob instance can have. Hit points are rolled as
     * `floor(sturdiness / 4) + ((rnd(highByte) << 8) | rnd(lowByte))` with `rnd(0) = 0`, `rnd(1) = 1` and
     * `rnd(n >= 2) = 1..n`.
     *
     * @returns The minimum number of hit points.
     */
    public getMinHitPoints(): number {
        const lowByte = this.sturdiness & 0xff;
        const highByte = this.sturdiness >> 8;
        return (this.sturdiness >> 2) + (lowByte === 0 ? 0 : 1) + (highByte === 0 ? 0 : 0x100);
    }

    /**
     * Returns the maximum number of hit points a spawned mob instance can have. Hit points are rolled as
     * `floor(sturdiness / 4) + ((rnd(highByte) << 8) | rnd(lowByte))` with `rnd(0) = 0`, `rnd(1) = 1` and
     * `rnd(n >= 2) = 1..n`.
     *
     * @returns The maximum number of hit points.
     */
    public getMaxHitPoints(): number {
        return (this.sturdiness >> 2) + this.sturdiness;
    }

    /**
     * Rolls the hit points for a spawned mob instance using the same byte-wise logic as the game:
     * `floor(sturdiness / 4) + ((rnd(highByte) << 8) | rnd(lowByte))`.
     * Randomness is sourced from `Math.random()`.
     *
     * @returns The rolled hit points.
     */
    public rollHitPoints(): number {
        const lowByte = this.sturdiness & 0xff;
        const highByte = this.sturdiness >> 8;
        const lowRoll = Mob.rollByte(lowByte);
        const highRoll = Mob.rollByte(highByte);
        return (this.sturdiness >> 2) + (highRoll << 8) + lowRoll;
    }

    /**
     * The overall combat rating of the mob. See `combat.md` for details.
     *
     * @returns The combat rating.
     */
    public getCombatRating(): number {
        return this.combatRating;
    }

    /**
     * Returns how much damage (in D6) the monster inflicts additional to the fixed damage.
     *
     * @returns The random amount of damage in D6.
     */
    public getRandomDamage(): number {
        return this.randomDamage;
    }

    /**
     * The maximum number of this mob type to appear in one group.
     *
     * @returns The maximum number of mobs of this type in one group.
     */
    public getMaxGroupSize(): number {
        return this.maxGroupSize;
    }

    /**
     * Returns the armor class.
     *
     * @returns The armor class.
     */
    public getArmorClass(): number {
        return this.armorClass;
    }

    /**
     * Returns the fixed amount of damage the mob inflicts.
     *
     * @returns The fixed amount of damage.
     */
    public getFixedDamage(): number {
        return this.fixedDamage;
    }

    /**
     * @returns The weapon type.
     */
    public getWeaponType(): number {
        return this.weaponType;
    }

    /**
     * @returns The mob type.
     */
    public getMobType(): MobType {
        return this.mobType;
    }

    /**
     * @returns The portrait number to display for this mob.
     */
    public getPortrait(): number {
        return this.portrait;
    }

    /**
     * Returns the mob name.
     *
     * TODO Implement singular/plural support.
     *
     * @returns The mob name.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns the number of experience points the player gets when killing this mob. This is calculated by
     * multiplying the sturdiness by the armor class plus 1.
     *
     * @returns The number of XP.
     */
    public getExperience(): number {
        return this.sturdiness * (this.armorClass + 1);
    }

    /**
     * Emulates the game's `rnd` helper for a single byte.
     */
    private static rollByte(max: number): number {
        if (max <= 1) {
            return max;
        }
        return Math.min(max - 1, Math.floor(Math.random() * max)) + 1;
    }
}
