/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
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
        const load = reader.readUint8();
        const jammed = false; // TODO This is the high bit but from which byte?
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
 * @see http://wasteland.gamepedia.com/Character_Data
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
    private readonly unknown$2a: number;
    private readonly itemRefuse: number;
    private readonly skillRefuse: number;
    private readonly attribRefuse: number;
    private readonly tradeRefuse: number;
    private readonly unknown$2f: number;
    private readonly joinString: number;
    private readonly willingness: number;
    private readonly rank: string;
    private readonly gameWon: boolean;
    private readonly specialPromotion: boolean;
    private readonly unknown$4d: Uint8Array;
    private readonly skills: Skill[];
    private readonly unknown$bc: number;
    private readonly items: Item[];
    private readonly unknown$f9: Uint8Array;

    private constructor(
        name: string,
        strength: number,
        intelligence: number,
        luck: number,
        speed: number,
        agility: number,
        dexterity: number,
        charisma: number,
        money: number,
        gender: Gender,
        nationality: Nationality,
        armorClass: number,
        maxCon: number,
        curCon: number,
        weapon: number,
        skillPoints: number,
        experience: number,
        level: number,
        armor: number,
        lastCon: number,
        afflictions: number,
        npc: boolean,
        unknown$2a: number,
        itemRefuse: number,
        skillRefuse: number,
        attribRefuse: number,
        tradeRefuse: number,
        unknown$2f: number,
        joinString: number,
        willingness: number,
        rank: string,
        gameWon: boolean,
        specialPromotion: boolean,
        unknown$4d: Uint8Array,
        skills: Skill[],
        unknown$bc: number,
        items: Item[],
        unknown$f9: Uint8Array
    ) {
        this.name = name;
        this.strength = strength;
        this.intelligence = intelligence;
        this.luck = luck;
        this.speed = speed;
        this.agility = agility;
        this.dexterity = dexterity;
        this.charisma = charisma;
        this.money = money;
        this.gender = gender;
        this.nationality = nationality;
        this.armorClass = armorClass;
        this.maxCon = maxCon;
        this.curCon = curCon;
        this.weapon = weapon;
        this.skillPoints = skillPoints;
        this.experience = experience;
        this.level = level;
        this.armor = armor;
        this.lastCon = lastCon;
        this.afflictions = afflictions;
        this.npc = npc;
        this.unknown$2a = unknown$2a;
        this.itemRefuse = itemRefuse;
        this.skillRefuse = skillRefuse;
        this.attribRefuse = attribRefuse;
        this.tradeRefuse = tradeRefuse;
        this.unknown$2f = unknown$2f;
        this.joinString = joinString;
        this.willingness = willingness;
        this.rank = rank;
        this.gameWon = gameWon;
        this.specialPromotion = specialPromotion;
        this.unknown$4d = unknown$4d;
        this.skills = skills;
        this.unknown$bc = unknown$bc;
        this.items = items;
        this.unknown$f9 = unknown$f9;
    }

    /**
     * Reads character data from the given reader and returns it.
     *
     * @param reader - The reader to read the character data from.
     * @returns The read character data.
     */
    public static read(reader: BinaryReader): Character {
        const name = reader.readNullString(14);
        const strength = reader.readUint8();
        const iq = reader.readUint8();
        const luck = reader.readUint8();
        const speed = reader.readUint8();
        const agility = reader.readUint8();
        const dexterity = reader.readUint8();
        const charisma = reader.readUint8();
        const money = reader.readUint24();
        const gender = reader.readUint8();
        const nationality = reader.readUint8();
        const armorClass = reader.readUint8();
        const maxCon = reader.readUint16();
        const curCon = reader.readUint16();
        const weapon = reader.readUint8();
        const skillPoints = reader.readUint8();
        const experience = reader.readUint24();
        const level = reader.readUint8();
        const armor = reader.readUint8();
        const lastCon = reader.readUint16();
        const afflictions = reader.readUint8();
        const npc = reader.readUint8() === 1;
        const unknown$2a = reader.readUint8();
        const itemRefuse = reader.readUint8();
        const skillRefuse = reader.readUint8();
        const attribRefuse = reader.readUint8();
        const tradeRefuse = reader.readUint8();
        const unknown$2f = reader.readUint8();
        const joinString = reader.readUint8();
        const willingness = reader.readUint8();
        const rank = reader.readNullString(25);
        const gameWon = reader.readUint8() === 1;
        const specialPromotion = reader.readUint8() === 1;
        const unknown$4d = reader.readUint8s(51);
        const skills = readSkills(reader);
        const unknown$bc = reader.readUint8();
        const items = readItems(reader);
        const unknown$f9 = reader.readUint8s(7);
        return new Character(name, strength, iq, luck, speed, agility, dexterity, charisma, money, gender,
            nationality, armorClass, maxCon, curCon, weapon, skillPoints, experience, level, armor,
            lastCon, afflictions, npc, unknown$2a, itemRefuse, skillRefuse, attribRefuse, tradeRefuse,
            unknown$2f, joinString, willingness, rank, gameWon, specialPromotion, unknown$4d, skills,
            unknown$bc, items, unknown$f9);
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
     * Returns the unknown byte at offset 0x2a.
     *
     * @returns The unknown byte.
     */
    public getUnknown$2a(): number {
        return this.unknown$2a;
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
     * Returns the unknown byte at offset 0x2f.
     *
     * @returns The unknown byte.
     */
    public getUnknown$2f(): number {
        return this.unknown$2f;
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
     * Returns the 51 unknown bytes at offset 0x4d.
     *
     * @returns The unknown bytes.
     */
    public getUnknown$4d(): Uint8Array {
        return this.unknown$4d;
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
     * Returns the unknown byte at offset 0xbc.
     *
     * @returns The unknown byte.
     */
    public getUnknown$bc(): number {
        return this.unknown$bc;
    }

    /**
     * Returns the items.
     *
     * @returns The items.
     */
    public getItems(): Item[] {
        return this.items;
    }

    /**
     * Returns the seven unknown bytes at offset 0xf9.
     *
     * @returns The unknown bytes.
     */
    public getUnknown$f9(): Uint8Array {
        return this.unknown$f9;
    }
}
