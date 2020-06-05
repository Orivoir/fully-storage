const fs = require('fs');
const pathResolver = require('path');

function resolveBaseFile( baseFile, collectionName ) {

    [
        {
            marker: '<::MARKER_COLLECTION_NAME::>',
            normalize: collectionName => collectionName
        },
        {
            marker: '<::MARKER_COLLECTION_NAME|capitalize::>',
            normalize: collectionName => collectionName.charAt(0).toUpperCase() + collectionName.slice( 1, )
        },
        {
            marker: '<::MARKER_COLLECTION_NAME|lower::>',
            normalize: collectionName => collectionName.toLowerCase()
        },
        {
            marker: '<::MARKER_COLLECTION_NAME|upper::>',
            normalize: collectionName => collectionName.toUpperCase()
        }
    ].forEach( currentMarker => {

        const {marker,normalize} = currentMarker;

        while( baseFile.indexOf( marker ) !== -1 ) {

            baseFile = baseFile.replace( marker, normalize( collectionName ) );
        }

    } );

    return baseFile;

}

module.exports = function( collectionName ) {

    Storage.addCollection( collectionName );

    const pathFixtures = pathResolver.join( cwd, './fixtures' );

    const pathFileFixtures = pathResolver.join( pathFixtures, (collectionName + '.js') );

    if( !fs.existsSync( pathFixtures ) ) {

        fs.mkdirSync( pathFixtures );

        console.log(
            chalk`{bold.green Added:} directory {bold.yellow "./fixtures"}`
        );
    }

    if( fs.existsSync( pathFileFixtures ) ) {

        console.log(
            chalk`{bold.red Error:} fixtures file {bold.cyan ${collectionName}.js} already exists in: {bold.yellow "./fixtures/${collectionName}.js"}`
        );

        process.exit();
    }

    const baseFixtures = fs.readFileSync(
        pathResolver.join( __dirname, './models-files-generated/fixture-base.txt' ),
        'utf-8'
    );

    fs.writeFileSync(
        pathFileFixtures,
        resolveBaseFile( baseFixtures, collectionName ),
        'utf-8'
    );

    console.log(
        chalk`{bold.green Added:} {bold.cyan fixtures} file {bold.yellow "./fixtures/${collectionName}.js"}\n`
    );

    const loadPathFile = pathResolver.join( cwd, './fixtures/load.js' );

    if( !fs.existsSync( loadPathFile ) ) {

        const loadFileContent = fs.readFileSync(
            pathResolver.join( __dirname, './models-files-generated/fixtures-load.txt' ),
            'utf-8'
        );

        fs.writeFileSync(
            loadPathFile,
            loadFileContent,
            'utf-8'
        );

        console.log(
            chalk`{bold.green Added:} {bold.cyan fixtures load} file {bold.yellow "./fixtures/load.js"}\n`
        );
    }

};
