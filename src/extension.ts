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
import { gCreateFilesForNewClass  } from './commands/createFilesForNewClass';
import { gInsertClassDeclaration } from './commands/insertClassDeclaration';
import { gInsertClassDefinition } from './commands/insertClassDefinition';
import { gInsertClassHeader } from './commands/insertClassHeader';
import { gInsertCopyright  } from './commands/insertCopyright';
import { gInsertNewClass } from './commands/insertNewClass';
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
