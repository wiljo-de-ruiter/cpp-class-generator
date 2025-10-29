/* Copyright (C) 2025, Syrinx Industrial Electronics
** All rights reserved.
**
** Unauthorized copying of this file, via any medium is strictly prohibited
** Proprietary and confidential
**
** Written by Wiljo de Ruiter, October 2025
*/

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
//#
//###########################################################################
//#
function gbIsValidClassName( text: string ): boolean
{
    return /^[A-Za-z_]\w*(::[A-Za-z_]\w*)*$/.test( text.trim());
}
//#
//###########################################################################
//#
async function gOpenFiles(headerPath: string, sourcePath: string)
{
    const editors = vscode.window.visibleTextEditors;
    let targetColumn;

    // Bepaal waar de nieuwe bestanden moeten worden geopend
    if( editors.length < 3 ) {
        // Maak een nieuwe editor (naast de huidige)
        targetColumn = vscode.ViewColumn.Beside;
    } else {
        // Gebruik de kolom van de laatst geopende editor
        const lastEditor = editors[ editors.length - 1 ];
        targetColumn = lastEditor.viewColumn;
    }
    const sourceDoc = await vscode.workspace.openTextDocument( sourcePath );
    const sourceEditor = await vscode.window.showTextDocument( sourceDoc, { preview: false, viewColumn: targetColumn });

    const headerDoc = await vscode.workspace.openTextDocument( headerPath );
    await vscode.window.showTextDocument( headerDoc, { preview: false, viewColumn: sourceEditor.viewColumn });
}
//#
//###########################################################################
//#
function gBuildClassHeaderLine(className: string, totalLength = 77): string
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
//#
//###########################################################################
//#
function gCurrentYear(): string
{
    const now = new Date();
    return `${now.getFullYear()}`;
}
//#
//###########################################################################
//#
function gCurrentMonth(): string
{
    const now = new Date();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${months[now.getMonth()]}`;
}
//#
//###########################################################################
//#
function gAuthorName(): string
{
    const config = vscode.workspace.getConfiguration();

    return config.get<string>("cppClassGenerator.authorName") || "Unknown Author";
}
//#
//###########################################################################
//#
function gCompanyName(): string
{
    const config = vscode.workspace.getConfiguration();

    return config.get<string>("cppClassGenerator.companyName") || "Unknown Company";
}
//#
//###########################################################################
//#
function gWrittenBy(): string
{
    return `Written by ${gAuthorName()}, ${gCurrentMonth()} ${gCurrentYear()}`;
}
//#
//###########################################################################
//#
function gUpdatedBy(): string
{
    return `Updated by ${gAuthorName()}, ${gCurrentMonth()} ${gCurrentYear()}`;
}
//#
//###########################################################################
//#
function gCopyrightHeader(): string
{
    return `/* Copyright (C) ${gCurrentYear()}, ${gCompanyName()}
** All rights reserved.
**
** Unauthorized copying of this file, via any medium is strictly prohibited
** Proprietary and confidential
**
** ${gWrittenBy()}
*/
`;
}
//#
//###########################################################################
//#
function gBuildClassHeader( className: string ): string
{
    const classHeaderLine = gBuildClassHeaderLine( className )

    return `//#
//###########################################################################
${classHeaderLine}
//#`;
}
//#
//###########################################################################
//#
function gBuildClassFooter( className: string ): string
{
    const classHeaderLine = gBuildClassHeaderLine( className )

    return `//#
${classHeaderLine}
//###########################################################################
//#`;
}
//#
//###########################################################################
//#
function gBuildClassDeclaration( className: string ): string
{
    const classHeader = gBuildClassHeader( className )
    const classFooter = gBuildClassFooter( className )

    return `${classHeader}
class ${className}
{
public:
    ${className}();
    ~${className}();
    //-----------------------------------------------------------------------

protected:
private:
};
${classFooter}
`;
}
//#
//###########################################################################
//#
function gBuildClassDefinition( className: string ): string
{
    const classHeader = gBuildClassHeader( className )
    const classFooter = gBuildClassFooter( className )

    return `${classHeader}
${className}::${className}()
{
    // constructor
}
//---------------------------------------------------------------------------
${className}::~${className}()
{
    // destructor
}
${classFooter}
`;
}
//#
//###########################################################################
//#
function gReplaceEnd( source: string, ending: string, replacement: string ): string
{
    if( source.toLowerCase().endsWith( ending.toLowerCase())) {
        return source.slice( 0, -ending.length ) + replacement;
    }
    return source;
}
//#
//###########################################################################
//#
function gGetHeaderPath( aTargetPath: string ): string
{
    let targetPath = aTargetPath;
    const sep = path.sep;       // '\' on Windows, '/' on Mac/Linux

    if( targetPath.toLowerCase().endsWith( `${sep}src` )) {
        targetPath = gReplaceEnd( targetPath, `${sep}src`, `${sep}inc` );

    } else if( targetPath.toLowerCase().endsWith( `${sep}source` )) {
        targetPath = gReplaceEnd( targetPath, `${sep}source`, `${sep}inc` );

    } else {
        return targetPath;
    }
    //* Now check if folder .../inc/ exists
    if( fs.existsSync( targetPath ) && fs.statSync( targetPath ).isDirectory()) {
        return targetPath;
    }
    //* Now check if folder .../include/ exists
    targetPath = gReplaceEnd( targetPath, `${sep}inc`, `${sep}include` );

    if( fs.existsSync( targetPath ) && fs.statSync( targetPath ).isDirectory()) {
        return targetPath;
    }
    //* Just return original
    return aTargetPath;
}
//#
//###########################################################################
//#
function gGetSourcePath( aTargetPath: string ): string
{
    let targetPath = aTargetPath;
    const sep = path.sep;       // '\' on Windows, '/' on Mac/Linux

    if( targetPath.toLowerCase().endsWith( `${sep}inc` )) {
        targetPath = gReplaceEnd( targetPath, `${sep}inc`, `${sep}src` );

    } else if( targetPath.toLowerCase().endsWith( `${sep}include` )) {
        targetPath = gReplaceEnd( targetPath, `${sep}include`, `${sep}src` );

    } else {
        return targetPath;
    }
    //* Now check if folder .../src/ exists
    if( fs.existsSync( targetPath ) && fs.statSync( targetPath ).isDirectory()) {
        return targetPath;
    }
    //* Now check if folder .../source/ exists
    targetPath = gReplaceEnd( targetPath, `${sep}src`, `${sep}source` );

    if( fs.existsSync( targetPath ) && fs.statSync( targetPath ).isDirectory()) {
        return targetPath;
    }
    //* Just return original
    return aTargetPath;
}
//#
//###########################################################################
//#
export function activate(context: vscode.ExtensionContext)
{
    let createFilesForNewClass = vscode.commands.registerCommand('cpp-class-generator.createFilesForNewClass', async ( uri: vscode.Uri | undefined ) => {
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
            placeHolder: 'MyClass',
            validateInput: text => gbIsValidClassName( text ) ? null : 'Invalid class name.'
        });

        if( !className ) {
            vscode.window.showErrorMessage('No C++ class name given');
            return;
        }
        //* Now determine where we are: inc, include, src or source
        const headerFile = path.join( gGetHeaderPath( targetPath ), `${className}.h` );
        const sourceFile = path.join( gGetSourcePath( targetPath ), `${className}.cpp` );

        // Check if the files already exist
        if( fs.existsSync( headerFile ) || fs.existsSync( sourceFile )) {
            vscode.window.showErrorMessage( `Can't create class ${className}: the files already exist.` );
            return;
        }

        const copyrightHeader = gCopyrightHeader();
        const classHeaderLine = gBuildClassHeaderLine( className );
        const headerGuard = `${className.toUpperCase()}_H`;
        const classDeclaration = gBuildClassDeclaration( className );
        const classDefinition = gBuildClassDefinition( className );

        const headerContent = `${copyrightHeader}
#ifndef ${headerGuard}
#define ${headerGuard}
//---------------------------------------------------------------------------
//#include <SystemFiles>
//---------------------------------------------------------------------------
//#include "CustomFiles"
${classDeclaration}
#endif // ${headerGuard}
`;

        const sourceContent = `${copyrightHeader}
#include "${className}.h"
//---------------------------------------------------------------------------
//#include <SystemFiles>
//---------------------------------------------------------------------------
//#include "CustomFiles"
${classDefinition}
`;

        fs.writeFileSync( headerFile, headerContent );
        fs.writeFileSync( sourceFile, sourceContent );

        gOpenFiles( headerFile, sourceFile );

        vscode.window.showInformationMessage(`C++ class ${className} succesfully created!`);
    });
    //-----------------------------------------------------------------------
    let insertClassDeclaration = vscode.commands.registerCommand('cpp-class-generator.insertClassDeclaration', async ( uri: vscode.Uri | undefined ) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const className = await vscode.window.showInputBox({
            prompt: 'Enter the name of the C++ class here',
            validateInput: text => gbIsValidClassName( text ) ? null : 'Invalid class name.'
        });

        if( !className ) {
            vscode.window.showErrorMessage('No C++ class name given');
            return;
        }

        let snippet = gBuildClassDeclaration( className );

        const document = editor.document;
        const cursorPos = editor.selection.active;
        const insertLine = cursorPos.character === 0
                ? cursorPos.line
                : Math.min( cursorPos.line + 1, document.lineCount );
        const insertPos = new vscode.Position( insertLine, 0 );

        editor.edit( editBuilder => {
            editBuilder.insert( insertPos, snippet );
        });
    });
    //-----------------------------------------------------------------------
    let insertClassDefinition  = vscode.commands.registerCommand('cpp-class-generator.insertClassDefinition', async ( uri: vscode.Uri | undefined ) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const className = await vscode.window.showInputBox({
            prompt: 'Enter the name of the C++ class here',
            validateInput: text => gbIsValidClassName( text ) ? null : 'Invalid class name.'
        });

        if( !className ) {
            vscode.window.showErrorMessage('No C++ class name given');
            return;
        }

        let snippet = gBuildClassDefinition( className );

        const document = editor.document;
        const cursorPos = editor.selection.active;
        const insertLine = cursorPos.character === 0
                ? cursorPos.line
                : Math.min( cursorPos.line + 1, document.lineCount );
        const insertPos = new vscode.Position( insertLine, 0 );

        editor.edit( editBuilder => {
            editBuilder.insert( insertPos, snippet );
        });
    });
    //-----------------------------------------------------------------------
    let insertNewClass  = vscode.commands.registerCommand('cpp-class-generator.insertNewClass', async ( uri: vscode.Uri | undefined ) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const className = await vscode.window.showInputBox({
            prompt: 'Enter the name of the C++ class here',
            validateInput: text => gbIsValidClassName( text ) ? null : 'Invalid class name.'
        });

        if( !className ) {
            vscode.window.showErrorMessage('No C++ class name given');
            return;
        }

        const document = editor.document;
        const cursorPos = editor.selection.active;
        const insertLine = cursorPos.character === 0
                ? cursorPos.line
                : Math.min( cursorPos.line + 1, document.lineCount );
        const insertPos = new vscode.Position( insertLine, 0 );

        let snippet = gBuildClassDeclaration( className )
                    + gBuildClassDefinition( className );

        editor.edit( editBuilder => {
            editBuilder.insert( insertPos, snippet );
        });
    });
    //-----------------------------------------------------------------------
    let insertCopyright  = vscode.commands.registerCommand('cpp-class-generator.insertCopyright', async ( uri: vscode.Uri | undefined ) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }
        let index = 0;
        const document = editor.document;
        let sourceLine = document.lineAt( index ).text;
        const writtenBy = gWrittenBy();
        const updatedBy = gUpdatedBy();

        if( sourceLine.startsWith( "/* Copyright" )) {
            do {
                index += 1;
                sourceLine = document.lineAt( index ).text.trim();
                if( sourceLine.includes( writtenBy ) || sourceLine.includes( updatedBy )) {
                    vscode.window.showInformationMessage('Copyright header already exists and is up to date!');
                    return;
                }
            } while( sourceLine != "*/" );

            let snippet = `** ${updatedBy}${"\n"}`;
            editor.edit( editBuilder => {
                editBuilder.insert( new vscode.Position( index, 0 ), snippet );
            })
            vscode.window.showInformationMessage('Copyright header updated!');
        } else {
            const insertPos = new vscode.Position( 0, 0 );
            const copyrightHeader = gCopyrightHeader();

            let snippet = `${copyrightHeader}${"\n"}`;

            editor.edit( editBuilder => {
                editBuilder.insert( insertPos, snippet );
            });
            vscode.window.showInformationMessage('Copyright header created!');
        }
    });
    //-----------------------------------------------------------------------
    let insertClassHeader = vscode.commands.registerCommand('cpp-class-generator.insertClassHeader', async ( uri: vscode.Uri | undefined ) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }
        let className: string | undefined;
        const document = editor.document;
        const cursorPos = editor.selection.active;

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection).trim();

        const wordRange = document.getWordRangeAtPosition(cursorPos);
        const wordUnderCursor = wordRange ? document.getText(wordRange).trim() : '';

        if( selectedText && gbIsValidClassName( selectedText )) {
            className = selectedText;
        } else if( wordUnderCursor && gbIsValidClassName( wordUnderCursor )) {
            className = wordUnderCursor;
        } else {
            className = await vscode.window.showInputBox({
                prompt: 'Enter the name of the C++ class here',
                validateInput: text => gbIsValidClassName( text ) ? null : 'Invalid class name.'
            });
        }
        if( !className ) {
            return;
        }
        const insertHeader = new vscode.Position( cursorPos.line, 0 );
        const insertFooter = new vscode.Position( Math.min( cursorPos.line + 1, document.lineCount ), 0 );

        let classHeader = gBuildClassHeader( className );
        let classFooter = gBuildClassFooter( className );

        let header = `${classHeader}${"\n"}`;
        let footer = `${classFooter}${"\n"}`;

        editor.edit( editBuilder => {
            editBuilder.insert( insertFooter, footer );
            editBuilder.insert( insertHeader, header );
        });
    });
    //-----------------------------------------------------------------------
    context.subscriptions.push( insertCopyright, createFilesForNewClass, insertClassHeader, insertClassDeclaration, insertClassDefinition, insertNewClass );
}
//---------------------------------------------------------------------------
export function deactivate() {}
