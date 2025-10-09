import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

function buildClassHeaderLine(className: string, totalLength = 78): string {
    const nameLen = className.length;
    const minPadding = 1;

    // Bepaal het maximaal aantal blokken met minimale padding
    let count = Math.floor((totalLength - 1) / (2 + 2 * minPadding + nameLen));
    if (count < 1) count = 1;

    // Bereken benodigde padding per kant om exact totalLength te halen
    const totalInnerLength = totalLength - 1; // eerste '#' al in lijn
    const baseBlockLen = 2 + nameLen; // ' #' + className zonder padding
    let padding = Math.floor((totalInnerLength / count - baseBlockLen) / 2);
    if (padding < minPadding) padding = minPadding;

    const blockLen = 2 + 2 * padding + nameLen;
    // Pas count aan indien met meer padding nog meer blokken passen
    while (count * blockLen + 1 <= totalLength) {
        count++;
    }
    count = Math.max(1, count - 1);

    const usedLength = 1 + count * blockLen;
    const remaining = totalLength - usedLength;

    const pad = ' '.repeat(padding);
    let line = '#';
    for (let i = 0; i < count; i++) {
        line += ` #${pad}${className}${pad}`;
    }
    line += ' '.repeat(remaining);

    return line;
}


export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cpp-class-generator.createCppClass', async () => {
        const className = await vscode.window.showInputBox({
            prompt: 'Voer de naam van de C++ klasse in',
            placeHolder: 'MyClass'
        });

        if (!className) {
            vscode.window.showErrorMessage('Geen class naam ingevoerd');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Geen actieve editor gevonden');
            return;
        }

        const folder = path.dirname(editor.document.uri.fsPath);

        const headerFile = path.join(folder, `${className}.h`);
        const sourceFile = path.join(folder, `${className}.cpp`);

        // Check of bestanden al bestaan
        if (fs.existsSync(headerFile) || fs.existsSync(sourceFile)) {
            vscode.window.showErrorMessage(`Kan class ${className} niet aanmaken: bestanden bestaan al.`);
            return;
        }

        // Bepaal datum en maandnaam
        const now = new Date();
        const maanden = [
            "januari", "februari", "maart", "april", "mei", "juni",
            "juli", "augustus", "september", "oktober", "november", "december"
        ];
        const maandNaam = maanden[now.getMonth()];
        const jaar = now.getFullYear();

        const config = vscode.workspace.getConfiguration();
        const auteurNaam = config.get<string>("cppClassGenerator.authorName") || "Onbekende Auteur";

        const copyrightHeader =
`/* Copyright (C) ${jaar}, Syrinx Industrial Electronics
 * All rights reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * Written by ${auteurNaam}, ${maandNaam} ${jaar}
 */
`;

        const headerGuard = `_${className.toUpperCase()}_H_`;

        const headerContent = `${copyrightHeader}
#ifndef ${headerGuard}
#define ${headerGuard}
//#
//###########################################################################
${buildClassHeaderLine(className)}
//#
class ${className} {
public:
    ${className}();
    ~${className}();

private:

};
//#
${buildClassHeaderLine(className)}
//###########################################################################
//#
#endif // ${headerGuard}
`;

        const sourceContent = `${copyrightHeader}
#include "${className}.h"
//#
//###########################################################################
${buildClassHeaderLine(className)}
//#
${className}::${className}() {
    // constructor
}

${className}::~${className}() {
    // destructor
}
//#
${buildClassHeaderLine(className)}
//###########################################################################
//#
`;

        fs.writeFileSync(headerFile, headerContent);
        fs.writeFileSync(sourceFile, sourceContent);

        vscode.window.showInformationMessage(`C++ class ${className} succesvol aangemaakt!`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
