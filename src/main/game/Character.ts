/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { Gender } from "./Gender.ts";
import type { Nationality } from "./Nationality.ts";
import type { BinaryReader } from "../io/BinaryReader.ts";
import { Skill } from "./Skill.ts";
import { Item } from "./Item.ts";

/**
 * Reads the skill list from the given reader. Reads 60 bytes in total but only returns the occupied skill slots.
 *
 * @param reader - The reader to read the skills from.
 * @returns The read skills.
 */
function readSkills(reader: BinaryReader): Skill[] {
    const skills: Skill[] = [];
    for (let i = 0; i < 30; ++i) {
        const id = reader.readUint8();
        const level = reader.readUint8();
        if (id) {
            skills.push(new Skill(id, level));
        }
    }
    return skills;
}

/**
 * Reads the item list from the given reader. Reads 60 bytes in total but only returns the occupied item slots.
 *
 * @param reader - The reader to read the items from.
 * @returns The read items.
 */
function readItems(reader: BinaryReader): Item[] {
    const items: Item[] = [];
    for (let i = 0; i < 30; ++i) {
        const id = reader.readUint8();
        const ammoAndStatus = reader.readUint8();
        const load = ammoAndStatus & 0x7f;
        const jammed = (ammoAndStatus & 0x80) !== 0;
        if (id) {
            items.push(new Item(id, load, jammed));
        }
    }
    return items;
}

/**
 * Character data used for player characters and NPCs.
 *
 * TODO Add setters for all the data.
 *
 * @see https://wasteland.gamepedia.com/Character_Data
 */
export class Character {
    private readonly name: string;
    private readonly strength: number;
    private readonly intelligence: number;
    private readonly luck: number;
    private readonly speed: number;
    private readonly agility: number;
    private readonly dexterity: number;
    private readonly charisma: number;
    private readonly money: number;
    private readonly gender: Gender;
    private readonly nationality: Nationality;
    private readonly armorClass: number;
    private readonly maxCon: number;
    private readonly curCon: number;
    private readonly weapon: number;
    private readonly skillPoints: number;
    private readonly experience: number;
    private readonly level: number;
    private readonly armor: number;
    private readonly lastCon: number;
    private readonly afflictions: number;
    private readonly npc: boolean;
    private readonly itemRefuse: number;
    private readonly skillRefuse: number;
    private readonly attribRefuse: number;
    private readonly tradeRefuse: number;
    private readonly joinString: number;
    private readonly willingness: number;
    private readonly rank: string;
    private readonly gameWon: boolean;
    private readonly specialPromotion: boolean;
    private readonly skills: Skill[];
    private readonly items: Item[];

    /**
     * @internal
     */
    public constructor(reader: BinaryReader) {
        this.name = reader.readNullString(14);
        this.strength = reader.readUint8();
        this.intelligence = reader.readUint8();
        this.luck = reader.readUint8();
        this.speed = reader.readUint8();
        this.agility = reader.readUint8();
        this.dexterity = reader.readUint8();
        this.charisma = reader.readUint8();
        this.money = reader.readUint24();
        this.gender = reader.readUint8() as Gender;
        this.nationality = reader.readUint8() as Nationality;
        this.armorClass = reader.readUint8();
        this.maxCon = reader.readUint16();
        this.curCon = reader.readUint16();
        this.weapon = reader.readUint8();
        this.skillPoints = reader.readUint8();
        this.experience = reader.readUint24();
        this.level = reader.readUint8();
        this.armor = reader.readUint8();
        this.lastCon = reader.readUint16();
        this.afflictions = reader.readUint8();
        this.npc = reader.readUint8() === 1;
        reader.skip(1); // Skip unknown byte at 0x2a
        this.itemRefuse = reader.readUint8();
        this.skillRefuse = reader.readUint8();
        this.attribRefuse = reader.readUint8();
        this.tradeRefuse = reader.readUint8();
        reader.skip(1); // Skip unknown byte at 0x2f
        this.joinString = reader.readUint8();
        this.willingness = reader.readUint8();
        this.rank = reader.readNullString(25);
        this.gameWon = reader.readUint8() === 1;
        this.specialPromotion = reader.readUint8() === 1;
        reader.skip(51) // Skip 51 unknown bytes from 0x4d - 0x7f
        this.skills = readSkills(reader);
        reader.skip(1); // Skip unknown byte at 0xbc
        this.items = readItems(reader);
        reader.skip(7); // Skip 7 unknown bytes at 0xf9 - 0xff
    }

    /**
     * Returns the character name. NPC names are always upper-case.
     *
     * @returns The character name.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns the strength.
     *
     * @returns The strength.
     */
    public getStrength(): number {
        return this.strength;
    }

    /**
     * Returns the intelligence.
     *
     * @returns The intelligence.
     */
    public getIntelligence(): number {
        return this.intelligence;
    }

    /**
     * Returns the luck.
     *
     * @returns The luck.
     */
    public getLuck(): number {
        return this.luck;
    }

    /**
     * Returns the speed.
     *
     * @returns The speed.
     */
    public getSpeed(): number {
        return this.speed;
    }

    /**
     * Returns the agility.
     *
     * @returns The agility.
     */
    public getAgility(): number {
        return this.agility;
    }

    /**
     * Returns the dexterity.
     *
     * @returns The dexterity.
     */
    public getDexterity(): number {
        return this.dexterity;
    }

    /**
     * Returns the charisma.
     *
     * @returns The charisma.
     */
    public getCharisma(): number {
        return this.charisma;
    }

    /**
     * Returns the amount of dollars the character owns.
     *
     * @returns The amount of dollars.
     */
    public getMoney(): number {
        return this.money;
    }

    /**
     * Returns the gender.
     *
     * @returns The gender.
     */
    public getGender(): Gender {
        return this.gender;
    }

    /**
     * Returns the nationality.
     *
     * @returns The nationality.
     */
    public getNationality(): Nationality {
        return this.nationality;
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
     * Returns the maximum constitution.
     *
     * @returns The maximum constitution.
     */
    public getMaxCon(): number {
        return this.maxCon;
    }

    /**
     * Returns the current constitution.
     *
     * @returns The current constitution.
     */
    public getCon(): number {
        return this.curCon;
    }

    /**
     * Returns the item index of the equipped weapon. The index starts with 1. 0 means no weapon is equipped.
     *
     * @returns The item index of the equipped weapon. 0 if none.
     */
    public getWeapon(): number {
        return this.weapon;
    }

    /**
     * Returns the number of unspent skill points.
     *
     * @returns The number of unspent skill points.
     */
    public getSkillPoints(): number {
        return this.skillPoints;
    }

    /**
     * Returns the experience points.
     *
     * @returns The experience points.
     */
    public getExperience(): number {
        return this.experience;
    }

    /**
     * Returns the level.
     *
     * @returns The level.
     */
    public getLevel(): number {
        return this.level;
    }

    /**
     * Returns the item index of the equipped armor. The index starts with 1. 0 means no armor is equipped.
     *
     * @returns The item index of the equipped armor. 0 if none.
     */
    public getArmor(): number {
        return this.armor;
    }

    /**
     * Returns the last constitution before the player went unconscious or worse.
     *
     * @returns The last recorded constitution.
     */
    public getLastCon(): number {
        return this.lastCon;
    }

    /**
     * Returns the afflictions.
     *
     * TODO This is bit map. Find out what each bit means.
     *
     * @returns The afflictions.
     */
    public getAfflictions(): number {
        return this.afflictions;
    }

    /**
     * Checks if character is an NPC.
     *
     * @returns True if NPC, false if player character.
     */
    public isNPC(): boolean {
        return this.npc;
    }

    /**
     * Returns the chance of refusing an item usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse an item usage.
     */
    public getItemRefuse(): number {
        return this.itemRefuse;
    }

    /**
     * Returns the chance of refusing a skill usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse a skill usage.
     */
    public getSkillRefuse(): number {
        return this.skillRefuse;
    }

    /**
     * Returns the chance of refusing an attribute usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse an attribute usage.
     */
    public getAttribRefuse(): number {
        return this.attribRefuse;
    }

    /**
     * Returns the chance of refusing to trade. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse trading.
     */
    public getTradeRefuse(): number {
        return this.tradeRefuse;
    }

    /**
     * Returns the string ID of the join message.
     *
     * @returns The string ID of the join message.
     */
    public getJoinString(): number {
        return this.joinString;
    }

    /**
     * Returns the willingness to carry out a command.
     *
     * TODO Find out how this actually works.
     *
     * @returns The willingness to carry out a command.
     */
    public getWillingness(): number {
        return this.willingness;
    }

    /**
     * Returns the rank name.
     *
     * @returns The rank name.
     */
    public getRank(): string {
        return this.rank;
    }

    /**
     * Checks if character has won the game.
     *
     * @returns True if character has won the game, false if not.
     */
    public isGameWon(): boolean {
        return this.gameWon;
    }

    /**
     * Checks if character has received the special promotion after the end of the game.
     *
     * @returns True if character has received the special promotion, false if not.
     */
    public isSpecialPromotion(): boolean {
        return this.specialPromotion;
    }

    /**
     * Returns the skills.
     *
     * @returns The skills.
     */
    public getSkills(): Skill[] {
        return this.skills;
    }

    /**
     * Returns the items.
     *
     * @returns The items.
     */
    public getItems(): Item[] {
        return this.items;
    }
}
