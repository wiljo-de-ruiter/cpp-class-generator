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
//---------------------------------------------------------------------------
import * as utils from './utils/sourceUtils';
//---------------------------------------------------------------------------
import { gCreateFilesForNewClass  } from './commands/createFilesForNewClass';
//#
//###########################################################################
//#
export async function gInsertClassDeclaration( uri: vscode.Uri | undefined )
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

    let snippet = utils.gBuildClassDeclaration( className );

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
//#
//###########################################################################
//#
export async function gInsertNewClass( uri: vscode.Uri | undefined )
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

    const document = editor.document;
    const cursorPos = editor.selection.active;
    const insertLine = cursorPos.character === 0
            ? cursorPos.line
            : Math.min( cursorPos.line + 1, document.lineCount );
    const insertPos = new vscode.Position( insertLine, 0 );

    let snippet = utils.gBuildClassDeclaration( className )
                + utils.gBuildClassDefinition( className );

    editor.edit( editBuilder => {
        editBuilder.insert( insertPos, snippet );
    });
}
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
//#
//###########################################################################
//#
export function activate(context: vscode.ExtensionContext)
{
    let createFilesForNewClass  = vscode.commands.registerCommand('cpp-class-generator.createFilesForNewClass'  , gCreateFilesForNewClass );
    let insertClassDeclaration  = vscode.commands.registerCommand('cpp-class-generator.insertClassDeclaration'  , gInsertClassDeclaration );
    let insertClassDefinition   = vscode.commands.registerCommand('cpp-class-generator.insertClassDefinition'   , gInsertClassDefinition );
    let insertNewClass          = vscode.commands.registerCommand('cpp-class-generator.insertNewClass'          , gInsertNewClass );
    let insertCopyright         = vscode.commands.registerCommand('cpp-class-generator.insertCopyright'         , gInsertCopyright );
    let insertClassHeader       = vscode.commands.registerCommand('cpp-class-generator.insertClassHeader'       , gInsertClassHeader );
    //-----------------------------------------------------------------------
    context.subscriptions.push( insertCopyright, createFilesForNewClass, insertClassHeader, insertClassDeclaration, insertClassDefinition, insertNewClass );
}
//---------------------------------------------------------------------------
export function deactivate() {}
