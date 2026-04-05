/*
 * Copyright (c) 2026 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import { assertEquals } from "@kayahr/assert";
import * as exports from "../main/wastelib.ts";

import { Cursor } from "../main/cursor/Cursor.ts";
import { Cursors } from "../main/cursor/Cursors.ts";
import { Ending } from "../main/ending/Ending.ts";
import { EndingFrame } from "../main/ending/EndingFrame.ts";
import { EndingPatch } from "../main/ending/EndingPatch.ts";
import { EndingPlayer } from "../main/ending/EndingPlayer.ts";
import { EndingUpdate } from "../main/ending/EndingUpdate.ts";
import { Exe } from "../main/exe/Exe.ts";
import { Skill } from "../main/exe/Skill.ts";
import { Font } from "../main/font/Font.ts";
import { FontChar } from "../main/font/FontChar.ts";
import { BlockedAction } from "../main/game/actions/BlockedAction.ts";
import { CheckAction } from "../main/game/actions/CheckAction.ts";
import { EncounterAction } from "../main/game/actions/EncounterAction.ts";
import { MaskAction } from "../main/game/actions/MaskAction.ts";
import { PrintAction } from "../main/game/actions/PrintAction.ts";
import { TransitionAction } from "../main/game/actions/TransitionAction.ts";
import { Action } from "../main/game/Action.ts";
import { Actions } from "../main/game/Actions.ts";
import { ActionClass } from "../main/game/ActionClass.ts";
import { Character } from "../main/game/Character.ts";
import { Check } from "../main/game/Check.ts";
import { CheckType } from "../main/game/CheckType.ts";
import { Gender } from "../main/game/Gender.ts";
import { Item } from "../main/game/Item.ts";
import { GameMap } from "../main/game/GameMap.ts";
import { MapInfo } from "../main/game/MapInfo.ts";
import { MapTile } from "../main/game/MapTile.ts";
import { Mob } from "../main/game/Mob.ts";
import { MobType } from "../main/game/MobType.ts";
import { Nationality } from "../main/game/Nationality.ts";
import { PartyGroup, type PartyOrder } from "../main/game/PartyGroup.ts";
import { type Party, type PartyGroups, Savegame } from "../main/game/Savegame.ts";
import { ShopItem } from "../main/game/ShopItem.ts";
import { ShopItemList } from "../main/game/ShopItemList.ts";
import { ItemType } from "../main/game/ItemType.ts";
import { SkillLevel } from "../main/game/SkillLevel.ts";
import { BaseAnimationPlayer } from "../main/image/BaseAnimationPlayer.ts";
import type { Animation } from "../main/image/Animation.ts";
import type { AnimationPlayer } from "../main/image/AnimationPlayer.ts";
import { BaseImage } from "../main/image/BaseImage.ts";
import { PicImage } from "../main/image/PicImage.ts";
import type { FileHandleLike, FileReadResultLike } from "../main/io/FileHandleLike.ts";
import { readParagraphs } from "../main/paragraphs/paragraphs.ts";
import { Portrait } from "../main/portrait/Portrait.ts";
import { PortraitFrame } from "../main/portrait/PortraitFrame.ts";
import { PortraitPatch } from "../main/portrait/PortraitPatch.ts";
import { PortraitPlayer } from "../main/portrait/PortraitPlayer.ts";
import { Portraits } from "../main/portrait/Portraits.ts";
import { PortraitScript } from "../main/portrait/PortraitScript.ts";
import { PortraitScriptLine } from "../main/portrait/PortraitScriptLine.ts";
import { PortraitUpdate } from "../main/portrait/PortraitUpdate.ts";
import { Sprite } from "../main/sprite/Sprite.ts";
import { Sprites } from "../main/sprite/Sprites.ts";
import type { CanvasContext2DLike, CanvasLike, ImageDataLike, ToCanvas } from "../main/sys/canvas.ts";
import { Tile } from "../main/tile/Tile.ts";
import { Tileset } from "../main/tile/Tileset.ts";
import { Tilesets } from "../main/tile/Tilesets.ts";
import { Title } from "../main/title/Title.ts";

describe("wastelib", () => {
    it("exports relevant types and functions and nothing more", () => {
        // Checks if runtime includes the expected exports and nothing else
        assertEquals({ ...exports }, {
            Cursor,
            Cursors,
            Ending,
            EndingFrame,
            EndingPatch,
            EndingPlayer,
            EndingUpdate,
            Exe,
            Skill,
            Font,
            FontChar,
            PrintAction,
            EncounterAction,
            BlockedAction,
            CheckAction,
            MaskAction,
            TransitionAction,
            Action,
            Actions,
            ActionClass,
            Character,
            Check,
            CheckType,
            Gender,
            Item,
            GameMap,
            MapInfo,
            MapTile,
            Mob,
            MobType,
            Nationality,
            PartyGroup,
            Savegame,
            ShopItem,
            ShopItemList,
            ItemType,
            SkillLevel,
            BaseAnimationPlayer,
            BaseImage,
            PicImage,
            Portrait,
            PortraitFrame,
            PortraitPatch,
            PortraitPlayer,
            Portraits,
            PortraitScript,
            PortraitScriptLine,
            PortraitUpdate,
            Sprite,
            Sprites,
            Tile,
            Tileset,
            Tilesets,
            Title,
            readParagraphs
        });

        // Interfaces and types can only be checked by TypeScript
        ((): PartyOrder => (({} as exports.PartyOrder)))();
        ((): PartyGroups => (({} as exports.PartyGroups)))();
        ((): Party => (({} as exports.Party)))();
        ((): Animation => (({} as exports.Animation)))();
        ((): AnimationPlayer => (({} as exports.AnimationPlayer)))();
        ((): ImageDataLike => (({} as exports.ImageDataLike)))();
        ((): ToCanvas => (({} as exports.ToCanvas)))();
        ((): CanvasLike => (({} as exports.CanvasLike)))();
        ((): CanvasContext2DLike => (({} as exports.CanvasContext2DLike)))();
        ((): FileHandleLike => (({} as exports.FileHandleLike)))();
        ((): FileReadResultLike => (({} as exports.FileReadResultLike)))();
    });
});
