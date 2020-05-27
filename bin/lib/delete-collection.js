module.exports = function() {

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

};