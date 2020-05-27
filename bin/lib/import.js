// > storage --import [ collectionName optional]


const {action,isImport} = require('./workflow-execute')

module.exports = function({
    fs,
    pathResolver
}) {

    action({
        pathResolver,
        fs,
        isImport
    });

};
