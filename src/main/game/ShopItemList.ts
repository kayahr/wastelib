/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { BinaryReader } from "../io/BinaryReader.ts";
import { decodeRotatingXor } from "../io/xor.ts";
import { ShopItem } from "./ShopItem.ts";

/**
 * Shop item list.
 */
export class ShopItemList {
    /** The shop items */
    private readonly items: readonly ShopItem[];

    private constructor(array: Uint8Array, offset: number) {
        const reader = new BinaryReader(array, offset);

        // Read and validate the header
        const header = reader.readString(4);
        if (header !== "msq0" && header !== "msq1") {
            throw new Error(`Invalid shop item list header: ${header}`);
        }

        // Read/Decrypt the MSQ block
        const data = decodeRotatingXor(array, 8 * 95, offset + 4);
        const dataReader = new BinaryReader(data);

        // Skip first 8 bytes. They are always the same
        dataReader.skip(8);

        // Read the shop items
        const items: ShopItem[] = [];
        for (let i = 0; i < 94; i++) {
            items.push(new ShopItem(dataReader));
        }
        this.items = items;
    }

     /**
     * Reads shop item list from the given blob at given offset.
     *
     * @param blob   - The blob from which to read the shop item list (GAME1 or GAME2).
     * @param offset - The offset within the blob pointing the beginning of the MSQ block of the shop item list.
     * @returns The read shop item list.
     */
    public static async fromBlob(blob: Blob, offset: number): Promise<ShopItemList> {
        return new ShopItemList(new Uint8Array(await blob.arrayBuffer()), offset);
    }

    /**
     * @returns The list of shop items.
     */
    public getItems(): readonly ShopItem[] {
        return this.items;
    }
}
