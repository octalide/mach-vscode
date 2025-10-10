# Mach VS Code Extension

Official editor support for the Mach programming language while it stabilises.

## Features
- Rich syntax highlighting kept in sync with the latest compiler keywords, intrinsics, and operators.
- Line comments with `#` including toggle/comment actions.
- Bracket, brace, and quote auto-closing/surrounding pairs aligned with the Mach parser.
- Language server integration offering hover, go-to-definition, references, and completion via `mach-lsp`.
- Command palette actions to build, run, and debug Mach workspaces without leaving VS Code.

## Getting Started
1. Install the extension from the Marketplace or load this workspace in VS Code.
2. Open a `.mach` source file. Highlighting and comment toggling work out-of-the-box.
3. Pair with the `cmach` toolchain from `mach-c` for builds and diagnostics.
4. Use the **Mach: Build Project**, **Mach: Run Project**, and **Mach: Debug Project** commands to drive the active workspace.

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

### Build, run, and debug settings

All commands use the workspace root as their working directory and can be tuned through the following settings:

- `mach.buildCommand` (default `make`) – shell command invoked by **Mach: Build Project**.
- `mach.runCommand` (default `make run`) – shell command invoked by **Mach: Run Project** inside a fresh terminal.
- `mach.debug.preLaunchBuild` (default `true`) – run the build command automatically before debugging.
- `mach.debug.program` (default `out/bin/app`) – relative path to the executable launched by **Mach: Debug Project**.
- `mach.debug.adapter` (default `cppdbg`) – debugger integration: choose between `cppdbg`, `codelldb`, or a terminal-based `gdb` session.
- `mach.debug.gdbPath` (default `gdb`) – debugger executable used for the `cppdbg` session.

## Contributing
- Report syntax gaps or highlighting bugs in the [mach-c](https://github.com/octalide/mach-c) tracker.
- When publishing, remember to bump the version in `package.json` and run:

```bash
vsce publish [major|minor|patch]
```

This project is pre-release software; breaking grammar changes may occur as the language evolves.
