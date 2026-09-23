# Design foundation

Public name: JavaForge. The interface is a reading environment for a curriculum, not a marketing page and not a dashboard.

## Type

- Literata for titles and chapter prose. It is a text face built for long reading.
- Public Sans for navigation, labels, and metadata.
- JetBrains Mono for Java source.

Fonts are self-hosted. The browser uses the Latin files via `unicode-range`.

## Color

Ink on warm paper. One bronze accent for links and focus. Dark mode is the same hues, inverted, with brass for the accent so it stays readable.

| Token | Light | Dark |
|---|---|---|
| Background | `#f3efe6` | `#161310` |
| Surface | `#faf7f1` | `#1e1a16` |
| Surface elevated | `#fffdf8` | `#26211c` |
| Text | `#241c16` | `#f3ece3` |
| Text secondary | `#3d342c` | `#e4dcd2` |
| Muted | `#5c5348` | `#c8bfb3` |
| Border | `#ddd4c6` | `#3a332c` |
| Accent | `#6e3b24` | `#e2b48a` |
| Accent hover | `#542c1a` | `#f0d2b0` |
| Success | `#245c45` | `#9dcfb4` |
| Warning | `#8a4b12` | `#f0c089` |
| Error | `#8d2f2f` | `#f0b0a8` |
| Info | `#1d4e89` | `#b9d4f5` |
| Code background | `#efe8dc` | `#221e1a` |

Muted text is dark enough for body-sized type on the paper background. Meaning is not carried by color alone: the current section is underlined, and run mode is written out.

## Space, line, radius

Spacing follows a 1.25rem rhythm. Reading width is 68 characters. Corners stay square. Depth is a 1px rule, not a shadow. Code blocks scroll sideways on small screens and keep line numbers in a fixed column so the layout does not jump.

## Motion

Color and underline changes only. `prefers-reduced-motion: reduce` removes transitions and smooth scrolling.

## Navigation

Desktop: wordmark, Learn, Code, Projects, a search control labeled “Search JavaForge” with Ctrl K, the source repository, and the theme control. Mobile: the same header keeps Search and the theme control; a bottom bar has Home, Learn, Code, and Projects. Search opens a dialog. The index is not connected yet. Targets are at least 44px. Focus is a 2px outline.

## Mark

The symbol is a J-shaped stroke with three nodes: source, bytecode, run. It is an SVG, one color, used in the header and favicon. It is not the Java coffee-cup logo.
