# Change Log

All notable changes to the "mach-vscode" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
- Updated syntax grammar to match current Mach keywords, intrinsics, literals, and operators.
- Documented available editor features in the README.
- Command palette entries for building, running, and debugging Mach workspaces.
- Configuration knobs for build/run/debug tooling and debugger integration.
- Language server helper responses enabling go-to-definition and completion when paired with `mach-lsp`.
- Debug adapter selection supporting `cppdbg`, `codelldb`, or terminal-driven `gdb` sessions.

### Changed
- Refined auto-closing pairs and comment configuration to mirror the compiler.