import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
//---------------------------------------------------------------------------
async function openFiles(headerPath: string, sourcePath: string)
{
    const doc1 = await vscode.workspace.openTextDocument( headerPath );
    await vscode.window.showTextDocument( doc1, { preview: false });

    const doc2 = await vscode.workspace.openTextDocument( sourcePath );
    await vscode.window.showTextDocument( doc2, { preview: false, viewColumn: vscode.ViewColumn.Beside });
}
//---------------------------------------------------------------------------
function buildClassHeaderLine(className: string, totalLength = 77): string
{
    const tokenLength = className.length + 2 + 1;   // Includes leading and trailing space and closing '#'

    // Determine amount of tokens and padding
    let tokenCount = Math.floor(( totalLength - 3 ) / tokenLength );
    if( tokenCount < 1 ) tokenCount = 1;
    let padding = ( totalLength - 3 ) - tokenCount * tokenLength;
    if( padding < 0 ) padding = 0;

    let sp = [];
    for( let i = 0; i < 2 * tokenCount; i++ ) {
        sp.push( 0 );
    }
    while( padding > 0 ) {
        // Add padding from the center outwards
        for( let i = 0; padding > 0 && i < tokenCount; ++i, --padding ) {
            sp[ tokenCount - i - 1 ] += 1;
            if( --padding > 0 ) {
                sp[ tokenCount + i ] += 1;
            }
        }
    }
    // Put it all together
    let line = '//#';
    for( let i = 0; i < tokenCount; ++i ) {
        if( sp[ 2 * i ] > 0 ) {
            line += ' '.repeat( sp[ 2 * i ] );
        }
        line += ' ';
        line += className;
        line += ' ';
        if( sp[ 2 * i + 1 ] > 0 ) {
            line += ' '.repeat( sp[ 2 * i + 1 ] );
        }
        line += '#';
    }
    return line;
}
//---------------------------------------------------------------------------
export function activate(context: vscode.ExtensionContext)
{
    let disposable = vscode.commands.registerCommand('cpp-class-generator.createCppClass', async ( uri: vscode.Uri | undefined ) => {
        let targetPath: string | undefined;

        if( uri && uri.fsPath ) {
            const stat = await vscode.workspace.fs.stat( uri );
            if( stat.type === vscode.FileType.Directory ) {
                // Geselecteerd item is een map
                targetPath = uri.fsPath;
            } else {
                // Geselecteerd item is een bestand – gebruik de map waarin het zit
                targetPath = path.dirname( uri.fsPath );
            }
        } else if( vscode.window.activeTextEditor ) {
            const activeFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
            targetPath = path.dirname( activeFilePath );
        
        } else if( vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ) {
            targetPath = vscode.workspace.workspaceFolders[ 0 ].uri.fsPath;
        }
        // const editor = vscode.window.activeTextEditor;
        if( !targetPath ) {
            vscode.window.showErrorMessage('No valid folder found to create the class files!');
            return;
        }

        const className = await vscode.window.showInputBox( {
            prompt: 'Enter the name of the C++ class here',
            placeHolder: 'MyClass'
        });

        if( !className ) {
            vscode.window.showErrorMessage('No C++ class name given');
            return;
        }


        const config = vscode.workspace.getConfiguration();

        const headerFile = path.join( targetPath, `${className}.h` );
        const sourceFile = path.join( targetPath, `${className}.cpp` );

        // Check if the files already exist
        if( fs.existsSync( headerFile ) || fs.existsSync( sourceFile )) {
            vscode.window.showErrorMessage( `Can't create class ${className}: the files already exist.` );
            return;
        }

        // Determine year and monthName
        const now = new Date();
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();

        const authorName = config.get<string>("cppClassGenerator.authorName") || "Unknown Author";
        const companyName = config.get<string>("cppClassGenerator.companyName") || "Unknown Company";

        const copyrightHeader =
`/* Copyright (C) ${year}, ${companyName}
 * All rights reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * Written by ${authorName}, ${monthName} ${year}
 */
`;

        const classHeaderLine = buildClassHeaderLine( className )
        const headerGuard = `${className.toUpperCase()}_H`;

        const headerContent = `${copyrightHeader}
#ifndef ${headerGuard}
#define ${headerGuard}
//---------------------------------------------------------------------------
//#include <SystemFiles>
//---------------------------------------------------------------------------
//#include "CustomFiles"
//#
//###########################################################################
${classHeaderLine}
//#
class ${className}
{
public:
    ${className}();
    ~${className}();
    //-----------------------------------------------------------------------

protected:
private:

};
//#
${classHeaderLine}
//###########################################################################
//#
#endif // ${headerGuard}
`;

        const sourceContent = `${copyrightHeader}
#include "${className}.h"
//---------------------------------------------------------------------------
//#include <SystemFiles>
//---------------------------------------------------------------------------
//#include "CustomFiles"
//#
//###########################################################################
${classHeaderLine}
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
${classHeaderLine}
//###########################################################################
//#
`;

        fs.writeFileSync( headerFile, headerContent );
        fs.writeFileSync( sourceFile, sourceContent );

        openFiles( headerFile, sourceFile );

        vscode.window.showInformationMessage(`C++ class ${className} succesfully created!`);
    });

    context.subscriptions.push(disposable);
}
//---------------------------------------------------------------------------
export function deactivate() {}
