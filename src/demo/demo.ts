/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Animation } from "../main/image/Animation.ts";
import { WebAssets } from "../main/io/WebAssets.ts";

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

// Mouse cursors as separate images
document.querySelector<HTMLButtonElement>("#cursors")!.addEventListener("click", async () => {
    const cursors = await assets.readCursors();
    output.innerHTML = "";
    cursors.getCursors().forEach(cursor => {
        output.appendChild(cursor.toImage());
    });
});

// Mouse cursors as single image (All in one row)
document.querySelector<HTMLButtonElement>("#cursors-map")!.addEventListener("click", async () => {
    const cursors = await assets.readCursors();
    output.innerHTML = "";
    output.appendChild(cursors.toImage());
});

// End animation
document.querySelector<HTMLButtonElement>("#end")!.addEventListener("click", async () => {
    const ending = await assets.readEnding();
    const image = ending.toImage();
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
        output.appendChild(char.toImage());
    });
});

// Font as single image (16 characters per row)
document.querySelector<HTMLButtonElement>("#font-map")!.addEventListener("click", async () => {
    const font = await assets.readFont();
    output.innerHTML = "";
    output.appendChild(font.toImage());
});

// Sprites as separate images
document.querySelector<HTMLButtonElement>("#sprites")!.addEventListener("click", async () => {
    const sprites = await assets.readSprites();
    output.innerHTML = "";
    sprites.getSprites().forEach(sprite => {
        output.appendChild(sprite.toImage());
    });
});

// Sprites as single image (All in one row)
document.querySelector<HTMLButtonElement>("#sprites-map")!.addEventListener("click", async () => {
    const sprites = await assets.readSprites();
    output.innerHTML = "";
    output.appendChild(sprites.toImage());
});

// Portraits
document.querySelector<HTMLButtonElement>("#portraits")!.addEventListener("click", async () => {
    const sprites = await assets.readPortraits();
    output.innerHTML = "";
    sprites.getPortraits().forEach(portrait => {
        const image = portrait.toImage();
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
    tilesets.getTilesets().forEach(tileset => {
        const h1 = document.createElement("h2");
        h1.innerHTML = `Tileset ${index++} (Disk ${tileset.getDisk()})`;
        output.appendChild(h1);
        tileset.getTiles().forEach(tile => {
            // Directly appending the canvas output instead of converting to images because creating all
            // these images is too slow
            output.appendChild(tile.toCanvas());
        });
    });
});

// Tilesets as separate images per tileset (16 tiles per row)
document.querySelector<HTMLButtonElement>("#tilesets-map")!.addEventListener("click", async () => {
    const tilesets = await assets.readTilesets();
    output.innerHTML = "";
    let index = 0;
    tilesets.getTilesets().forEach(tileset => {
        const h1 = document.createElement("h2");
        h1.innerHTML = `Tileset ${index++} (Disk ${tileset.getDisk()})`;
        output.appendChild(h1);
        output.appendChild(tileset.toImage());
    });
});

// Title image
document.querySelector<HTMLButtonElement>("#title")!.addEventListener("click", async () => {
    const title = await assets.readTitle();
    output.innerHTML = "";
    output.appendChild(title.toImage());
});
