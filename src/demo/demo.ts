/*
 * Copyright (c) 2016 Klaus Reimer
 * SPDX-License-Identifier: MIT
 */

import type { Animation } from "../main/image/Animation.ts";
import { WebAssets } from "./WebAssets.ts";
import type { ToCanvas } from "../main/wastelib.ts";
import { getCanvasContext2D } from "../main/sys/canvas.ts";

// oxlint-disable typescript/strict-void-return

/**
 * Shows the installer panel and let the user select the Wasteland files. These selected files are then returned
 * and the panel is hidden again.
 *
 * @param filenames
 *            The names of the Wasteland files that need to be selected.
 * @returns The Wasteland files selected by the user.
 */
function installer(filenames: string[]): Promise<File[]> {
    return new Promise((resolve, reject) => {
        const panel = document.querySelector<HTMLElement>("#installer")!;
        const filenameList = panel.querySelector<HTMLElement>(".filenames")!;
        filenameList.innerHTML = filenames.join(", ");
        const selector = panel.querySelector<HTMLInputElement>(".selector")!;
        panel.style.display = "block";
        selector.addEventListener("change", files => {
            panel.style.display = "";
            resolve(Array.from(selector.files ?? []));
        });
    });
}

function playAnimation(animation: Animation): void {
    const playerDiv = document.createElement("div");
    playerDiv.id = "player";
    playerDiv.addEventListener("click", () => {
        player.stop();
        document.body.removeChild(playerDiv);
    });
    document.body.appendChild(playerDiv);

    const canvas = document.createElement("canvas");
    canvas.width = animation.getWidth();
    canvas.height = animation.getHeight();
    const ctx = canvas.getContext("2d")!;
    const player = animation.createPlayer(frame => {
        frame.draw(ctx);
    });
    playerDiv.appendChild(canvas);
    player.start();

    playerDiv.appendChild(document.createTextNode("Click to stop animation"));
}

// Creates the web assets factory
const assets = await WebAssets.create(installer);

// Show the demo HTML elements
document.querySelector<HTMLElement>("#demo")!.style.display = "block";

// This is the output element used to show the various assets when the corresponding button is clicked.
const output = document.querySelector<HTMLDivElement>("#output")!;

function createImage(pic: ToCanvas): HTMLImageElement {
    const image = new Image();
    image.src = pic.toCanvas(document.createElement("canvas")).toDataURL();
    return image;
}

// Mouse cursors as separate images
document.querySelector<HTMLButtonElement>("#cursors")!.addEventListener("click", async () => {
    const cursors = await assets.readCursors();
    output.innerHTML = "";
    Array.from(cursors).forEach(cursor => {
        output.appendChild(createImage(cursor));
    });
});

// End animation
document.querySelector<HTMLButtonElement>("#end")!.addEventListener("click", async () => {
    const ending = await assets.readEnding();
    const image = createImage(ending);
    image.addEventListener("click", () => {
        playAnimation(ending);
    });
    output.innerHTML = "";
    output.appendChild(image);
    output.appendChild(document.createElement("br"));
    output.appendChild(document.createTextNode("Click image to start animation"));
});

// Font characters as separate images
document.querySelector<HTMLButtonElement>("#font")!.addEventListener("click", async () => {
    const font = await assets.readFont();
    output.innerHTML = "";
    font.getChars().forEach(char => {
        output.appendChild(createImage(char));
    });
});

// Font as single image (16 characters per row)
document.querySelector<HTMLButtonElement>("#font-map")!.addEventListener("click", async () => {
    const font = await assets.readFont();
    output.innerHTML = "";
    output.appendChild(createImage(font));
});

// Sprites as separate images
document.querySelector<HTMLButtonElement>("#sprites")!.addEventListener("click", async () => {
    const sprites = await assets.readSprites();
    output.innerHTML = "";
    Array.from(sprites).forEach(sprite => {
        output.appendChild(createImage(sprite));
    });
});

// Portraits
document.querySelector<HTMLButtonElement>("#portraits")!.addEventListener("click", async () => {
    const sprites = await assets.readPortraits();
    output.innerHTML = "";
    sprites.getPortraits().forEach(portrait => {
        const image = createImage(portrait);
        image.addEventListener("click", () => {
            playAnimation(portrait);
        });
        output.appendChild(image);
    });
    output.appendChild(document.createElement("br"));
    output.appendChild(document.createTextNode("Click image to start animation"));
});

// Tilesets as separate tile images
document.querySelector<HTMLButtonElement>("#tilesets")!.addEventListener("click", async () => {
    const tilesets = await assets.readTilesets();
    output.innerHTML = "";
    let index = 0;
    Array.from(tilesets).forEach(tileset => {
        const h1 = document.createElement("h2");
        h1.innerHTML = `Tileset ${index++} (Disk ${tileset.getDisk()})`;
        output.appendChild(h1);
        Array.from(tileset).forEach(tile => {
            // Directly appending the canvas output instead of converting to images because creating all
            // these images is too slow
            output.appendChild(tile.toCanvas(document.createElement("canvas")));
        });
    });
});

// Title image
document.querySelector<HTMLButtonElement>("#title")!.addEventListener("click", async () => {
    const title = await assets.readTitle();
    output.innerHTML = "";
    output.appendChild(createImage(title));
});

// Maps
document.querySelector<HTMLButtonElement>("#maps")!.addEventListener("click", async () => {
    const sprites = await assets.readSprites();
    output.innerHTML = "";
    for (let location = 0; location < 50; location++) {
        if (location === 14 || location === 30 || location === 37 || location >= 44 && location <= 48) {
            continue;
        }
        const map = await assets.readMap(location);
        const info = map.getInfo();
        const tilesets = await assets.readTilesets();
        const tileset = tilesets.getTileset(info.getTileset());
        const size = info.getMapSize();
        const canvas = document.createElement("canvas");
        const tileWidth = tileset.getTile(0).getWidth();
        const tileHeight = tileset.getTile(0).getHeight();
        canvas.width = size * tileWidth;
        canvas.height = size * tileHeight;
        const ctx = getCanvasContext2D(canvas);
        const h1 = document.createElement("h2");
        h1.innerHTML = `Location ${location}`;
        output.appendChild(h1);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const tile = map.getTile(x, y);
                const tileImageIndex = tile.getImage();
                const tileImage = tileImageIndex < 10
                    ? sprites.getSprite(tileImageIndex)
                    : tileset.getTile(tileImageIndex - 10);
                tileImage.draw(ctx, x * tileWidth, y * tileHeight);
            }
        }
        output.appendChild(canvas);
    }
});
