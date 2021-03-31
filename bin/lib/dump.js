module.exports = function() {

    const collectionName = argsNotParams[0];

    if( Storage.isExistsCollection( collectionName ) ) {

        const docs = Storage.getDocsList( collectionName );

        console.log(
            chalk`\n\tcollection {bold.cyan ${collectionName}} have {bold.yellow ${docs.length}} docs:`
        );

        docs.forEach( docname => {

            const pathDoc = Storage.getPathDocByDocname( docname ,collectionName);

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

};