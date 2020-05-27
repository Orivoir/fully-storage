const fs = require('fs');
const pathResolver = require('path');

/**
 *
 * @param {string} pathFolder
 * @return string[]
 */
function loopFolder( pathFolder ) {

    const items = fs.readdirSync( pathFolder, {
        encoding: 'utf-8',
        withFileTypes: true
    } );

    return items
        .map( item => (
            item.name
        ) )
        .filter( item => (
            item.split('.').pop() === 'json'
        ) )
        .map( item => (
            pathResolver.join(
                pathFolder,
                item
            )
        ) )
    ;

}

/**
 * @return string[]
 */
module.exports = function({
    pathRoot,
    recursive=false
}) {

    if(
        typeof pathRoot !== "string" ||
        !pathResolver.isAbsolute( pathRoot )
    ) {
        throw new RangeError('pathRoot should be a absolute path of a directory');
    }

    const stat = fs.statSync( pathRoot );

    if( !stat.isDirectory() ) {
        throw new RangeError('pathRoot should be a absolute path of a directory');
    }

    if( !recursive ) {

        return loopFolder( pathRoot );
    } else {

        const pathsBack = [];

        fs.readdirSync( pathRoot, {
            encoding: 'utf-8',
            withFileTypes: true
        } )
            .map( item => (
                item.name
            ) )
            .filter( item => (
                fs.statSync(
                    pathResolver.join(
                        pathRoot,
                        item
                    )
                ).isDirectory()
            ) )
            .forEach( directoryName => (
                pathsBack.push(
                    ...loopFolder(
                        pathResolver.join(
                            pathRoot,
                            directoryName
                        )
                    )
                )
            ) )
        ;

        return pathsBack;
    }

};