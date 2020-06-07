module.exports = function() {

    collectionName = argsNotParams[0].trim();

    let docs = 0;

    if( Storage.isExistsCollection( collectionName ) ) {

        docs = Storage.getDocsList( collectionName ).length;
    }

    Storage.regenerate( collectionName );

    console.log(
        chalk`{bold.green Success:} collection {bold.cyan ${collectionName}} have been regenerate and {bold.yellow ${docs}} have been removed\n`
    );

};
