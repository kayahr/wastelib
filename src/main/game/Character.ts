/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Gender } from "./Gender";
import { Nationality } from "./Nationality";
import { BinaryReader } from "../io/BinaryReader";
import { Skill } from "./Skill";
import { Item } from "./Item";

/**
 * Reads the skill list from the given reader. Reads 60 bytes in total but only returns the occupied skill slots.
 *
 * @param reader  The reader to read the skills from.
 * @return        The read skills.
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
 * @param reader  The reader to read the items from.
 * @return        The read items.
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
    private constructor(
        private name: string,
        private strength: number,
        private intelligence: number,
        private luck: number,
        private speed: number,
        private agility: number,
        private dexterity: number,
        private charisma: number,
        private money: number,
        private gender: Gender,
        private nationality: Nationality,
        private armorClass: number,
        private maxCon: number,
        private curCon: number,
        private weapon: number,
        private skillPoints: number,
        private experience: number,
        private level: number,
        private armor: number,
        private lastCon: number,
        private afflictions: number,
        private npc: boolean,
        private unknown$2a: number,
        private itemRefuse: number,
        private skillRefuse: number,
        private attribRefuse: number,
        private tradeRefuse: number,
        private unknown$2f: number,
        private joinString: number,
        private willingness: number,
        private rank: string,
        private gameWon: boolean,
        private specialPromotion: boolean,
        private unknown$4d: Uint8Array,
        private skills: Skill[],
        private unknown$bc: number,
        private items: Item[],
        private unknown$f9: Uint8Array
    ) {
        console.log(this);
    }

    /**
     * Reads character data from the given reader and returns it.
     *
     * @param reader  The reader to read the character data from.
     * @return        The read character data.
     */
    public static read(reader: BinaryReader) {
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
     * @return The character name.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns the strength.
     *
     * @return The strength.
     */
    public getStrength(): number {
        return this.strength;
    }

    /**
     * Returns the intelligence.
     *
     * @return The integlligence.
     */
    public getIntelligence(): number {
        return this.intelligence;
    }

    /**
     * Returns the luck.
     *
     * @return The luck.
     */
    public getLuck(): number {
        return this.luck;
    }

    /**
     * Returns the speed.
     *
     * @return The speed.
     */
    public getSpeed(): number {
        return this.speed;
    }

    /**
     * Returns the agility.
     *
     * @return The agility.
     */
    public getAgility(): number {
        return this.agility;
    }

    /**
     * Returns the dexterity.
     *
     * @return The dexterity.
     */
    public getDexterity(): number {
        return this.dexterity;
    }

    /**
     * Returns the charisma.
     *
     * @return The charisma.
     */
    public getCharisma(): number {
        return this.charisma;
    }

    /**
     * Returns the amount of dollars the character owns.
     *
     * @return The amount of dollars.
     */
    public getMoney(): number {
        return this.money;
    }

    /**
     * Returns the gender.
     *
     * @return The gender.
     */
    public getGender(): Gender {
        return this.gender;
    }

    /**
     * Returns the nationality.
     *
     * @return The nationality.
     */
    public getNationality(): Nationality {
        return this.nationality;
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
     * Returns the maximum constitution.
     *
     * @return The maximim constitution.
     */
    public getMaxCon(): number {
        return this.maxCon;
    }

    /**
     * Returns the current constitution.
     *
     * @return The current constitition.
     */
    public getCon(): number {
        return this.curCon;
    }

    /**
     * Returns the item index of the equipped weapon. The index starts with 1. 0 means no weapon is equipped.
     *
     * @return The item index of the equipped weapon. 0 if none.
     */
    public getWeapon(): number {
        return this.weapon;
    }

    /**
     * Returns the number of unspent skill points.
     *
     * @return The number of unspent skill points.
     */
    public getSkillPoints(): number {
        return this.skillPoints;
    }

    /**
     * Returns the experience points.
     *
     * @return The experience points.
     */
    public getExperience(): number {
        return this.experience;
    }

    /**
     * Returns the level.
     *
     * @return The level.
     */
    public getLevel(): number {
        return this.level;
    }

    /**
     * Returns the item index of the equipped armor. The index starts with 1. 0 means no armor is equipped.
     *
     * @return The item index of the equipped armor. 0 if none.
     */
    public getArmor(): number {
        return this.armor;
    }

    /**
     * Returns the last constitution before the player went unconcious or worse.
     *
     * @return The last recorded constitution.
     */
    public getLastCon(): number {
        return this.lastCon;
    }

    /**
     * Returns the afflictions.
     *
     * TODO This is bit map. Find out what each bit means.
     *
     * @return The afflictions.
     */
    public getAfflictions(): number {
        return this.afflictions;
    }

    /**
     * Checks if character is an NPC.
     *
     * @return True if NPC, false if player character.
     */
    public isNPC(): boolean {
        return this.npc;
    }

    /**
     * Returns the unknown byte at offset 0x2a.
     *
     * @return The unknown byte.
     */
    public getUnknown$2a(): number {
        return this.unknown$2a;
    }

    /**
     * Returns the chance of refusing an item usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @return The chance to refuse an item usage.
     */
    public getItemRefuse(): number {
        return this.itemRefuse;
    }

    /**
     * Returns the chance of refusing a skill usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @return The chance to refuse a skill usage.
     */
    public getSkillRefuse(): number {
        return this.skillRefuse;
    }

    /**
     * Returns the chance of refusing an attribute usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @return The chance to refuse an attribute usage.
     */
    public getAttribRefuse(): number {
        return this.attribRefuse;
    }

    /**
     * Returns the chance of refusing to trade. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @return The chance to refuse trading.
     */
    public getTradeRefuse(): number {
        return this.tradeRefuse;
    }

    /**
     * Returns the unknown byte at offset 0x2f.
     *
     * @return The unknown byte.
     */
    public getUnknown$2f(): number {
        return this.unknown$2f;
    }

    /**
     * Returns the string ID of the join message.
     *
     * @return The string ID of the join message.
     */
    public getJoinString(): number {
        return this.joinString;
    }

    /**
     * Returns the willingness to carry out a command.
     *
     * TODO Find out how this actually works.
     *
     * @return The willingness to carry out a command.
     */
    public getWillingness(): number {
        return this.willingness;
    }

    /**
     * Returns the rank name.
     *
     * @return The rank name.
     */
    public getRank(): string {
        return this.rank;
    }

    /**
     * Checks if character has won the game.
     *
     * @return True if character has won the game, false if not.
     */
    public isGameWon(): boolean {
        return this.gameWon;
    }

    /**
     * Checks if character has received the special promotion after the end of the game.
     *
     * @return True if character has received the special promition, false if not.
     */
    public isSpecialPromition(): boolean {
        return this.specialPromotion;
    }

    /**
     * Returns the 51 unknown bytes at offset 0x4d.
     *
     * @return The unknown bytes.
     */
    public getUnknown$4d(): Uint8Array {
        return this.unknown$4d;
    }

    /**
     * Returns the skills.
     *
     * @return The skills.
     */
    public getSkills(): Skill[] {
        return this.skills;
    }

    /**
     * Returns the unknown byte at offset 0xbc.
     *
     * @return The unknown byte.
     */
    public getUnknown$bc(): number {
        return this.unknown$bc;
    }

    /**
     * Returns the items.
     *
     * @return The items.
     */
    public getItems(): Item[] {
        return this.items;
    }

    /**
     * Returns the seven unknown bytes at offset 0xf9.
     *
     * @return The unknown bytes.
     */
    public getUnknown$f9(): Uint8Array {
        return this.unknown$f9;
    }
}
