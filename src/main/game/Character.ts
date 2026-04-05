/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { Gender } from "./Gender.ts";
import type { Nationality } from "./Nationality.ts";
import type { BinaryReader } from "../io/BinaryReader.ts";
import { SkillLevel } from "./SkillLevel.ts";
import { Item } from "./Item.ts";

/**
 * Character data used for player characters and NPCs.
 *
 * @see https://wasteland.gamepedia.com/Character_Data
 */
export class Character {
    readonly #name: string;
    readonly #strength: number;
    readonly #intelligence: number;
    readonly #luck: number;
    readonly #speed: number;
    readonly #agility: number;
    readonly #dexterity: number;
    readonly #charisma: number;
    readonly #money: number;
    readonly #gender: Gender;
    readonly #nationality: Nationality;
    readonly #armorClass: number;
    readonly #maxCon: number;
    readonly #curCon: number;
    readonly #weapon: number;
    readonly #skillPoints: number;
    readonly #experience: number;
    readonly #level: number;
    readonly #armor: number;
    readonly #lastCon: number;
    readonly #afflictions: number;
    readonly #npc: boolean;
    readonly #itemRefuse: number;
    readonly #skillRefuse: number;
    readonly #attribRefuse: number;
    readonly #tradeRefuse: number;
    readonly #joinMessageIndex: number;
    readonly #willingness: number;
    readonly #rank: string;
    readonly #gameWon: boolean;
    readonly #specialPromotion: boolean;
    readonly #skills: SkillLevel[] = [];
    readonly #items: Item[] = [];

    /**
     * @internal
     */
    public constructor(reader: BinaryReader) {
        this.#name = reader.readNullString(14);
        this.#strength = reader.readUint8();
        this.#intelligence = reader.readUint8();
        this.#luck = reader.readUint8();
        this.#speed = reader.readUint8();
        this.#agility = reader.readUint8();
        this.#dexterity = reader.readUint8();
        this.#charisma = reader.readUint8();
        this.#money = reader.readUint24();
        this.#gender = reader.readUint8() as Gender;
        this.#nationality = reader.readUint8() as Nationality;
        this.#armorClass = reader.readUint8();
        this.#maxCon = reader.readUint16();
        this.#curCon = reader.readUint16();
        this.#weapon = reader.readUint8();
        this.#skillPoints = reader.readUint8();
        this.#experience = reader.readUint24();
        this.#level = reader.readUint8();
        this.#armor = reader.readUint8();
        this.#lastCon = reader.readUint16();
        this.#afflictions = reader.readUint8();
        this.#npc = reader.readUint8() === 1;
        reader.skip(1); // Skip unknown byte at 0x2a
        this.#itemRefuse = reader.readUint8();
        this.#skillRefuse = reader.readUint8();
        this.#attribRefuse = reader.readUint8();
        this.#tradeRefuse = reader.readUint8();
        reader.skip(1); // Skip unknown byte at 0x2f
        this.#joinMessageIndex = reader.readUint8();
        this.#willingness = reader.readUint8();
        this.#rank = reader.readNullString(25);
        this.#gameWon = reader.readUint8() === 1;
        this.#specialPromotion = reader.readUint8() === 1;
        reader.skip(51) // Skip 51 unknown bytes from 0x4d - 0x7f
        for (let i = 0; i < 30; ++i) {
            const skill = SkillLevel.read(reader);
            if (skill != null) {
                this.#skills.push(skill);
            }
        }
        reader.skip(1); // Skip unknown byte at 0xbc
        for (let i = 0; i < 30; ++i) {
            const item = Item.read(reader);
            if (item != null) {
                this.#items.push(item);
            }
        }
        reader.skip(7); // Skip 7 unknown bytes at 0xf9 - 0xff
    }

    /**
     * @returns The character name. NPC names are always upper-case.
     */
    public getName(): string {
        return this.#name;
    }

    /**
     * @returns The strength attribute value.
     */
    public getStrength(): number {
        return this.#strength;
    }

    /**
     * @returns The intelligence attribute value.
     */
    public getIntelligence(): number {
        return this.#intelligence;
    }

    /**
     * @returns The luck attribute value.
     */
    public getLuck(): number {
        return this.#luck;
    }

    /**
     * @returns The speed attribute value.
     */
    public getSpeed(): number {
        return this.#speed;
    }

    /**
     * @returns The agility attribute value.
     */
    public getAgility(): number {
        return this.#agility;
    }

    /**
     * @returns The dexterity attribute value.
     */
    public getDexterity(): number {
        return this.#dexterity;
    }

    /**
     * @returns The charisma attribute value.
     */
    public getCharisma(): number {
        return this.#charisma;
    }

    /**
     * @returns The amount of dollars.
     */
    public getMoney(): number {
        return this.#money;
    }

    /**
     * @returns The gender.
     */
    public getGender(): Gender {
        return this.#gender;
    }

    /**
     * @returns The nationality.
     */
    public getNationality(): Nationality {
        return this.#nationality;
    }

    /**
     * @returns The armor class.
     */
    public getArmorClass(): number {
        return this.#armorClass;
    }

    /**
     * @returns The maximum constitution.
     */
    public getMaxCon(): number {
        return this.#maxCon;
    }

    /**
     * @returns The current constitution.
     */
    public getCon(): number {
        return this.#curCon;
    }

    /**
     * @returns The item index of the equipped weapon. The index starts with 1. 0 means no weapon is equipped.
     */
    public getWeapon(): number {
        return this.#weapon;
    }

    /**
     * @returns The number of unspent skill points.
     */
    public getSkillPoints(): number {
        return this.#skillPoints;
    }

    /**
     * @returns The experience points.
     */
    public getExperience(): number {
        return this.#experience;
    }

    /**
     * @returns The character level.
     */
    public getLevel(): number {
        return this.#level;
    }

    /**
     * @returns The item index of the equipped armor. The index starts with 1. 0 means no armor is equipped.
     */
    public getArmor(): number {
        return this.#armor;
    }

    /**
     * @returns The last constitution before the player went unconscious or worse.
     */
    public getLastCon(): number {
        return this.#lastCon;
    }

    /**
     * Returns the afflictions.
     *
     * TODO This is bit map. Find out what each bit means.
     *
     * @returns The afflictions.
     */
    public getAfflictions(): number {
        return this.#afflictions;
    }

    /**
     * @returns True if this character is an NPC, false if player character.
     */
    public isNPC(): boolean {
        return this.#npc;
    }

    /**
     * Returns the chance of refusing an item usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse an item usage.
     */
    public getItemRefuse(): number {
        return this.#itemRefuse;
    }

    /**
     * Returns the chance of refusing a skill usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse a skill usage.
     */
    public getSkillRefuse(): number {
        return this.#skillRefuse;
    }

    /**
     * Returns the chance of refusing an attribute usage. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse an attribute usage.
     */
    public getAttribRefuse(): number {
        return this.#attribRefuse;
    }

    /**
     * Returns the chance of refusing to trade. Affected by the willingness value.
     *
     * TODO Find out how this actually works.
     *
     * @returns The chance to refuse trading.
     */
    public getTradeRefuse(): number {
        return this.#tradeRefuse;
    }

    /**
     * @returns The string ID of the join message.
     */
    public getJoinMessageIndex(): number {
        return this.#joinMessageIndex;
    }

    /**
     * Returns the willingness to carry out a command.
     *
     * TODO Find out how this actually works.
     *
     * @returns The willingness to carry out a command.
     */
    public getWillingness(): number {
        return this.#willingness;
    }

    /**
     * @returns The rank name.
     */
    public getRank(): string {
        return this.#rank;
    }

    /**
     * @returns True if character has won the game, false if not.
     */
    public isGameWon(): boolean {
        return this.#gameWon;
    }

    /**
     * @returns True if character has received the special promotion, false if not.
     */
    public isSpecialPromotion(): boolean {
        return this.#specialPromotion;
    }

    /**
     * @returns The skill levels.
     */
    public getSkills(): SkillLevel[] {
        return this.#skills;
    }

    /**
     * @returns The list of carried items.
     */
    public getItems(): Item[] {
        return this.#items.slice();
    }
}
