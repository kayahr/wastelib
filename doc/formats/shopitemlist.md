# Shop Item List Format

This document describes the shop item list block format used inside the Wasteland 1 `GAME1` and `GAME2` files.

It covers:

- how shop lists are located
- the outer block structure
- the rotating-XOR decoded payload
- the shop-item record layout

## Scope

Shop item lists are not self-describing.

The game uses executable metadata from the executable to locate them.

See [EXE Format](exe.md) for the structure and locations of those tables.

In the shipped Wasteland 1 data:

- `GAME1` contains three actual shop item list blocks
- `GAME2` contains one actual shop item list block
- the fourth `GAME1` shop slot used by the executable tables points to the end of `GAME1` and no block exists there

Observed offsets in the shipped files:

- `GAME1`: `157131`, `157897`, `158663`
- `GAME2`: `171469`

All multi-byte integer fields are little-endian.

The rotating-XOR algorithm used by the encrypted payload is documented separately:

- [Rotating-XOR](rotating-xor.md)

## Outer Block Layout

Each shop list block is fixed-size and begins with:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `char[4]` | `"msq0"` in `GAME1`, `"msq1"` in `GAME2` |
| `+0x04` | `u8` | XOR byte 1 |
| `+0x05` | `u8` | XOR byte 2 |
| `+0x06` | `u8[760]` | Rotating-XOR encrypted payload |

Total block size:

```text
4 + 2 + 760 = 766 bytes = 0x2FE
```

This fixed size matches the spacing of the real shop blocks in `GAME1` and the final block length in `GAME2`.

## Rotating-XOR Decoding

The `760`-byte payload uses the fixed-length variant described in [Rotating-XOR](rotating-xor.md).

Decode exactly `760` bytes after the two XOR bytes and verify that the final checksum equals `endChecksum`.

## Decoded Payload Layout

The decoded shop-list payload is:

| Offset | Size | Meaning |
| --- | --- | --- |
| `0x000` | `8` | Fixed header bytes |
| `0x008` | `94 * 8` | Shop item records |

The fixed decoded header bytes are identical across all real shop lists examined:

```text
60 60 60 00 37 08 F8 39
```

Their purpose is currently unknown.

## Shop Item Record

Each shop item record is `8` bytes long:

| Offset within record | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u16` | Price |
| `+0x02` | `u8` | Stock |
| `+0x03` | `u8` | Packed type/flags byte |
| `+0x04` | `u8` | Capacity |
| `+0x05` | `u8` | Skill |
| `+0x06` | `u8` | Damage |
| `+0x07` | `u8` | Ammo item ID |

### Packed Type/Flags Byte

The byte at offset `+0x03` is interpreted as:

```text
itemType   = byte >> 3
lowFlags   = byte & 0x07
```

Observed semantics in the shipped data:

- the upper 5 bits store the item type ID
- the low bits act as a demolition flag
- only values `0` and `1` were observed in the low 3 bits across all real shop entries

So the currently understood interpretation is:

```text
demolition = (lowFlags == 1)
```

with other low-bit combinations currently undocumented.

## Record Count

Every real shop list examined contains exactly `94` records:

```text
760 decoded bytes = 8-byte header + 94 * 8-byte items
```

Unused entries still occupy their full 8-byte slots.

## Validation Notes

Useful consistency checks when implementing a reader:

- the block must begin with `"msq0"` or `"msq1"`
- the total block size should be `0x2FE` bytes
- rotating-XOR decoding must produce exactly `760` bytes
- the first 8 decoded bytes should match `60 60 60 00 37 08 F8 39`
- the decoded payload should contain exactly `94` item records
