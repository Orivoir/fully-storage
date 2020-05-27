module.exports = function() {

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

};
