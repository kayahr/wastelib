/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { MobType } from "./MobType";
import { BinaryReader } from "../io/BinaryReader";

/**
 * Mob stats.
 *
 * @see http://wasteland.gamepedia.com/Map_Data_Monster_Body
 */
export class Mob {
    private constructor(
        private readonly hitPoints: number,
        private readonly hitChance: number,
        private readonly randomDamage: number,
        private readonly maxGroupSize: number,
        private readonly armorClass: number,
        private readonly fixedDamage: number,
        private readonly damageType: number,
        private readonly mobType: MobType,
        private readonly portrait: number,
        private readonly name: string
    ) {}

    /**
     * Reads mob data from the given reader and returns it. The mob name must also be passed to this function
     * because it is not part of the mob data block.
     *
     * @param reader  The readert to read the mob data from.
     * @param name    The mob name.
     * @return        The read mob data.
     */
    public static read(reader: BinaryReader, name: string) {
        const hitPoints = reader.readUint16();
        const hitChance = reader.readUint8();
        const randomDamage = reader.readUint8();
        const maxGroupSize = reader.readBits(4);
        const armorClass = reader.readBits(4);
        const fixedDamage = reader.readBits(4);
        const damageType = reader.readBits(4);
        const mobType = reader.readUint8();
        const portrait = reader.readUint8();
        return new Mob(hitPoints, hitChance, randomDamage, maxGroupSize, armorClass, fixedDamage, damageType, mobType,
            portrait, name);
    }

    /**
     * Returns the base hit points of the mob. This is used to calculate the minimum and maximum number of hitpoints
     * and also the experience points the player gets when killing the mob.
     *
     * @return The base hit points.
     */
    public getHitPoints(): number {
        return this.hitPoints;
    }

    /**
     * Returns the minimum number of hit points. This is calculated by dividing the base hit points by four. Well,
     * at least I think so. The Deconstruction Wiki says "([B1:B0] / 4) + (rnd B1)(rnd B0)" but it's unclear how
     * "rnd" works and if the minmum value it returns is 0 or 1.
     *
     * TODO Go and find a good opponent, kill it over and over again and check how many minimum hitpoints it really
     * has.
     *
     * @return The minimum number of hit points.
     */
    public getMinHitPoints(): number {
        return this.hitPoints >> 2;
    }

    /**
     * Returns the maximum number of hit points. This is calculated by dividing the base hit points by four and then
     * adding the base hit points again. Well, at least I think so. The Deconstruction Wiki says
     * "([B1:B0] / 4) + (rnd B1)(rnd B0)" but it's unclear how rnd works.
     *
     * TODO Go and find a good opponent, kill it over and over again and check how many maximum hitpoints it really
     * has.
     *
     * @return The maximum number of hit points.
     */
    public getMaxHitPoints(): number {
        return (this.hitPoints >> 2) + this.hitPoints;
    }

    /**
     * Returns the hit chance of the mob. The higher this number is the better chance of hitting the target.
     * Unfortunately it's unknown how this actually works.
     *
     * @return The hit chance.
     */
    public getHitChance(): number {
        return this.hitChance;
    }

    /**
     * Returns how much damage (in D6) the monster inflicts additional to the fixed damage.
     *
     * @return The random amount of damage in D6.
     */
    public getRandomDamage(): number {
        return this.randomDamage;
    }

    /**
     * The maximum number of this mob type to appear in one group.
     *
     * @return The maximum number of mobs of this type in one group.
     */
    public getMaxGroupSize(): number {
        return this.maxGroupSize;
    }

    /**
     * Returns the armor class.
     *
     * @return The armor class.
     */
    public getArmorClass(): number {
        return this.armorClass;
    }

    /**
     * Returns the fixed amount of damage the mob inflicts.
     *
     * @return The fixed amount of damage.
     */
    public getFixedDamage(): number {
        return this.fixedDamage;
    }

    /**
     * Returns the damage type. Unclear how this actually works in combat.
     *
     * @return The damage type.
     */
    public getDamageType(): number {
        return this.damageType;
    }

    /**
     * Returns the mob type.
     *
     * @return The mob type.
     */
    public getMobType(): MobType {
        return this.mobType;
    }

    /**
     * Returns the portrait number to display for this mob.
     *
     * @return The portrait number to display.
     */
    public getPortrait(): number {
        return this.portrait;
    }

    /**
     * Returns the mob name.
     *
     * TODO Implement singular/plural support.
     *
     * @return The mob name.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns the number of experience points the player gets when killing this mob. This is calculated by
     * multiplying the base hitpoints with the armor class plus 1.
     *
     * @return The number of XP.
     */
    public getExperience(): number {
        return this.hitPoints * (this.armorClass + 1);
    }
}
