"use strict";

const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");
const { exec } = require("child_process");

let client = undefined;
let outputChannel = undefined;

function resolveServerPath(context) {
    const configPath = vscode.workspace.getConfiguration("mach").get("lspPath");
    if (configPath && configPath.trim().length > 0) {
        const raw = configPath.trim();
        if (path.isAbsolute(raw)) {
            return raw;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return path.resolve(workspaceFolders[0].uri.fsPath, raw);
        }

        return path.resolve(context.extensionPath, raw);
    }

    const candidates = [];
    const sibling = path.resolve(context.extensionPath, "..", "mach-lsp", "out", "bin");
    if (process.platform === "win32") {
        candidates.push(path.join(sibling, "mach-lsp.exe"));
    }
    candidates.push(path.join(sibling, "mach-lsp"));

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }

    return undefined;
}

function createLanguageClient(context) {
    const command = resolveServerPath(context);
    if (!command) {
        vscode.window.showErrorMessage(
            "mach-lsp executable not found. Build mach-lsp or set `mach.lspPath` in settings."
        );
        return undefined;
    }

    const serverOptions = {
        command,
        transport: TransportKind.stdio
    };

    const clientOptions = {
        documentSelector: [
            { scheme: "file", language: "mach" },
            { scheme: "untitled", language: "mach" }
        ],
        outputChannelName: "Mach Language Server"
    };

    const languageClient = new LanguageClient(
        "machLsp",
        "Mach Language Server",
        serverOptions,
        clientOptions
    );

    languageClient.start();
    return languageClient;
}

function getPrimaryWorkspaceFolder() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        return undefined;
    }

    return folders[0];
}

function runShellCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        const child = exec(command, { cwd, env: process.env, shell: true });

        child.stdout.on("data", (data) => {
            outputChannel.append(data.toString());
        });

        child.stderr.on("data", (data) => {
            outputChannel.append(data.toString());
        });

        child.on("error", (error) => {
            reject(error);
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`Command exited with code ${code}`));
            }
        });
    });
}

function quotePath(commandPath) {
    if (commandPath.includes(" ")) {
        return `"${commandPath.replace(/"/g, '\"')}"`;
    }

    return commandPath;
}

function createOrShowTerminal(name, cwd) {
    const existing = vscode.window.terminals.find((terminal) => terminal.name === name);
    if (existing) {
        existing.dispose();
    }

    return vscode.window.createTerminal({ name, cwd });
}

async function handleBuildCommand() {
    const folder = getPrimaryWorkspaceFolder();
    if (!folder) {
        vscode.window.showErrorMessage("Mach: no workspace folder is open.");
        return;
    }

    const config = vscode.workspace.getConfiguration("mach", folder.uri);
    const command = config.get("buildCommand", "make");

    outputChannel.appendLine(`$ ${command}`);
    outputChannel.show(true);

    try {
        await runShellCommand(command, folder.uri.fsPath);
        vscode.window.showInformationMessage("Mach build completed successfully.");
    }
    catch (error) {
        vscode.window.showErrorMessage(`Mach build failed: ${error.message}`);
    }
}

function handleRunCommand() {
    const folder = getPrimaryWorkspaceFolder();
    if (!folder) {
        vscode.window.showErrorMessage("Mach: no workspace folder is open.");
        return;
    }

    const config = vscode.workspace.getConfiguration("mach", folder.uri);
    const command = config.get("runCommand", "make run");

    const terminal = createOrShowTerminal("Mach Run", folder.uri.fsPath);
    terminal.show(true);
    terminal.sendText(command, true);
}

async function handleDebugCommand() {
    const folder = getPrimaryWorkspaceFolder();
    if (!folder) {
        vscode.window.showErrorMessage("Mach: no workspace folder is open.");
        return;
    }

    const config = vscode.workspace.getConfiguration("mach", folder.uri);
    const preLaunch = config.get("debug.preLaunchBuild", true);

    if (preLaunch) {
        outputChannel.appendLine("# Running pre-launch build");
        outputChannel.show(true);
        try {
            await runShellCommand(config.get("buildCommand", "make"), folder.uri.fsPath);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Mach pre-launch build failed: ${error.message}`);
            return;
        }
    }

    const programRelative = config.get("debug.program", "out/bin/app");
    const program = path.resolve(folder.uri.fsPath, programRelative);
    const gdbPath = config.get("debug.gdbPath", "gdb");
    const adapter = config.get("debug.adapter", "cppdbg");

    if (!fs.existsSync(program)) {
        vscode.window.showErrorMessage(`Mach debug target not found: ${program}`);
        return;
    }

    if (adapter === "gdb-terminal") {
        const terminal = createOrShowTerminal("Mach Debug", folder.uri.fsPath);
        terminal.show(true);
        const quotedProgram = quotePath(program);
        const quotedGdbPath = quotePath(gdbPath);
        terminal.sendText(`${quotedGdbPath} --args ${quotedProgram}`, true);
        vscode.window.showInformationMessage("Mach debug session started in terminal.");
        return;
    }

    const debugConfiguration = {
        name: "Mach Debug",
        request: "launch",
        program,
        args: [],
        cwd: folder.uri.fsPath,
        stopAtEntry: false,
        environment: [],
        externalConsole: false
    };

    if (adapter === "codelldb") {
        debugConfiguration.type = "lldb";
    }
    else {
        debugConfiguration.type = "cppdbg";
        debugConfiguration.MIMode = "gdb";
        debugConfiguration.miDebuggerPath = gdbPath;
    }

    try {
        await vscode.debug.startDebugging(folder, debugConfiguration);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Mach debug failed to start: ${error.message}`);
    }
}

async function restartClient(context) {
    if (client) {
        await client.stop();
        client.dispose();
    }
    client = createLanguageClient(context);
}

function activate(context) {
    outputChannel = vscode.window.createOutputChannel("Mach");

    restartClient(context);

    const restartCommand = vscode.commands.registerCommand("mach.restartServer", async () => {
        await restartClient(context);
    });

    const buildCommand = vscode.commands.registerCommand("mach.build", async () => {
        await handleBuildCommand();
    });

    const runCommand = vscode.commands.registerCommand("mach.run", () => {
        handleRunCommand();
    });

    const debugCommand = vscode.commands.registerCommand("mach.debug", async () => {
        await handleDebugCommand();
    });

    const configListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration("mach.lspPath")) {
            await restartClient(context);
        }
    });

    context.subscriptions.push(outputChannel, restartCommand, buildCommand, runCommand, debugCommand, configListener, {
        dispose: () => {
            if (client) {
                client.stop();
            }
        }
    });
}

async function deactivate() {
    if (!client) {
        return;
    }
    await client.stop();
    client.dispose();
    client = undefined;
}

module.exports = {
    activate,
    deactivate
};
