const pathResolver = require('path');
const fs = require('fs');

module.exports = function() {

    const loadFilePath = pathResolver.join( cwd, './fixtures/load.js' );

    if( !fs.existsSync( loadFilePath ) ) {

        console.log(
            chalk`{bold.red Error:} load file not exists in {bold.yellow "./fixtures/load.js"}\nyou should execute {bold.yellow --fixtures collectionName} before load fixtures.\n`
        );

        process.exit();
    } else {

        const {execSync} = require('child_process');

        const output = execSync(  `node ${loadFilePath}`, {
            encoding: 'utf8'
        } );

        console.log( output );
    }

};
