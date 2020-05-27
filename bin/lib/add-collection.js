module.exports = function() {

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


};
