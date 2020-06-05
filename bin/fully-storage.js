#!/usr/bin/env node

// > storage --export [ collectionName optional] [--path path optional]
// > storage --import [ collectionName optional] [--path path optional]
// > storage --delete collectionName
// > storage --add-collection collectionName
// > storage --delete-doc collectionName(.|-|->|=>)docId
// > storage --clear
// > storage --version
// > storage --collections?-(list|dump|show)
// > storage --(list|dump|show) collectionName

// > storage --fixtures {collectionName}
// > storage --fixtures-load ?{collectionName}

const
    argsNotParams = [],
    pathResolver = require('path'),
    fs = require('fs'),
    pkg = require('./../package.json'),
    args = process.argv
        .slice( 2, )
        .filter( arg => {

            if(arg.slice( 0,2 ) === "--") {
                return true;
            }
            else {
                argsNotParams.push( arg )
                return false;
            }
        } )
        .map( arg => (
            arg.slice( 2, )
        ) )
    ,
    isExistsArg = argname => (
        args.find( arg => (
            arg === argname
        ) )
    ),
    isExistsArgWithPattern = argregex => (
        args.find( arg => (
            argregex.test( arg )
        ) )
    ),
    cliui = require('cliui')(),
    cwd = process.cwd(),
    chalk = require('chalk'),
    COLLECTION_AND_DOC_PATTERN = /^[a-z]{1}[a-z\d\_\-]{1,63}$/i,
    {
        version,
        deleteCollection,
        _export,
        deleteDoc,
        clear,
        addCollection,
        collectionsDump,
        dump,
        _import,
        regenerate,
        fixtures,
        fixturesLoad
    } = require('./lib/endpoint'),
    Storage = require('./../index')
;

global.Storage = Storage;
global.argsNotParams = argsNotParams;
global.isExistsArg = isExistsArg;
global.isExistsArgWithPattern = isExistsArgWithPattern;
global.pkg = pkg;
global.COLLECTION_AND_DOC_PATTERN = COLLECTION_AND_DOC_PATTERN;
global.cwd = cwd;
global.chalk = chalk;
global.__root = pathResolver.resolve( __dirname, './../' );

if( isExistsArg( 'version' ) ) {

    version();

} else if( isExistsArgWithPattern( /^delete(\-collection(\-?(n|N)ame)?)?$/i ) ) {

    deleteCollection();

} else if( isExistsArg('export') ) {

    _export( {
        pathResolver,
        fs
    } );

} else if( isExistsArg('delete-doc') ) {

    deleteDoc();

} else if( isExistsArg( 'clear' ) ) {

    clear();

} else if( isExistsArg( 'add-collection' ) ) {

    addCollection();

} else if( isExistsArgWithPattern( /collections?\-(list|dump|show)/i ) )  {

    collectionsDump();

} else if( isExistsArgWithPattern( /^(list|dump|show)$/i ) ) {

    dump();

} else if( isExistsArg( 'import' ) ) {

    _import({
        pathResolver,
        fs
    })
} else if( isExistsArgWithPattern( /(regenerate|truncate)/i ) ) {

    regenerate();
} else if( isExistsArg( 'fixtures' ) ) {

    let collectionName = argsNotParams[0];

    if( !COLLECTION_AND_DOC_PATTERN.test( collectionName ) ) {

        console.log(
            chalk`{bold.red Error:} collection name: {bold.cyan ${collectionName}} invalid`
        );

        process.exit( null );
    }

    collectionName = collectionName.trim();


    fixtures( collectionName );

} else if( isExistsArg( 'fixtures-load' ) ) {

    fixturesLoad();
}

else {

    // commands list

    console.log(
        chalk`\n\n\t{bold.cyan fully-storage} commands list:`
    );

    const commandsList = [
        {
            describe: "exports all docs from node_modules folders",
            params: [
                {
                    name: "--export",
                    isRequired: true,
                }
            ],
            eg: "--exports"
        },
        {
            describe: "import all docs and create new collections from collections folder at root of your project",
            params: [
                {
                    name: "--import",
                    isRequired: true,
                }
            ],
            eg: "--exports collectionName"
        },
        {
            describe: "remove all docs of a collection but not remove collection",
            params: [
                {
                    name: "--regenerate",
                    isRequired: true,
                }
            ],
            eg: "--regenerate collectionName"
        },
        {
            describe: "create a new collection",
            params: [
                {
                    name: "--add-collection",
                    isRequired: true,
                }
            ],
            eg: "--add-collection collectionName"
        },
        {
            describe: chalk`delete all collections, {bold.yellow warn not ask confirm action}`,
            params: [
                {
                    name: "--clear",
                    isRequired: true,
                }
            ],
            eg: "--clear"
        },
        {
            describe: chalk`delete a specific doc`,
            params: [
                {
                    name: "--delete-doc",
                    isRequired: true,
                }
            ],
            eg: "--delete-doc collectionName.docId"
        },
        {
            describe: chalk`delete a specific collection`,
            params: [
                {
                    name: "--delete",
                    isRequired: true,
                }
            ],
            eg: "--delete collectionName"
        },
        {
            describe: chalk`get current version of {bold.cyan fully-storage}`,
            params: [
                {
                    name: "--version",
                    isRequired: true,
                }
            ],
            eg: "--version"
        },
    ];

    commandsList.forEach( commandItem => {

        const div = [
            {
                text: chalk`{bold.cyan describe:} ${commandItem.describe}`,
                width: 65,
                padding: [ 3, 15, 1, 3 ]
            }
        ];

        commandItem.params.forEach( param => {
            div.push( {
                text: chalk`${param.name}{bold.red ${param.isRequired ? " [required]": "" }}`,
                padding: [ 3, 3, 1, 3 ],
                width: 42
            } );
        } );

        cliui.div(...div);

        cliui.div( {
            text: chalk`{bold.yellow eg} {bold.cyan > storage --} ${commandItem.eg}`,
            padding: [ 0, 3, 1, 3 ]
        } );

    } );

    console.log( cliui.toString() );
}
