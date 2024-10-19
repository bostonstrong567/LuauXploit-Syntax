import * as vscode from 'vscode'
import * as languageserver from './languageserver';
import * as fetch from 'node-fetch';
import * as path from 'path';
import * as fs from 'fs';

const fetchData = async (url: string, handler: (data: string) => void, resolve?: () => void) => {
    try {
        fetch.default(url)
            .then(res => res.text())
            .then(body => handler(body))
            .then(resolve);
    } catch (err) {
        vscode.window.showErrorMessage(`luauxploit Error: ${err}`);
        if (resolve != undefined) {
            resolve();
        }
    }
};

function writeToFile(path: string, content: string) {
    try {
        fs.writeFileSync(path, content);
    } catch (err) {
        vscode.window.showErrorMessage(`luauxploit Error: ${err}`);
    }
}

function updateRobloxAPI(context: vscode.ExtensionContext) {
    fetchData('https://raw.githubusercontent.com/CloneTrooper1019/Roblox-Client-Tracker/roblox/version.txt', (lastVersion) => {
        try {
            const currentVersion = fs.readFileSync(context.asAbsolutePath(path.join('server', 'api', 'version.txt')), 'utf8')
            if (currentVersion != lastVersion) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'luauxploit: Updating API',
                    cancellable: false
                }, async () => {
                    return Promise.all([
                        new Promise<void>(resolve => {
                            fetchData('https://raw.githubusercontent.com/CloneTrooper1019/Roblox-Client-Tracker/roblox/API-Dump.json', (data) => {
                                writeToFile(context.asAbsolutePath(path.join('server', 'api', 'API-Dump.json')), data);
                            }, resolve);
                        }),
                        new Promise<void>(resolve => {
                            fetchData('https://raw.githubusercontent.com/MaximumADHD/Roblox-Client-Tracker/roblox/api-docs/en-us.json', (data) => {
                                writeToFile(context.asAbsolutePath(path.join('server', 'api', 'API-Docs.json')), data);
                                resolve();
                            });
                        })
                    ]);
                }).then(() => {
                    vscode.window.showInformationMessage(`luauXploit: Updated API (${lastVersion}). [View changes](https://maximumadhd.github.io/Roblox-API-History)`, "Reload VSCode").then(async (item) => {
                        if (item == "Reload VSCode") {
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    });
                });
                writeToFile(context.asAbsolutePath(path.join('server', 'api', 'version.txt')), lastVersion);
            }
        } catch (err) {
            vscode.window.showErrorMessage(`Roblox LSP Error: ${err}`);
        }
    });
}

async function openUpdatesWindow(context: vscode.ExtensionContext) {
    if (context.globalState.get("sawVersionLogNew14", false) == false) {
        const panel = vscode.window.createWebviewPanel(
            'luauxploitUpdates',
            'luauXploit Updates',
            vscode.ViewColumn.One,
            {}
        );
        panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div style="position:relative; padding-left:100px; padding-right:100px">
                <center><img src="https://i.imgur.com/PH5u9QD.png", witdh="300" height="300"></center>
                <h1 style="font-size:3rem; font-weight:100">luauXploit Release Notes!</h1>
                <hr style="height:2px;border:none;color:#333;background-color:#333;"/>
                <li style="font-size:1rem">By default, all rojo project files found will be loaded and merged into one, change luauxploit.workspace.rojoProjectFile if you prefer to use a specific one.</li>
                <li style="font-size:1rem">Improved syntax support for Luau.</li>
            </div>
        </body>
        </html>`;
        await context.globalState.update("sawVersionLogNew14", true);
    }
}

export function activate(context: vscode.ExtensionContext) {
    try {
        if (vscode.extensions.getExtension("sumneko.lua") != undefined) {
            vscode.window.showErrorMessage("The extension [Lua](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) by sumneko is enabled, please disable it so that Roblox LSP can work properly. or others");
        }
    } catch (err) {
        vscode.window.showErrorMessage(err);
    }

    // openUpdatesWindow(context);

    updateRobloxAPI(context);

    languageserver.activate(context);
}

export function deactivate() {
    languageserver.deactivate();
}
