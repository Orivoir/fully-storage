const version = require('./version');
const deleteCollection = require('./delete-collection');
const _export = require('./export');
const deleteDoc = require('./delete-doc');
const clear = require('./clear');
const addCollection = require('./add-collection');
const collectionsDump = require('./collections-dump');
const dump = require('./dump');
const _import = require('./import');
const regenerate = require('./regenerate');

module.exports = {
    version,
    deleteCollection,
    _export,
    deleteDoc,
    clear,
    addCollection,
    collectionsDump,
    dump,
    _import,
    regenerate
};
