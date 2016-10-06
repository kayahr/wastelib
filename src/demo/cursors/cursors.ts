import { Cursors } from "../../main/Cursors";

const fileSelector = <HTMLInputElement>document.getElementById("file");
const output = <HTMLDivElement>document.getElementById("output");

fileSelector.addEventListener("change", () => {
    const files = fileSelector.files;
    if (files && files.length === 1) {
        Cursors.fromFile(files[0]).then(cursors => {
            cursors.getCursors().forEach(cursor => {
                output.appendChild(cursor.toCanvas());
            });
        });
    }
});
