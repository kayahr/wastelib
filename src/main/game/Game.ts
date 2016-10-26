/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { BinaryReader } from "../io/BinaryReader";
import { MsqBlock } from "./MsqBlock";

function scanMsqBlocks(array: Uint8Array): MsqBlock[] {
    const blocks: MsqBlock[] = [];
    const reader = new BinaryReader(array);

    // Read first header to validate the file and get the disk number
    let offset = 0;
    let header = reader.readString(4);
    if (header !== "msq0" && header !== "msq1") {
        throw new Error("Invalid MSQ header: " + header);
    }
    let disk = header[3];
    let nextOffset = offset;
    offset = 4;

    // Read the rest of the file and scan for MSQ blocks.
    let stage = 0;
    while (reader.hasData()) {
        let b = reader.readChar();
        switch (stage) {
            case 0:
                stage = b === "m" ? 1 : 0;
                break;

            case 1:
                stage = b === "s" ? 2 : 0;
                break;

            case 2:
                stage = b === "q" ? 3 : 0;
                break;

            case 3:
                if (b === disk) {
                    blocks.push(new MsqBlock(nextOffset, offset - 3 - nextOffset));
                    nextOffset = offset - 3;
                }
                stage = 0;
                break;

            default:
        }
        ++offset;
    }
    return blocks;
}

/**
 * Container for the tilesets of the two allhtds files.
 */
export class Game {
    public static fromArray(array: Uint8Array): Game {
        const blocks = scanMsqBlocks(array);
        console.log(blocks);
        return new Game();
    }

    public static fromBlob(blob: Blob): Promise<Game> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.addEventListener("load", event => {
                    resolve(Game.fromArray(new Uint8Array(reader.result)));
                });
                reader.addEventListener("error", event => {
                    reject(new Error("Unable to read tilesets from blob: " + reader.error));
                });
                reader.readAsArrayBuffer(blob);
            } catch (e) {
                reject(e);
            }
        });
    }
}

import * as fs from "fs";

let data = fs.readFileSync("/home/k/.steam/steam/SteamApps/common/Wasteland/rom/data/GAME1");
Game.fromArray(data);
