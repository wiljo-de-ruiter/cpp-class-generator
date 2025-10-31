/* Copyright (C) 2025
** All rights reserved.
**
** Unauthorized copying of this file, via any medium is strictly prohibited
** Proprietary and confidential
**
** Written by Wiljo de Ruiter, October 2025
*/

import * as vscode from 'vscode';
//---------------------------------------------------------------------------
import * as utils from '../utils/sourceUtils';
//#
//###########################################################################
//#
export async function gInsertClassHeader( uri: vscode.Uri | undefined )
{
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

    if( selectedText && utils.gbIsValidClassName( selectedText )) {
        className = selectedText;
    } else if( wordUnderCursor && utils.gbIsValidClassName( wordUnderCursor )) {
        className = wordUnderCursor;
    } else {
        className = await vscode.window.showInputBox({
            prompt: 'Enter the name of the C++ class here',
            validateInput: text => utils.gbIsValidClassName( text ) ? null : 'Invalid class name.'
        });
    }
    if( !className ) {
        return;
    }
    // Regex om een regel zoals //# oldname # oldname # te matchen
    const regex = /^\/\/#\s*([A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)(?:\s+#\s*[A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)*\s*#?\s*$/;

    let foundLines: number[] = [];

    //* Look backwards
    for( let line = cursorPos.line - 1; line >= 0; line-- ) {
        const text = document.lineAt( line ).text;
        if( regex.test( text )) {
            foundLines.push( line );
            break;  // Stop at the first match
        }
    }
    //* Look forwards
    for( let line = cursorPos.line + 1; line < document.lineCount; line++ ) {
        const text = document.lineAt( line ).text;
        if( regex.test( text )) {
            foundLines.push( line );
            break;  // Stop at the first match
        }
    }

    const newHeader = utils.gBuildClassHeaderLine( className );

    if( foundLines.length == 2 ) {
        await editor.edit( editBuilder => {
            for( const line of foundLines ) {
                const range = document.lineAt( line ).range;
                editBuilder.replace( range, newHeader );
            }
        })
        vscode.window.showInformationMessage( "Class header was updated" );
        return;
    }

    const insertHeader = new vscode.Position( cursorPos.line, 0 );
    const insertFooter = new vscode.Position( Math.min( cursorPos.line + 1, document.lineCount ), 0 );

    let classHeader = utils.gBuildClassHeader( className );
    let classFooter = utils.gBuildClassFooter( className );

    let header = `${classHeader}${"\n"}`;
    let footer = `${classFooter}${"\n"}`;

    editor.edit( editBuilder => {
        editBuilder.insert( insertFooter, footer );
        editBuilder.insert( insertHeader, header );
    });
}
