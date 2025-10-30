/* Copyright (C) 2025, Syrinx Industrial Electronics
** All rights reserved.
**
** Unauthorized copying of this file, via any medium is strictly prohibited
** Proprietary and confidential
**
** Written by Wiljo de Ruiter, October 2025
*/

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
//---------------------------------------------------------------------------
import * as utils from '../utils/sourceUtils';
//#
//###########################################################################
//#
function gGetHeaderPath( aTargetPath: string ): string
{
    let targetPath = aTargetPath;
    const sep = path.sep;       // '\' on Windows, '/' on Mac/Linux

    if( targetPath.toLowerCase().endsWith( `${sep}src` )) {
        targetPath = utils.gReplaceEnd( targetPath, `${sep}src`, `${sep}inc` );

    } else if( targetPath.toLowerCase().endsWith( `${sep}source` )) {
        targetPath = utils.gReplaceEnd( targetPath, `${sep}source`, `${sep}inc` );

    } else {
        return targetPath;
    }
    //* Now check if folder .../inc/ exists
    if( fs.existsSync( targetPath ) && fs.statSync( targetPath ).isDirectory()) {
        return targetPath;
    }
    //* Now check if folder .../include/ exists
    targetPath = utils.gReplaceEnd( targetPath, `${sep}inc`, `${sep}include` );

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
        targetPath = utils.gReplaceEnd( targetPath, `${sep}inc`, `${sep}src` );

    } else if( targetPath.toLowerCase().endsWith( `${sep}include` )) {
        targetPath = utils.gReplaceEnd( targetPath, `${sep}include`, `${sep}src` );

    } else {
        return targetPath;
    }
    //* Now check if folder .../src/ exists
    if( fs.existsSync( targetPath ) && fs.statSync( targetPath ).isDirectory()) {
        return targetPath;
    }
    //* Now check if folder .../source/ exists
    targetPath = utils.gReplaceEnd( targetPath, `${sep}src`, `${sep}source` );

    if( fs.existsSync( targetPath ) && fs.statSync( targetPath ).isDirectory()) {
        return targetPath;
    }
    //* Just return original
    return aTargetPath;
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
export async function gCreateFilesForNewClass( uri: vscode.Uri | undefined )
{
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
    if( !targetPath ) {
        vscode.window.showErrorMessage('No valid folder found to create the class files!');
        return;
    }

    const className = await vscode.window.showInputBox( {
        prompt: 'Enter the name of the C++ class here',
        placeHolder: 'MyClass',
        validateInput: text => utils.gbIsValidClassName( text ) ? null : 'Invalid class name.'
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

    const copyrightHeader = utils.gCopyrightHeader();
    const classHeaderLine = utils.gBuildClassHeaderLine( className );
    const headerGuard = `${className.toUpperCase()}_H`;
    const classDeclaration = utils.gBuildClassDeclaration( className );
    const classDefinition = utils.gBuildClassDefinition( className );

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
}
