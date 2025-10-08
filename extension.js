"use strict";

const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client = undefined;

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

async function restartClient(context) {
    if (client) {
        await client.stop();
        client.dispose();
    }
    client = createLanguageClient(context);
}

function activate(context) {
    restartClient(context);

    const restartCommand = vscode.commands.registerCommand("mach.restartServer", async () => {
        await restartClient(context);
    });

    const configListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration("mach.lspPath")) {
            await restartClient(context);
        }
    });

    context.subscriptions.push(restartCommand, configListener, {
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
