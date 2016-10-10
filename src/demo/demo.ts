/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { WebAssets } from "../main/WebAssets";

/**
 * Shows the installer panel and let the user select the Wasteland files. These selected files are then returned
 * and the panel is hidden again.
 *
 * @param filenames
 *            The names of the Wasteland files that need to be selected.
 * @return The Wasteland files selected by the user.
 */
function installer(filenames: string[]): Promise<File> {
    return new Promise((resolve, reject) => {
        const panel = <HTMLElement>document.querySelector("#installer");
        const filenameList = <HTMLElement>panel.querySelector(".filenames");
        filenameList.innerHTML = filenames.join(", ");
        const selector = <HTMLInputElement>panel.querySelector(".selector");
        panel.style.display = "block";
        selector.onchange = files => {
            panel.style.display = "";
            resolve(Array.prototype.slice.call(selector.files));
        };
    });
}

// Creates the web assets factory
WebAssets.create(installer).then(assets => {
    // Show the demo HTML elements
    (<HTMLElement>document.querySelector("#demo")).style.display = "block";

    // This is the output element used to show the various assets when the corresponding button is clicked.
    const output = document.querySelector("#output");

    // Mouse cursors as seperate images
    document.querySelector("#cursors").addEventListener("click", () => {
        assets.readCursors().then(cursors => {
            output.innerHTML = "";
            cursors.getCursors().forEach(cursor => {
                output.appendChild(cursor.toImage());
            });
        });
    });

    // Mouse cursors as single image (All in one row)
    document.querySelector("#cursors-map").addEventListener("click", () => {
        assets.readCursors().then(cursors => {
            output.innerHTML = "";
            output.appendChild(cursors.toImage());
        });
    });

    // Font characters as separate images
    document.querySelector("#font").addEventListener("click", () => {
        assets.readFont().then(font => {
            output.innerHTML = "";
            font.getChars().forEach(char => {
                output.appendChild(char.toImage());
            });
        });
    });

    // Font as single image (16 characters per row)
    document.querySelector("#font-map").addEventListener("click", () => {
        assets.readFont().then(font => {
            output.innerHTML = "";
            output.appendChild(font.toImage());
        });
    });

    // Sprites as seperate images
    document.querySelector("#sprites").addEventListener("click", () => {
        assets.readSprites().then(sprites => {
            output.innerHTML = "";
            sprites.getSprites().forEach(sprite => {
                output.appendChild(sprite.toImage());
            });
        });
    });

    // Sprites as single image (All in one row)
    document.querySelector("#sprites-map").addEventListener("click", () => {
        assets.readSprites().then(sprites => {
            output.innerHTML = "";
            output.appendChild(sprites.toImage());
        });
    });

    // Tilesets as separate tile images
    document.querySelector("#tilesets").addEventListener("click", () => {
        assets.readTilesets().then(tilesets => {
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
    });

    // Tilesets as separate images per tileset (16 tiles per row)
    document.querySelector("#tilesets-map").addEventListener("click", () => {
        assets.readTilesets().then(tilesets => {
            output.innerHTML = "";
            let index = 0;
            tilesets.getTilesets().forEach(tileset => {
                const h1 = document.createElement("h2");
                h1.innerHTML = `Tileset ${index++} (Disk ${tileset.getDisk()})`;
                output.appendChild(h1);
                output.appendChild(tileset.toImage());
            });
        });
    });

    // Title image
    document.querySelector("#title").addEventListener("click", () => {
        assets.readTitlePic().then(titlePic => {
            output.innerHTML = "";
            output.appendChild(titlePic.toImage());
        });
    });
});
