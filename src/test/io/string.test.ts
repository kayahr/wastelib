/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals } from "@kayahr/assert";
import { readStrings } from "../../main/io/string.ts";
import { BinaryReader } from "../../main/wastelib.ts";

describe("string", () => {
    describe("readStrings", () => {
        it("ignores incomplete strings when reader runs out of data", () => {
            const dictionary = Uint8Array.from(`a\0${"b".repeat(58)}`, char => char.charCodeAt(0));
            const data = new Uint8Array([
                ...dictionary,
                0x02, 0x00,
                0x20, 0x00
            ]);

            assertEquals(readStrings(new BinaryReader(data)), ["a"]);
        });
    });
});
