/* Copyright (C) 2025
** All rights reserved.
**
** Unauthorized copying of this file, via any medium is strictly prohibited
** Proprietary and confidential
**
** Written by Wiljo de Ruiter, October 2025
*/

import * as vscode from 'vscode';

//#
//###########################################################################
//#
export function gbIsValidClassName( text: string ): boolean
{
    return /^[A-Za-z_]\w*(::[A-Za-z_]\w*)*$/.test( text.trim());
}
//#
//###########################################################################
//#
export function gCurrentYear(): string
{
    const now = new Date();
    return `${now.getFullYear()}`;
}
//#
//###########################################################################
//#
export function gCurrentMonth(): string
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
export function gAuthorName(): string
{
    const config = vscode.workspace.getConfiguration();

    return config.get<string>("cppClassGenerator.authorName") || "Unknown Author";
}
//#
//###########################################################################
//#
export function gCompanyName(): string
{
    const config = vscode.workspace.getConfiguration();

    return config.get<string>("cppClassGenerator.companyName") || "Unknown Company";
}
//#
//###########################################################################
//#
export function gWrittenBy(): string
{
    return `Written by ${gAuthorName()}, ${gCurrentMonth()} ${gCurrentYear()}`;
}
//#
//###########################################################################
//#
export function gUpdatedBy(): string
{
    return `Updated by ${gAuthorName()}, ${gCurrentMonth()} ${gCurrentYear()}`;
}
//#
//###########################################################################
//#
export function gCopyrightHeader(): string
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
export function gReplaceEnd( source: string, ending: string, replacement: string ): string
{
    if( source.toLowerCase().endsWith( ending.toLowerCase())) {
        return source.slice( 0, -ending.length ) + replacement;
    }
    return source;
}
//#
//###########################################################################
//#
export function gBuildClassHeaderLine(className: string, totalLength = 77): string
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
            sp[ tokenCount + i ] += 1;
            if( --padding > 0 ) {
                sp[ tokenCount - i - 1 ] += 1;
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
export function gBuildClassHeader( className: string, indent: string = '' ): string
{
    const classHeaderLine = gBuildClassHeaderLine( className )

    return `${indent}//#
${indent}//###########################################################################
${indent}${classHeaderLine}
${indent}//#`;
}
//#
//###########################################################################
//#
export function gBuildClassFooter( className: string, indent: string = '' ): string
{
    const classHeaderLine = gBuildClassHeaderLine( className )

    return `${indent}//#
${indent}${classHeaderLine}
${indent}//###########################################################################
${indent}//#`;
}
//#
//###########################################################################
//#
export function gBuildClassDeclaration( className: string, indent: string = '' ): string
{
    const classHeader = gBuildClassHeader( className, indent )
    const classFooter = gBuildClassFooter( className, indent )

    return `${classHeader}
${indent}class ${className}
${indent}{
${indent}public:
${indent}    ${className}();
${indent}    ~${className}();
${indent}    //-----------------------------------------------------------------------
${indent}
${indent}protected:
${indent}private:
${indent}};
${classFooter}
`;
}
//#
//###########################################################################
//#
export function gBuildClassDefinition( className: string, indent: string = '' ): string
{
    const classHeader = gBuildClassHeader( className, indent )
    const classFooter = gBuildClassFooter( className, indent )

    return `${classHeader}
${indent}${className}::${className}()
${indent}{
${indent}    // constructor
${indent}}
${indent}//---------------------------------------------------------------------------
${indent}${className}::~${className}()
${indent}{
${indent}    // destructor
${indent}}
${classFooter}
`;
}
//#
//###########################################################################
//#
export function gInsertCopyrightHeader()
{
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
    }
    const insertPos = new vscode.Position( 0, 0 );
    const copyrightHeader = gCopyrightHeader();

    let snippet = `${copyrightHeader}${"\n"}`;

    editor.edit( editBuilder => {
        editBuilder.insert( insertPos, snippet );
    });
    vscode.window.showInformationMessage('Copyright header created!');
}
