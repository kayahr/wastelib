/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 *
 * This file provides a function used to unpack the WL.EXE file. It is based on
 * [unexepack.c](https://sourceforge.net/p/openkb/code/ci/master/tree/src/tools/unexecomp.c) written by
 * Vitaly Driedfruit.
 */

import { unpackExe } from "./exepack";
import { decodeHuffman } from "../io/huffman";
import { decodeStringGroups } from "../io/string";
import { BinaryReader } from "../io/BinaryReader";

export class Exe {
    private readonly data: Uint8Array;

    private constructor(data: Uint8Array) {
        this.data = data;
    }

    public static fromArray(data: Uint8Array): Exe {
        return new Exe(unpackExe(data));
    }

    public getString(offset: number): string {
        let i = offset;
        let value: number;
        const data = this.data;
        let result = "";
        while (i < data.length && (value = data[i++]) !== 0) {
            result += String.fromCharCode(value);
        }
        return result;
    }

    public getIntroStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x17723, 527);
    }

    public findBestSize(offset: number, skip: number): number {
        const ref = decodeStringGroups(this.data, offset, 10000);
        while (skip--) {
            let group = ref[ref.length - 1];
            group.pop();
            if (!group.length) {
                ref.pop();
            }
        }
        const refJSON = JSON.stringify(ref);
        for (let i = 0; i < 10000; i++) {
            try {
                const test = decodeStringGroups(this.data, offset, i);
                const testJSON = JSON.stringify(test);
                if (testJSON === refJSON) {
                    return i;
                }
            } catch (e) {
            }
        }
        throw new Error("max size too large?");
    }

    public getMessageStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x17b5e, 1661);
    }

    public getInventoryStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x18290, 1847);
    }

    public getCreateCharacterStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x19e6b, 210);
    }

    public getPromotionStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x1a642, 1136);
    }

    public getLibraryStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x1aaec, 277);
    }

    public getShopStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x1ac18, 229);
    }

    public getInfirmaryStrings(): Array<Array<string>> {
        return decodeStringGroups(this.data, 0x1ad0d, 369);
    }
}

import * as fs from "fs";
const file = fs.readFileSync("/home/k/.steam/steam/SteamApps/common/Wasteland/rom/WL.EXE");
const exe = Exe.fromArray(file);
console.log(exe.getInfirmaryStrings());
//console.log(exe.findBestSize(0x1ad0d, 3));
