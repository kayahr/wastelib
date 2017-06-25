/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { WebAssets, Animation, AnimationPlayer } from "../main/wastelib";

/**
 * Shows the installer panel and let the user select the Wasteland files. These selected files are then returned
 * and the panel is hidden again.
 *
 * @param filenames
 *            The names of the Wasteland files that need to be selected.
 * @return The Wasteland files selected by the user.
 */
function installer(filenames: string[]): Promise<File[]> {
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

function playAnimation(animation: Animation) {
    const playerDiv = document.createElement("div");
    let player: AnimationPlayer;
    playerDiv.id = "player";
    playerDiv.onclick = () => {
        player.stop();
        document.body.removeChild(playerDiv);
    };
    document.body.appendChild(playerDiv);

    const canvas = document.createElement("canvas");
    canvas.width = animation.getWidth();
    canvas.height = animation.getHeight();
    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    player = animation.createPlayer(frame => {
        frame.draw(ctx);
    });
    playerDiv.appendChild(canvas);
    player.start();

    playerDiv.appendChild(document.createTextNode("Click to stop animation"));

}

// Creates the web assets factory
WebAssets.create(installer).then(assets => {
    // Show the demo HTML elements
    (<HTMLElement>document.querySelector("#demo")).style.display = "block";

    // This is the output element used to show the various assets when the corresponding button is clicked.
    const output = <HTMLDivElement>document.querySelector("#output");

    // Mouse cursors as separate images
    (<HTMLButtonElement>document.querySelector("#cursors")).addEventListener("click", () => {
        assets.readCursors().then(cursors => {
            output.innerHTML = "";
            cursors.getCursors().forEach(cursor => {
                output.appendChild(cursor.toImage());
            });
        });
    });

    // Mouse cursors as single image (All in one row)
    (<HTMLButtonElement>document.querySelector("#cursors-map")).addEventListener("click", () => {
        assets.readCursors().then(cursors => {
            output.innerHTML = "";
            output.appendChild(cursors.toImage());
        });
    });

    // End animation
    (<HTMLButtonElement>document.querySelector("#end")).addEventListener("click", () => {
        assets.readEnding().then(ending => {
            const image = ending.toImage();
            image.onclick = () => {
                playAnimation(ending);
            };
            output.innerHTML = "";
            output.appendChild(image);
            output.appendChild(document.createElement("br"));
            output.appendChild(document.createTextNode("Click image to start animation"));
        });
    });

    // Font characters as separate images
    (<HTMLButtonElement>document.querySelector("#font")).addEventListener("click", () => {
        assets.readFont().then(font => {
            output.innerHTML = "";
            font.getChars().forEach(char => {
                output.appendChild(char.toImage());
            });
        });
    });

    // Font as single image (16 characters per row)
    (<HTMLButtonElement>document.querySelector("#font-map")).addEventListener("click", () => {
        assets.readFont().then(font => {
            output.innerHTML = "";
            output.appendChild(font.toImage());
        });
    });

    // Sprites as separate images
    (<HTMLButtonElement>document.querySelector("#sprites")).addEventListener("click", () => {
        assets.readSprites().then(sprites => {
            output.innerHTML = "";
            sprites.getSprites().forEach(sprite => {
                output.appendChild(sprite.toImage());
            });
        });
    });

    // Sprites as single image (All in one row)
    (<HTMLButtonElement>document.querySelector("#sprites-map")).addEventListener("click", () => {
        assets.readSprites().then(sprites => {
            output.innerHTML = "";
            output.appendChild(sprites.toImage());
        });
    });

    // Portraits
    (<HTMLButtonElement>document.querySelector("#portraits")).addEventListener("click", () => {
        assets.readPortraits().then(sprites => {
            output.innerHTML = "";
            sprites.getPortraits().forEach(portrait => {
                const image = portrait.toImage();
                image.onclick = () => {
                    playAnimation(portrait);
                };
                output.appendChild(image);
            });
            output.appendChild(document.createElement("br"));
            output.appendChild(document.createTextNode("Click image to start animation"));
        });
    });

    // Tilesets as separate tile images
    (<HTMLButtonElement>document.querySelector("#tilesets")).addEventListener("click", () => {
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
    (<HTMLButtonElement>document.querySelector("#tilesets-map")).addEventListener("click", () => {
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
    (<HTMLButtonElement>document.querySelector("#title")).addEventListener("click", () => {
        assets.readTitle().then(title => {
            output.innerHTML = "";
            output.appendChild(title.toImage());
        });
    });
});
