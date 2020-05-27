module.exports = function({
    fs,
    pathResolver
}) {

    const collectionName = argsNotParams[0].trim();

    const path = pathResolver.join(
        cwd,
        argsNotParams[1].trim()
    );

    if( fs.existsSync( path ) ) {

        if( !Storage.isExistsCollection( collectionName ) ) {

            Storage.addCollection( collectionName );

            console.log(
                chalk`\n{bold.green Added:} collection {bold.cyan ${collectionName}}`
            );

            let countsDocAdd = 0;

            fs.readdirSync( path, {
                encoding: 'utf-8',
                withFileTypes: true
            } )
            .map( item => item.name  )
            .filter( item => (
                item.split('.').pop() === 'json'
            ) )
            .filter( item => (
                item.split('-')[0] === collectionName
            ) )
            .forEach( item => {

                const doc = require(
                    pathResolver.join( path, item )
                );

                Storage.addDoc( collectionName, doc );

                console.log(
                    chalk`\t{bold.green Added:} doc {bold.cyan ${item}}`
                );

                countsDocAdd++;

            } );

            console.log(
                chalk`\n\n{bold.green Added:} {bold.yellow ${countsDocAdd}} docs\n`
            );

        } else {

            console.log(
                chalk`{bold.yellow Warning:} the collection {bold.cyan ${collectionName}} already exists.`
            );

        }

    } else {

        console.log(
            chalk`{bold.red Error:} the path: {bold.yellow ${path}} not exists.`
        );

    }

};
