module.exports = function() {

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

};
