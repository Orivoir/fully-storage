
const worflowLoop = require('./workflow-loop');

module.exports = {

    isExport: true,
    isImport: false,

    action: function( {
        pathResolver,
        fs,
        isExport
    } ) {

        const pathRootRead = isExport ? global.__root: global.cwd;
        const pathRootAppend = isExport ? global.cwd: global.__root;

        const actionText = isExport ? 'export': 'import';

        let collectionName = argsNotParams[0];

        if( typeof collectionName === 'string' ) {

            collectionName = collectionName.trim();

            if( !Storage.isExistsCollection( collectionName ) ) {

                console.log(
                    chalk`{bold.yellow Warning:} collection {bold.cyan ${collectionName}} not exists.\nExport have been canceled.\n\n`
                );

                process.exit( null );
            }

        } else {

            collectionName = null;
        }

        let appendPath = pathResolver.join( pathRootAppend, "collections" );

        // console.log( isExport );

        if( !fs.existsSync( appendPath ) ) {
            fs.mkdirSync( appendPath );
        }

        let items = [];

        if( !collectionName ) {

            items = worflowLoop({
                recursive: true,
                pathRoot: pathResolver.join(
                    pathRootRead,
                    '/collections'
                )
            });

        } else {

            items = worflowLoop({
                recursive: false,
                pathRoot:
                pathResolver.join(
                    pathRootRead,
                    '/collections/',
                    collectionName
                )
            });
        }

        items.forEach( item => {

            const filename = pathResolver.basename( item );

            const pathDirectory = item.replace( filename,'' );

            const collectionName = pathResolver.basename( pathDirectory );

            const pathCreate = pathResolver.join(
                appendPath,
                collectionName,
                filename
            );

            if( !fs.existsSync(
                pathResolver.join(
                    appendPath,
                    collectionName
                )
            ) ) {

                fs.mkdirSync( pathResolver.join(
                    appendPath,
                    collectionName
                ), {
                    recursive: true
                } );
            }

            if(
                !fs.existsSync(
                    pathResolver.join(
                        pathCreate
                    )
                )
            ) {

                fs.writeFileSync(
                    pathCreate,
                    JSON.stringify(
                        require( item )
                    )
                    , 'utf-8'
                );

                console.log(
                    chalk`\n\t{bold.green Added doc:} {bold.yellow "${pathCreate}" }`
                );
            }

            else {

                console.log(
                    chalk`\n\t{bold.yellow Warning doc:} {bold.yellow "${pathCreate}" } already exists`
                );
            }

        } );

        console.log(
            chalk`{bold.green Success:} {bold.cyan ${actionText}} finish.`
        );

        process.exit( null );

    }
};