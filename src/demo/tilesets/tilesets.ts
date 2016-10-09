import { Tilesets } from "../../main/Tilesets";

const fileSelector = <HTMLInputElement>document.getElementById("file");
const output = <HTMLDivElement>document.getElementById("output");

fileSelector.addEventListener("change", () => {
    const tilesetImage = (<HTMLInputElement>document.getElementById("singleTiles")).checked;
    const files = fileSelector.files;
    if (files) {
        Array.prototype.slice.call(files).sort((a: File, b: File) => a.name < b.name).forEach((file: File) => {
            Tilesets.fromFile(file).then(tilesets => {
                tilesets.getTilesets().forEach(tileset => {
                    if (tilesetImage) {
                        output.appendChild(tileset.toImage());
                    } else {
                        tileset.getTiles().forEach(tile => {
                            output.appendChild(tile.toImage());
                        });
                    }
                });
            });
        });
    }
});
