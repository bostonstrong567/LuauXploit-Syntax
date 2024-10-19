"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const languageserver = require("./languageserver");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

// Generalized fetch data function
const fetchData = (url, handler, resolve) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        fetch.default(url)
            .then(res => res.text())
            .then(body => handler(body))
            .then(resolve);
    }
    catch (err) {
        vscode.window.showErrorMessage(`LuauXploit Syntax Error: ${err}`);
        if (resolve != undefined) {
            resolve();
        }
    }
});

// Helper function to write data to a file
function writeToFile(path, content) {
    try {
        fs.writeFileSync(path, content);
    }
    catch (err) {
        vscode.window.showErrorMessage(`LuauXploit Syntax Error: ${err}`);
    }
}

// Update API dump for LuauXploit Syntax
function updateLuauXploitAPI(context) {
    fetchData('https://raw.githubusercontent.com/CloneTrooper1019/Roblox-Client-Tracker/roblox/version.txt', (lastVersion) => {
        try {
            const currentVersion = fs.readFileSync(context.asAbsolutePath(path.join('server', 'api', 'version.txt')), 'utf8');
            if (currentVersion != lastVersion) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'LuauXploit Syntax: Updating API',
                    cancellable: false
                }, () => __awaiter(this, void 0, void 0, function* () {
                    return Promise.all([
                        new Promise(resolve => {
                            fetchData('https://raw.githubusercontent.com/CloneTrooper1019/Roblox-Client-Tracker/roblox/API-Dump.json', (data) => {
                                writeToFile(context.asAbsolutePath(path.join('server', 'api', 'API-Dump.json')), data);
                            }, resolve);
                        }),
                        new Promise(resolve => {
                            fetchData('https://raw.githubusercontent.com/MaximumADHD/Roblox-Client-Tracker/roblox/api-docs/en-us.json', (data) => {
                                writeToFile(context.asAbsolutePath(path.join('server', 'api', 'API-Docs.json')), data);
                                resolve();
                            });
                        })
                    ]);
                })).then(() => {
                    vscode.window.showInformationMessage(`LuauXploit Syntax: Updated API (${lastVersion}). [View changes](https://maximumadhd.github.io/Roblox-API-History)`, "Reload VSCode").then((item) => __awaiter(this, void 0, void 0, function* () {
                        if (item == "Reload VSCode") {
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    }));
                });
                writeToFile(context.asAbsolutePath(path.join('server', 'api', 'version.txt')), lastVersion);
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`LuauXploit Syntax Error: ${err}`);
        }
    });
}

// Show update window for LuauXploit Syntax
function openUpdatesWindow(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.globalState.get("sawVersionLogNew14", false) == false) {
            const panel = vscode.window.createWebviewPanel('luauxploitSyntaxUpdates', 'LuauXploit Syntax Updates', vscode.ViewColumn.One, {});
            panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div style="position:relative; padding-left:100px; padding-right:100px">
                <center><img src="https://i.imgur.com/PH5u9QD.png", witdh="300" height="300"></center>
                <h1 style="font-size:3rem; font-weight:100">LuauXploit Syntax Release Notes!</h1>
                <hr style="height:2px;border:none;color:#333;background-color:#333;"/>
                <h2 style="font-size:2rem; font-weight:100">v1.0.0</h2>
                <li style="font-size:1rem">Syntax support for LuauXploit API functions.</li>
                <li style="font-size:1rem">Basic Luau autocomplete and diagnostics integration.</li>
            </div>
        </body>
        </html>`;
            yield context.globalState.update("sawVersionLogNew14", true);
        }
    });
}

// Activation function for LuauXploit Syntax
function activate(context) {
    try {
        if (vscode.extensions.getExtension("sumneko.lua") != undefined) {
            vscode.window.showErrorMessage("The extension [Lua](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) by sumneko is enabled, please disable it so that LuauXploit Syntax can work properly.");
        }
    }
    catch (err) {
        vscode.window.showErrorMessage(err);
    }
    // openUpdatesWindow(context);
    updateLuauXploitAPI(context);
    languageserver.activate(context);
}
exports.activate = activate;

// Deactivation function for LuauXploit Syntax
function deactivate() {
    languageserver.deactivate();
}
exports.deactivate = deactivate;
