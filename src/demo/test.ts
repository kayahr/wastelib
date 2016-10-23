/*
 * Copyright (C) 2016 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { WebAssets, PortraitPlayer } from "../main/wastelib";

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

// Creates the web assets factory
WebAssets.create(installer).then(assets => {
    const output = <HTMLCanvasElement>document.querySelector("#output");
    const ctx = <CanvasRenderingContext2D>output.getContext("2d");

    // Mouse cursors as separate images
    assets.readPortraits().then(portraits => {
        const player = new PortraitPlayer(portraits.getPortrait(8), frame => frame.draw(ctx));
        (<any>window).player = player;
        player.start();
    });
});
