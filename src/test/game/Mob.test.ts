/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals } from "@kayahr/assert";
import { BinaryReader } from "../../main/io/BinaryReader.ts";
import { Mob } from "../../main/game/Mob.ts";
import { ItemType } from "../../main/game/ItemType.ts";
import { MobType } from "../../main/game/MobType.ts";

function readMob(bytes: number[]): Mob {
    return Mob.read(new BinaryReader(Uint8Array.from(bytes)), "Test Mob");
}

function withMockedRandom<T>(values: number[], fn: () => T): T {
    const originalRandom = Math.random;
    let index = 0;
    Math.random = () => values[index++] ?? 0;
    try {
        return fn();
    } finally {
        Math.random = originalRandom;
    }
}

describe("Mob", () => {
    describe("hit points", () => {
        it("derives min and max hit points from sturdiness byte-wise", () => {
            const mob = readMob([0x34, 0x12, 0x07, 0x08, 0x56, 0x72, 0x03, 0x09]);
            assertEquals(mob.getSturdiness(), 0x1234);
            assertEquals(mob.getMinHitPoints(), (0x1234 >> 2) + 0x101);
            assertEquals(mob.getMaxHitPoints(), (0x1234 >> 2) + 0x1234);
        });
        it("rolls hit points with the same byte-wise rnd logic as the game", () => {
            const mob = readMob([0x03, 0x12, 0x07, 0x08, 0x56, 0x72, 0x03, 0x09]);
            assertEquals(withMockedRandom([0.8, 0.1], () => mob.rollHitPoints()), (0x1203 >> 2) + 0x0203);
        });
        it("uses deterministic rnd behavior for zero and one bytes", () => {
            assertEquals(withMockedRandom([0.99], () => readMob([0x00, 0x00, 0, 0, 0, 0, 0, 0]).rollHitPoints()), 0);
            assertEquals(withMockedRandom([0.99], () => readMob([0x01, 0x00, 0, 0, 0, 0, 0, 0]).rollHitPoints()), 1);
            assertEquals(withMockedRandom([0.99], () => readMob([0x00, 0x01, 0, 0, 0, 0, 0, 0]).rollHitPoints()), 0x140);
        });
        it("treats zero and one sturdiness bytes as deterministic rnd values", () => {
            assertEquals(readMob([0x00, 0x00, 0, 0, 0, 0, 0, 0]).getMinHitPoints(), 0);
            assertEquals(readMob([0x00, 0x00, 0, 0, 0, 0, 0, 0]).getMaxHitPoints(), 0);
            assertEquals(readMob([0x01, 0x00, 0, 0, 0, 0, 0, 0]).getMinHitPoints(), 1);
            assertEquals(readMob([0x01, 0x00, 0, 0, 0, 0, 0, 0]).getMaxHitPoints(), 1);
            assertEquals(readMob([0x00, 0x01, 0, 0, 0, 0, 0, 0]).getMinHitPoints(), 0x140);
            assertEquals(readMob([0x00, 0x01, 0, 0, 0, 0, 0, 0]).getMaxHitPoints(), 0x140);
        });
    });
    describe("combat stats", () => {
        it("reads mob data and derives experience from sturdiness and armor class", () => {
            const mob = readMob([0x34, 0x12, 0x07, 0x08, 0x56, 0x72, 0x03, 0x09]);
            assertEquals(mob.getCombatRating(), 0x07);
            assertEquals(mob.getRandomDamage(), 0x08);
            assertEquals(mob.getMaxGroupSize(), 0x05);
            assertEquals(mob.getArmorClass(), 0x06);
            assertEquals(mob.getFixedDamage(), 0x07);
            assertEquals(mob.getWeaponType(), ItemType.SHORT_RANGE_WEAPON);
            assertEquals(mob.getMobType(), MobType.HUMANOID);
            assertEquals(mob.getPortrait(), 0x09);
            assertEquals(mob.getExperience(), 0x1234 * 7);
        });
    });
});
