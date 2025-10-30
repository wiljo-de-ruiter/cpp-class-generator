/* Copyright (C) 2025, Syrinx Industrial Electronics
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
