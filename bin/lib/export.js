module.exports = function({
    pathResolver,
    fs
}) {

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

};