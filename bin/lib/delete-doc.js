// > storage --delete-doc collectionName.docId

module.exports = function() {

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

};