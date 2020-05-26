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
    COLLECTION_AND_DOC_PATTERN = /^[a-z]{1}[a-z\d\_\-]{1,63}$/i
    Storage = require('./../index')
;

global.Storage = Storage;

if( isExistsArg( 'version' ) ) {

    console.log(
        chalk`\n\t{bold.cyan full-storage} version {bold.green ${pkg.version} }\n\n\tAuthor {bold.cyan ${pkg.author}}\n`
    );

    process.exit( null );

} else if( isExistsArgWithPattern( /^delete(\-collection(\-?(n|N)ame)?)?$/i ) ) {

    const collectionName = argsNotParams[0].trim();

    if( COLLECTION_AND_DOC_PATTERN.test( collectionName ) ) {

        if( Storage.isExistsCollection( collectionName ) ) {

            Storage.deleteCollection( collectionName );

            console.log(
                chalk`\n\t{bold.green Success:} the collection: {bold.cyan ${collectionName}}, have been removed with success.`
            );

        } else {

            console.log(
                chalk`\n\t{bold.yellow Warning:} the collection with name: {bold.cyan ${collectionName}}, not exists.`
            );
        }

        process.exit( null );

    } else {

        console.log(
            chalk`\n\t{bold.red Error:} collection name: {bold.cyan ${collectionName}}, format invalid`
        );

        process.exit( 1 );
    }

} else if( isExistsArg('export') ) {

    const collectionName = argsNotParams[0].trim();

    // default path is root project
    let path = cwd;

    if( isExistsArg('path') ) {

        path = argsNotParams[1].trim();

        if( !pathResolver.isAbsolute( path ) ) {

            path = pathResolver.join( cwd, path );
        }

        if( !fs.existsSync( path ) ) {

            console.log(
                chalk`\n\t{bold.red Error:} path remote collection: {bold.yellow "${path}"}, not exists.`
            );

            process.exit( 1 );

        } else {

            const scan = fs.statSync( path );

            if( !scan.isDirectory() ) {

                console.log(
                    chalk`\n\t{bold.red Error:} path remote collection: {bold.yellow "${path}"}, should be a directory.`
                );

                process.exit( 1 );
            }
        }
    }

    if( !Storage.isExistsCollection( collectionName ) ) {

        console.log(
            chalk`\n\t{bold.yellow Warning:} collection: {bold.cyan ${collectionName}}, not exists.`
        );

        process.exit( null );
    } else {

        const docsname = Storage.getDocsList( collectionName );

        if( !docsname.length ) {

            console.log(
                chalk`\n\t{bold.yellow Warning:} collection: {bold.cyan ${collectionName}}, is empty.`
            );

            process.exit( null );
        } else {

            docsname.forEach(docname => {

                const docId = Storage.extractDocId( docname );

                fs.writeFileSync(
                    pathResolver.join(path, docname),
                    JSON.stringify(
                        Storage.getDoc(
                            collectionName,
                            docId
                        )
                    ),
                    'utf-8'
                );

            } );

            console.log(
                chalk`\n\t{bold.green Success:} {bold.yellow ${docsname.length}} docs, from: {bold.cyan ${collectionName}} has been added in: {bold.yellow "${path}"}`
            );

            process.exit( null );
        }
    }

} else if( isExistsArg('delete-doc') ) {

    // > storage --delete-doc collectionName.docId

    let [collectionName,docId] = argsNotParams[0].trim().split('.');

    if( COLLECTION_AND_DOC_PATTERN.test( collectionName ) ) {

        docId = parseInt( docId );

        if( !isNaN( docId ) ) {

            if( Storage.isExistsCollection( collectionName ) ) {

                if( Storage.isExistsDoc( collectionName, docId ) ) {

                    Storage.deleteDoc( collectionName, docId );

                    console.log(
                        chalk`\n\t{bold.green Success:} doc with id: {bold.yellow ${docId}} from collection: {bold.cyan ${collectionName}} has been removed.`
                    );

                    process.exit( null );

                } else {

                    console.log(
                        chalk`\n\t{bold.yellow  Warning:} doc with id: {bold.yellow ${docId}} from collection: {bold.cyan ${collectionName}}, not exists.`
                    );

                    process.exit( null );

                }

            } else {

                console.log(
                    chalk`\n\t{bold.yellow Warning:} collection: {bold.cyan ${collectionName}}, not exists.`
                );

                process.exit( null );
            }

        } else {

            console.log(
                chalk`\n\t{bold.red Error:} the doc id should be number`
            );

            process.exit( 1 );

        }

    } else {

        console.log(
            chalk`\n\t{bold.red Error:} collection name format invalid`
        );

        process.exit( 1 );
    }
} else if( isExistsArg( 'clear' ) ) {

    const collectionsList = Storage.getCollectionsList();

    if( !collectionsList.length ) {

        console.log(
            chalk`\n\t{bold.yellow Warning:} collections list is already clear.`
        );

        process.exit( null );

    } else {

        Storage.deleteAllCollections();

        console.log(
            chalk`\n\t{bold.green Success:} {bold.yellow ${collectionsList.length}} collection.s have been removed with success`
        );

        process.exit( null );
    }

} else if( isExistsArg( 'add-collection' ) ) {

    const collectionName = argsNotParams[0].trim();

    if( Storage.isExistsCollection( collectionName ) ) {

        console.log(
            chalk`\n\t{bold.yellow Warning:} collection {bold.cyan ${collectionName}} already exists.`
        );

    } else if( !COLLECTION_AND_DOC_PATTERN.test( collectionName ) ) {

        console.log(
            chalk`\n\t{bold.yellow Warning:} collection name format invalid`
        );

    } else {

        Storage.addCollection( collectionName );

        console.log(
            chalk`\n\t{bold.green Success:} collection {bold.cyan ${collectionName}} have been created`
        );

    }

    process.exit( null );
} else if( isExistsArgWithPattern( /collections?\-(list|dump|show)/i ) )  {

    const collectionsList = Storage.getCollectionsList();

    console.log(
        chalk`\n\t {bold.yellow ${collectionsList.length}} collection.s found.s`
    );

    collectionsList.forEach( collectionName => {

        if( typeof collectionName === "object" ) {

            collectionName = collectionName.name;
        }

        const docsLength = Storage.countDocs( collectionName );

        console.log(
            chalk`\n\t\t> collection {bold.cyan ${collectionName}} have {bold.yellow ${docsLength}} docs`
        );

    } );

    console.log('\n\n');
} else if( isExistsArgWithPattern( /^(list|dump|show)$/i ) ) {

    const collectionName = argsNotParams[0];

    if( Storage.isExistsCollection( collectionName ) ) {

        const docs = Storage.getDocsList( collectionName );

        console.log(
            chalk`\n\tcollection {bold.cyan ${collectionName}} have {bold.yellow ${docs.length}} docs:`
        );

        docs.forEach( docname => {

            const pathDoc = Storage.getPathDocByDocname( docname );

            const doc = require( pathDoc );

            console.log(
                chalk`\n\t\t> {bold.cyan ${docname}}: ({bold.yellow ${Object.keys(doc).length}} keys)\n`
            );

            console.log( '\t\t{' );

            Object.keys( doc ).forEach( attribute => {

                let value = doc[attribute];

                if( typeof value === 'string' ) {

                    value = chalk`{bold.green "${value}"}`
                } else if( typeof value === "number" ) {

                    value = chalk`{bold.yellow ${value}}`
                }

                console.log( '\t\t  ', attribute,': ', value );

            } );

            console.log('\t\t}\n');
        } );

        console.log("\n\n");

        process.exit( null );

    } else {
        console.log(
            chalk`\n\t{bold.yellow Warning:} collection {bold.cyan ${collectionName}}, not exists.\n`
        );

        process.exit( null );
    }

} else if( isExistsArg( 'import' ) ) {

    const collectionName = argsNotParams[0].trim();

    const path = pathResolver.join(
        cwd,
        argsNotParams[1].trim()
    );

    if( fs.existsSync( path ) ) {

        if( !Storage.isExistsCollection( collectionName ) ) {

            Storage.addCollection( collectionName );

            console.log(
                chalk`\n{bold.green Added:} collection {bold.cyan ${collectionName}}`
            );

            let countsDocAdd = 0;

            fs.readdirSync( path, {
                encoding: 'utf-8',
                withFileTypes: true
            } )
            .map( item => item.name  )
            .filter( item => (
                item.split('.').pop() === 'json'
            ) )
            .filter( item => (
                item.split('-')[0] === collectionName
            ) )
            .forEach( item => {

                const doc = require(
                    pathResolver.join( path, item )
                );

                Storage.addDoc( collectionName, doc );

                console.log(
                    chalk`\t{bold.green Added:} doc {bold.cyan ${item}}`
                );

                countsDocAdd++;

            } );

            console.log(
                chalk`\n\n{bold.green Added:} {bold.yellow ${countsDocAdd}} docs\n`
            );

        } else {

            console.log(
                chalk`{bold.yellow Warning:} the collection {bold.cyan ${collectionName}} already exists.`
            );

        }

    } else {

        console.log(
            chalk`{bold.red Error:} the path: {bold.yellow ${path}} not exists.`
        );

    }
}

else {

    // commands list

    console.log(
        chalk`\n\n\t{bold.cyan fully-storage} commands list:`
    );

    const commandsList = [
        {
            describe: "exports all docs of a collection from node_modules folders",
            params: [
                {
                    name: "--export",
                    isRequired: true,
                }, {
                    name: "--path",
                    isRequired: false
                }
            ],
            eg: "--exports collectionName"
        },
        {
            describe: "import all docs and create a new collection from any folders",
            params: [
                {
                    name: "--import",
                    isRequired: true,
                }, {
                    name: "--path",
                    isRequired: true
                }
            ],
            eg: "--exports collectionName --path ./collections/collectionName"
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
