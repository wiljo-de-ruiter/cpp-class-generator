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
export async function gInsertCopyright( uri: vscode.Uri | undefined )
{
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
    }
    const document = editor.document;
    const text = document.getText();
    //* Now look for the first comment block between /* and */
    const match = text.match(/\/\*[\s\S]*?\*\//);

    if( !match ) {
        utils.gInsertCopyrightHeader();
        return;
    }
    const commentBlock = match[ 0 ];
    const startIndex = match.index ?? 0;
    const endIndex = startIndex + commentBlock.length;

    // Controleer of het begint met "/* Copyright"
    if(!/^\/\*\s*Copyright/i.test( commentBlock )) {
        utils.gInsertCopyrightHeader();
        return;
    }

    //* Now replace any " *" with "**"
    const lines = commentBlock.split( '\n' ).map( line => {
        // WHen this is the closing line: " */" → "*/"
        if(/\s+\*\/\s*$/.test( line )) {
            return line.replace(/\s+\*\/\s*$/, '*/');
        }
        if(/^\s+\*/.test( line )) {
            return line.replace(/^(\s)\*/, '**' );
        }
        return line;
    });

    //* Now update the copyright notice
    const writtenBy = utils.gWrittenBy();
    const updatedBy = utils.gUpdatedBy();
    const writtenPresent = lines.some( line => line.includes( writtenBy ));
    const updatedPresent = lines.some( line => line.includes( updatedBy ));

    if( writtenPresent || updatedPresent ) {
        vscode.window.showInformationMessage('Copyright header already exists and is up to date!');
    } else {
        let insertIndex = lines.length - 1;
        lines.splice( insertIndex, 0, `** ${updatedBy}` );
        vscode.window.showInformationMessage('Copyright header updated!');
    }
    const newBlock = lines.join( '\n' );

    //* Now replace the range of the block
    const range = new vscode.Range( editor.document.positionAt( startIndex ), editor.document.positionAt( endIndex ));
    editor.edit( editBuilder => {
        editBuilder.replace( range, newBlock );
    })
}
