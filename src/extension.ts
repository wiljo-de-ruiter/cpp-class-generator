import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

async function openFiles(headerPath: string, sourcePath: string)
{
  const doc1 = await vscode.workspace.openTextDocument(headerPath);
  await vscode.window.showTextDocument(doc1, { preview: false });

  const doc2 = await vscode.workspace.openTextDocument(sourcePath);
  await vscode.window.showTextDocument(doc2, { preview: false, viewColumn: vscode.ViewColumn.Beside });
}

function buildClassHeaderLine(className: string, totalLength = 77): string
{
    const nameLen = className.length + 2 + 1;   // Including spaces and closing '#'

    // Bepaal het maximaal aantal blokken met minimale padding
    let count = Math.floor(( totalLength - 3 ) / nameLen );
    if (count < 1) count = 1;
    let spaces = ( totalLength - 3 ) - count * nameLen;

    let sp = [];
    for( let i = 0; i < 2 * count; i++ ) {
        sp.push( 0 );
    }
    while( spaces > 0 ) {
        for( let i = 0; spaces > 0 && i < count; ++i, --spaces ) {
            sp[ count - i - 1 ] += 1;
            if( --spaces > 0 ) {
                sp[ count + i ] += 1;
            }
        }
    }
    let line = '//#';
    for( let i = 0; i < count; ++i ) {
        if( sp[ 2 * i ] > 0 ) {
            line += ' '.repeat( sp[ 2 * i ] );
        }
        line += ' ';
        line += className;
        line += ' ';
        if( sp[ 2 * i + 1 ] > 0 ) {
            line += ' '.repeat( sp[ 2 * i + 1  ] );
        }
        line += '#';
    }
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


        const config = vscode.workspace.getConfiguration();
        const useGuards = config.get<boolean>('useIncludeGuards', true);
        const headerExt = config.get<string>('headerExtension', '.h');
        const addCopyright = config.get<boolean>('addCopyrightHeader', true);
        const commentStyle = config.get<string>('classCommentStyle', 'banner');
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
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];
        const maandNaam = maanden[now.getMonth()];
        const jaar = now.getFullYear();

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

        const headerGuard = `${className.toUpperCase()}_H`;

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
    //-----------------------------------------------------------------------

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
${className}::${className}()
{
    // constructor
}
//---------------------------------------------------------------------------
${className}::~${className}()
{
    // destructor
}
//#
${buildClassHeaderLine(className)}
//###########################################################################
//#
`;

        fs.writeFileSync(headerFile, headerContent);
        fs.writeFileSync(sourceFile, sourceContent);

        openFiles(headerFile, sourceFile);

        vscode.window.showInformationMessage(`C++ class ${className} succesvol aangemaakt!`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
