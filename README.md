# Mach VS Code Extension

Official editor support for the Mach programming language while it stabilises.

## Features
- Rich syntax highlighting kept in sync with the latest compiler keywords, intrinsics, and operators.
- Line comments with `#` including toggle/comment actions.
- Bracket, brace, and quote auto-closing/surrounding pairs aligned with the Mach parser.
- Basic function/type/constant highlighting for declarations and built-in aliases.

More advanced language services (hover, go-to-definition, formatting, etc.) are planned as the compiler API matures.

## Getting Started
1. Install the extension from the Marketplace or load this workspace in VS Code.
2. Open a `.mach` source file. Highlighting and comment toggling work out-of-the-box.
3. Pair with the `cmach` toolchain from `mach-c` for builds and diagnostics.

## Language server integration

The extension now launches the experimental `mach-lsp` server on demand.

1. Build the sibling repository:
	```bash
	cd ../mach-lsp
	make
	```
2. Open this `mach-vscode` folder in VS Code and launch the extension (F5) or install it from a packaged `.vsix`.
3. The extension looks for `../mach-lsp/out/bin/mach-lsp` by default. Override the binary path via the `mach.lspPath` setting if you keep the server elsewhere.
4. Use the **Mach: Restart Language Server** command from the palette after rebuilding the server.

Set `mach.trace.server` to `verbose` in user settings to inspect the JSON-RPC traffic while debugging the language server.

## Contributing
- Report syntax gaps or highlighting bugs in the [mach-c](https://github.com/octalide/mach-c) tracker.
- When publishing, remember to bump the version in `package.json` and run:

```bash
vsce publish [major|minor|patch]
```

This project is pre-release software; breaking grammar changes may occur as the language evolves.
