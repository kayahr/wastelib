# PARAGRAPHS.BIN Format

This document describes the `paragraphs.bin` file format used by the modernized Wasteland 1 release.

It covers:

- the generic image-record header
- the two observed pixel payload formats
- the zero-sized separator record
- the observed section layout of the shipped file
- the observed meaning of the individual records

## Scope

`paragraphs.bin` is not a text file.

It is a stream of image records stored one after another until end of file.

There is:

- no global file header
- no signature
- no version field
- no directory
- no compression wrapper

All multi-byte integer fields are little-endian.

Important detail:

- the per-record header stores only width and height
- it does not store the pixel format
- the payload size therefore depends on higher-level section context

When this document refers to image numbers, they are zero-based stream indices and include the zero-sized separator image at index `13`.

## Record Header

Every image record begins with the same 8-byte header:

| Offset | Type | Meaning |
| --- | --- | --- |
| `+0x00` | `u32` | Image width in pixels |
| `+0x04` | `u32` | Image height in pixels |

The header is immediately followed by the pixel payload and then optional padding to the next 4-byte boundary.

## Pixel Payload Formats

Two payload formats were observed in the shipped file.

### Grayscale Record

For grayscale records, the payload size is:

```text
pixelDataSize = width * height
pad           = (-pixelDataSize) & 3
recordSize    = 8 + pixelDataSize + pad
```

The pixels are stored as:

- 1 byte per pixel
- 8-bit grayscale intensity
- row-major order
- left-to-right within a row
- top-to-bottom across rows

### RGBA Record

For RGBA records, the payload size is:

```text
pixelDataSize = width * height * 4
recordSize    = 8 + pixelDataSize
```

Observed byte order is:

```text
R, G, B, A
```

Because the payload size is always a multiple of 4, RGBA records do not need extra padding.

## Zero-Sized Separator Record

A record with both dimensions set to zero has:

- `width = 0`
- `height = 0`
- no pixel payload
- no padding

So its total size is exactly `8` bytes:

```text
00 00 00 00 00 00 00 00
```

In the shipped file, this is image `13`.

It acts as a separator between the state-detection images and the paragraph-text images.

Whether it is an intentional marker record or simply a degenerate empty image is currently unknown.

## Observed File Layout

The shipped file at `20288180` bytes is laid out as follows:

| Image(s) | Offset | Meaning |
| --- | --- | --- |
| `0-12` | `0x00000000` | 13 grayscale state-detection images |
| `13` | `0x00000ED4` | Zero-sized separator image |
| `14-175` | `0x00000EDC` | 162 grayscale paragraph-text images |
| `176-177` | `0x0100B7EC` | 2 grayscale help-text images |
| `178-188` | `0x013109FC` | 11 RGBA UI images |
| EOF | `0x013592B4` | End of file |

So the whole file is a single record stream that ends exactly at EOF.

## State Detection

Images `0-12` are 13 grayscale images used for state detection.

Observed meaning:

- images `0-10` are template images used to detect that the game is asking the player to read a paragraph, for example `Read paragraph 84`
- image `11` is used to detect that the character info screen with the attributes is open; the modified DOSBox then shows an additional help button for Attributes and Personal Statistics
- image `12` is used to detect that the character skill list is open; the modified DOSBox then shows an additional help button for Skills

## Paragraph Texts

Immediately after the zero-sized separator comes the paragraph-text section at images `14-175`.

In the shipped file:

- there are `162` paragraph text images
- paragraph numbering is implied by image order
- all paragraph images are grayscale
- all paragraph images have a width of `640` pixels
- paragraph heights vary per image

Observed paragraph heights range from `40` to `1180` pixels. All observed heights are multiples of `20`.

## Help Texts

Images `176` and `177` are grayscale text images.

Like the paragraph text images, they are `640` pixels wide.

Observed meaning:

- image `176` contains the help text for Attributes and Personal Statistics
- image `177` contains the help text for Skills

## UI Images

Images `178-188` are RGBA UI images.

They are used to draw the extra help button and the dialog used to display the help texts, including the close button and the scroll buttons with hover effects.

The final UI image ends exactly at EOF.
