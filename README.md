# Mach VS Code Extension

Official editor support for the Mach programming language.

## About Mach

Mach is a statically typed, compiled systems language with explicit control over data layout and resource management. The language emphasizes:
- **Explicit control** - No implicit heap allocation, lifetime management, or type coercion
- **Predictable semantics** - Well-defined types and compile-time error checking
- **C interoperability** - Data layout and calling conventions align with the platform C ABI
- **Minimal core** - Small, orthogonal feature set that composes well

For the complete language specification, see the `doc/language/` directory in the [mach](https://github.com/briar-systems/mach) repository (`grammar.md` is the authoritative syntax reference).

## Features
- Syntax highlighting kept in sync with the current compiler keywords, intrinsics, and operators
- Support for current Mach syntax including:
  - Records (`rec`) and unions (`uni`)
  - Generic types and functions with `[T]` bracket syntax
  - Method definitions using `Type.method` syntax
  - Comptime directives and `$if`/`$or` chains, `$`-intrinsics (`$size_of`, `$assert`, ...), and `$mach.*` reads
  - Value (`::`) and bit-reinterpret (`:~`) casts, address-of (`?`) / dereference (`@`) operators
  - Inline assembly blocks (`asm <isa> { ... }`)
  - Variadic functions (`...`)
- Line comments with `#` including toggle/comment actions
- Bracket, brace, and quote auto-closing/surrounding pairs aligned with the Mach parser

## Getting Started
1. Install the extension from the Marketplace or install a packaged `.vsix` in VS Code
2. Open a `.mach` source file - syntax highlighting and comment toggling work out-of-the-box
3. Pair with the `mach` compiler from the [mach](https://github.com/briar-systems/mach) repository

## Contributing
- Report syntax gaps or highlighting bugs in the [mach-vscode](https://github.com/briar-systems/mach-vscode) repository
- For language design issues, see the main [mach](https://github.com/briar-systems/mach) repository
- When publishing, remember to bump the version in `package.json` and run:

```bash
npx @vscode/vsce publish
```

The Mach language is under active development; changes may occur as the language evolves toward self-hosting.
