import { BinaryReader } from "./BinaryReader";

function readDictionary(reader: BinaryReader): string {
    return reader.readString(60);
}

function readPointers(reader: BinaryReader): number[] {
    const pointers: number[] = [];
    let pointer = reader.readUint16();
    pointers.push(pointer);
    let numPointers = pointer >> 1;
    for (let i = 1; i < numPointers; ++i) {
        pointer = reader.readUint16();
        if (pointer >= reader.getSize() - 60) {
            continue;
        }
        pointers.push(pointer);
        numPointers = Math.min(numPointers, pointer >> 1);
    }
    return pointers;
}

function decodeStringGroup(dictionary: string, reader: BinaryReader): string[] {
    let upper = false;
    let high = false;
    let stringGroup: string[] = [];
    let string = "";
    while (reader.hasData(5) && stringGroup.length < 4) {
        const index = reader.readBits(5, true);
        switch (index) {
            case 0x1f:
                high = true;
                break;

            case 0x1e:
                upper = true;
                break;

            default:
                const char = dictionary.charAt(index + (high ? 0x1e : 0));
                if (char === "\0") {
                    stringGroup.push(string);
                    string = "";
                    break;
                }
                string += upper ? char.toUpperCase() : char;
                upper = false;
                high = false;
        }
    }
    return stringGroup;
}

export function decodeStringGroups(data: Uint8Array, offset: number, size: number): Array<Array<string>> {
    const reader = new BinaryReader(data, offset, size);
    const dictionary = readDictionary(reader);
    const pointers = readPointers(reader);
    return pointers.map(pointer => decodeStringGroup(dictionary, reader.seek(offset + 60 + pointer)));
}
