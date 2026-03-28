# String Control Bytes

This document describes the special bytes embedded in the executable string tables used by Wasteland 1.

## Escaped Representation

When documenting or debugging these strings it is useful to escape special bytes:

- `\r` means byte `0x0D`
- `\xNN` means a raw byte value such as `0x06` or `0x11`

Be careful with `\n`:

- byte `0x0A` often gets escaped as `\n`
- in these Wasteland strings it is usually **not** a line break
- the real line break byte is `0x0D`

## Plain Text Versus Control Bytes

For practical purposes the observed bytes fall into three groups:

- plain printable text
- control bytes that change formatting or dialog behavior
- placeholder bytes that insert dynamic content or select one of several text variants

Byte `0x7F` is not a placeholder. It behaves like a printable glyph from the custom game font.

## Confirmed Control Bytes

| Byte | Meaning | Notes |
| --- | --- | --- |
| `0x0D` | Line break | The real newline used in these strings |
| `0x0A` | Two-way text selector | Used for singular/plural style branches, not for line breaks |
| `0x0B` | Insert current name | Usually the current ranger, NPC, or combatant name |
| `0x0C` | Two-way gender selector | Used for forms such as `him/her` or `his/her` |
| `0x0E` | Three-way pronoun selector | Used for forms such as `he/she/it` |
| `0x0F` | Insert current numeric value | Used for damage, counts, adventure points, and similar values |
| `0x10` | Menu option marker | Marks one selectable entry in a choice list |
| `0x11` | Start of choice list | Appears before a sequence of `0x10` entries |
| `0x06` | Hard message break | Used where the UI stops and waits before continuing |

## Likely Formatting Bytes

These meanings are well supported by usage patterns, but the exact visual effect is not fully pinned down:

| Byte | Likely meaning | Notes |
| --- | --- | --- |
| `0x01` | Text attribute on | Used around short status labels such as `UNC`, `SER`, `CRT`, `MRT`, `COM` |
| `0x02` | Text attribute off | Usually closes the formatting started by `0x01` |
| `0x03` | Inline UI handoff | Used where a dynamic value, input field, or acknowledgement follows |
| `0x04` | Dialog style selector | Used at the start of many boxed prompts and list headers |
| `0x07` | Dialog style selector | Used at the start of many prompts, popups, and message pages |
| `0x08` | Input prompt continuation | Appears where the UI expects direct keyboard input next |

## Unused But Recognized Bytes

The string interpreter also recognizes at least these related control bytes even though they do not currently appear in the observed EXE string tables:

- `0x05`
- `0x09`

## Variant Selection Syntax

Several control bytes split a string into alternative text fragments.

### Two-Way Selector: `0x0A`

This is the most important one to understand.

It does not mean line break here.

Pattern:

```text
prefix 0x0A variantA 0x0A variantB 0x0A suffix
```

Typical use:

- singular versus plural
- verb endings such as `s` or `es` versus nothing

Examples:

```text
Animal\x0A\x0As\x0A
```

Results:

- singular: `Animal`
- plural: `Animals`

```text
miss\x0Aes\x0A\x0A.\r
```

Results:

- singular: `misses.`
- plural: `miss.`

### Two-Way Gender Selector: `0x0C`

Pattern:

```text
prefix 0x0C maleForm 0x0C femaleForm 0x0C suffix
```

Examples:

```text
h\x0Cim\x0Cer\x0C
```

Results:

- male: `him`
- female: `her`

### Three-Way Pronoun Selector: `0x0E`

Pattern:

```text
prefix 0x0E form1 0x0E form2 0x0E form3 0x0E suffix
```

Typical use:

- `he / she / it`
- `him / her / it`

Example:

```text
\x0Ehe\x0Eshe\x0Eit\x0E
```

Results:

- class 1: `he`
- class 2: `she`
- class 3: `it`

## Nested Selectors

Selectors can be nested.

Example:

```text
killing \x0A\x0Ehim\x0Eher\x0Eit\x0E\x0A\x0F of them\x0A
```

Interpretation:

- singular target: select `him`, `her`, or `it`
- plural target: insert a number and print `of them`

## Dynamic Placeholders

### Name Placeholder: `0x0B`

This inserts the current name from the active context.

Typical examples:

- `\x0B attacks `
- `\x0B is beyond help.`
- `\x0B has achieved the rank of `

Depending on the caller this can be:

- a ranger name
- an NPC name
- a monster or combatant name

### Numeric Placeholder: `0x0F`

This inserts a current numeric value from the active text context.

Typical examples:

- `hits \x0F `
- `You get \x0F adventure point...`
- `\x0F of them`

The exact source of the number depends on the caller, but semantically it is a dynamic integer slot.

## Dialog And Menu Formatting

### Choice Lists: `0x11` And `0x10`

Choice lists use a very regular structure:

```text
question\r\r\x11\x10Option 1\r\x10Option 2\r
```

Observed behavior:

- `0x11` starts the choice block
- each `0x10` introduces one selectable item

Typical examples:

- yes/no prompts
- action selection
- attribute selection
- shop buy/sell menus

### Message Break: `0x06`

This is used where the message flow stops and the UI hands control back to the player before continuing.

It appears:

- at the end of short popup messages
- between separate pages or paragraphs of longer messages

### Prompt Continuation: `0x08`

This appears in prompts where the next thing the player does is direct keyboard input.

Examples:

- direction prompts
- short command prompts
- prompts that display a dynamic numeric value and then keep the input line active

### Dialog Style Selectors: `0x04` And `0x07`

These bytes are formatting controls, not text.

They are commonly found at the beginning of strings such as:

- prompts
- boxed menu headers
- warning popups
- longer message pages

They clearly select different dialog or rendering modes, but this document intentionally focuses on the semantic role rather than the exact visual implementation.

## Text Attribute Bytes: `0x01` And `0x02`

These bytes wrap very short labels rather than prose text.

Examples:

```text
\x01UNC\x02
\x01SER\x02
\x01CRT\x02
\x01MRT\x02
\x01COM\x02
```

This strongly suggests:

- `0x01` enables a text attribute
- `0x02` disables it

The exact attribute is likely a highlight, inverse, or color change.
