// > storage --export [ collectionName optional]

const {action,isExport} = require('./workflow-execute')

module.exports = function({
    pathResolver,
    fs
}) {

    action({
        pathResolver,
        fs,
        isExport
    });

};