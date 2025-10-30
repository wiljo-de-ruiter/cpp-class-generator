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
export async function gInsertClassDefinition( uri: vscode.Uri | undefined )
{
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
    }

    const className = await vscode.window.showInputBox({
        prompt: 'Enter the name of the C++ class here',
        validateInput: text => utils.gbIsValidClassName( text ) ? null : 'Invalid class name.'
    });

    if( !className ) {
        vscode.window.showErrorMessage('No C++ class name given');
        return;
    }

    let snippet = utils.gBuildClassDefinition( className );

    const document = editor.document;
    const cursorPos = editor.selection.active;
    const insertLine = cursorPos.character === 0
            ? cursorPos.line
            : Math.min( cursorPos.line + 1, document.lineCount );
    const insertPos = new vscode.Position( insertLine, 0 );

    editor.edit( editBuilder => {
        editBuilder.insert( insertPos, snippet );
    });
}
