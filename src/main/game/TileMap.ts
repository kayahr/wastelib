import { InputStream } from "../io/InputStream";
import { DataReader } from "../io/DataReader";

export class TileMap {
    private constructor() {
    }

    public static fromStream(stream: InputStream): TileMap {
        const reader = new DataReader(stream);
        const size = reader.readUint32();
        const mapSize = Math.sqrt(size);
        if (mapSize !== 64 && mapSize !== 32) {
            throw new Error("Invalid map size: " + mapSize);
        }
        return new TileMap();
    }
}
