# Mach VS Code Extension

Official editor support for the Mach programming language.

## About Mach

Mach is a statically typed, compiled systems language with explicit control over data layout and resource management. The language emphasizes:
- **Explicit control** - No implicit heap allocation, lifetime management, or type coercion
- **Predictable semantics** - Well-defined types and compile-time error checking
- **C interoperability** - Data layout and calling conventions align with the platform C ABI
- **Minimal core** - Small, orthogonal feature set that composes well

For the complete language specification, see `../mach/doc/language-spec.md`.

## Features
- Rich syntax highlighting kept in sync with the latest compiler keywords, intrinsics, and operators
- Support for modern Mach features including:
  - Records (`rec`) and unions (`uni`)
  - Generic types and functions with `<T>` syntax
  - Method definitions using `Type.method` syntax
  - Preprocessor directives (`#@if`, `#@or`, `#@end`, `#@symbol`)
  - Variadic functions and intrinsics
- Line comments with `#` including toggle/comment actions
- Bracket, brace, and quote auto-closing/surrounding pairs aligned with the Mach parser
- Language server integration offering hover, go-to-definition, references, and completion via `mach-lsp`
- Command palette actions to build, run, and debug Mach workspaces without leaving VS Code

## Getting Started
1. Install the extension from the Marketplace or load this workspace in VS Code
2. Open a `.mach` source file - syntax highlighting and comment toggling work out-of-the-box
3. Pair with the `cmach` compiler (bootstrap compiler) or future self-hosted compiler from the `mach` repository
4. Use the **Mach: Build Project**, **Mach: Run Project**, and **Mach: Debug Project** commands to work with your Mach projects

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
- Report syntax gaps or highlighting bugs in the [mach-vscode](https://github.com/octalide/mach-vscode) repository
- For language design issues, see the main [mach](https://github.com/octalide/mach) repository
- When publishing, remember to bump the version in `package.json` and run:

```bash
vsce publish [major|minor|patch]
```

The Mach language is under active development; changes may occur as the language evolves toward self-hosting.
