const fs = require('fs');
const pathResolver = require('path');
const UsersApi = require('fully-storage-users-api');
const GeneratorFixtures = require('fully-storage-faker-api');
const ManagerSession = require('./lib/manager-session/manager-session');

if( !fs.existsSync(
    pathResolver.join( __dirname, "collections" )
) ) {
    fs.mkdirSync(
       pathResolver.join( __dirname, "collections" )
    );
}

const Storage = {

    get IS_FORCE() {

        return true;
    },

    get AUTO_SAVE_ID() {

        return true;
    },

    isStartSession: false,
    expiresID: null,
    sessionManager: [],

    apis: {},

    getSessionManager() {

        if( this.sessionManager.length === 1 ) {

            return this.sessionManager[0];
        } else {

            return this.sessionManager;
        }
    },

    addSessionManager( sessionManager ) {

        this.sessionManager.push( {
            manager: sessionManager,
            collectionName: sessionManager.storageName
        } );
    },

    sessionStart( {
        expires = ( 1e3 * 60 * 60 ), // 1hours default expires session
        clear = true,
        autoSave = true
    } ) {

        if( !!clear ) {
            ManagerSession.clearStorage( Storage );
        }

        const sessionManager = new ManagerSession({
            expires,
            autoSave,
            storage: Storage
        });

        this.addSessionManager( sessionManager );

        return sessionManager.onRequest;
    },

    // read only
    get pathCollectionList() {

        return pathResolver.join(
            __dirname, '/collections'
        );
    },

    // TRUNCATE
    regenerate( collectionName ) {

        this.deleteCollection(  collectionName )
        this.addCollection( collectionName );
    },

    isExistsCollection( collectionName ) {

        const pathCollection = pathResolver.join(
            this.pathCollectionList,
            collectionName
        );
        return !!fs.existsSync( pathCollection );
    },

    isExistsDoc(collectionName, docId ) {

        if( this.isExistsCollection( collectionName ) ) {

            const pathDoc = this.getPathDoc( collectionName, docId );

            return !!fs.existsSync( pathDoc );
        }

        return false;

    },

    getDocName( collectionName, docId ) {

        return ( collectionName + '-' + docId ) + '.json';

    },

    extractDocId( docname ) {

        if( typeof docname === "object" ) {

            docname = docname.name;
        }

        return parseInt( docname.split('-').pop().split('.')[0].trim() );
    },

    getPathDoc( collectionName, docId ) {

        return pathResolver.join(
            this.pathCollectionList,
            collectionName,
            this.getDocName( collectionName, docId )
        );

    },

    getPathDocByDocname( docname ) {

        return this.getPathDoc( ...this.explodeDocname( docname ) );
    },

    getDoc( collectionName, docId ) {

        if( this.isExistsDoc( collectionName, docId ) ) {

            return require(
                this.getPathDoc(
                    collectionName, docId
                )
            );

        }

        return null;

    },

    getDocByDocname( docname ) {

        return this.getDoc( ...this.explodeDocname( docname ) );
    },

    getCreateAtDoc( collectionName, docId ) {

        const stat = this.getStatDoc( collectionName, docId );

        if( !!stat ) {

            return stat.birthtimeMs;

        } else {

            return null;
        }
    },

    getCreateAtDocByDocname( docname ) {

        return this.getCreateAtDoc( ...this.explodeDocname( docname ) );
    },

    getLastUpdateAtDoc( collectionName, docId ) {

        const stat = this.getStatDoc( collectionName, docId );

        if( !!stat ) {

            return stat.mtimeMs;

        } else {

            return null;
        }
    },

    getLastUpdateAtDocByDocname( docname ) {

        return this.getLastUpdateAtDoc( ...this.explodeDocname( docname ) );

    },

    getStatDoc( collectionName, docId ) {

        const pathDoc = this.getPathDoc( collectionName, docId );

        if( fs.existsSync( pathDoc ) ) {

            return fs.statSync( pathDoc );
        }

        return null;
    },

    explodeDocname( docname ) {

        const collectionName = docname.split('-').slice( 0, -1 ).join('-');

        const docId = docname.split('-').pop().split('.')[0];

        return [ collectionName, docId ];

    },

    getDocBy( collectionName, key, value ) {

        if( !this.isExistsCollection( collectionName ) ) {

            return null;
        }

        let docFound = null;

        this.getDocsList( collectionName )
        .forEach( docname => {

            const pathDoc = pathResolver.join(
                this.pathCollectionList,
                collectionName,
                docname
            );

            if( !fs.existsSync( pathDoc ) ) return;

            const doc = require( pathDoc );

            if( doc [ key ] === value ) {

                docFound = doc;
            }

        } );

        return docFound;
    },

    countDocs( collectionName, isForce = false ) {

        if( !this.isExistsCollection( collectionName ) ) {

            if( isForce ) {

                this.addCollection( collectionName );
                return 0;

            } else {

                return null;
            }

        } else {

            const pathCollection = pathResolver.join(
                this.pathCollectionList,
                collectionName
            );

            return fs.readdirSync(
                pathCollection,
                {
                    encoding: "utf-8"
                }
            ).length;
        }
    },

    pushDoc( collectionName, docId, state ) {

        fs.writeFileSync(
            pathResolver.join(
                this.pathCollectionList,
                collectionName,
                this.getDocName( collectionName, docId )
            ),
            JSON.stringify( state ),
            'utf-8'
        );

        return docId;
    },

    updateDoc( collectionName, docId, state, isForce = false ) {

        if( !this.isExistsDoc( collectionName, docId ) ) {

            if( isForce ) {

                if( !this.isExistsCollection( collectionName ) ) {

                    this.addCollection( collectionName );
                }

                return this.addDoc( collectionName, state );

            } else {

                return null;
            }
        }

        return this.pushDoc( collectionName, docId, state );

    },

    addDoc( collectionName, state, autoSaveId = false ) {

        let docId = null;

        if( !this.isExistsCollection( collectionName ) ) {

            this.addCollection( collectionName );
            docId = 0;
        } else {

            docId = this.countDocs( collectionName );
        }

        if( !!autoSaveId ) {

            state[ ( typeof autoSaveId === "string" ? autoSaveId : "id" ) ] = docId;
        }

        this.pushDoc(
            collectionName, docId, state
        );

        return docId;
    },

    deleteDoc( collectionName, docId ) {

        if( !this.isExistsDoc( collectionName, docId ) ) {

            return null;
        }

        fs.unlinkSync(
            this.getPathDoc(
                collectionName, docId
            )
        );

        return true;

    },

    deleteCollection( collectionName ) {

        if( !this.isExistsCollection( collectionName ) ) {

            return null;
        }

        const removeCollection = () => {

            fs.rmdirSync(
                pathResolver.join(
                    this.pathCollectionList,
                    collectionName
                ), {
                    retryDelay: 250,
                    maxRetry: 10,
                    recursive: true, // try force remove of folders with child item.s
                }
            );
        };

        try {
            removeCollection();

        } catch( e ) {

            if( /^ENOTEMPTY|EPERM $/.test(e.code) ) {
                // if error associate to "Error Not Empty" or "Error Permission"
                // try remove all files inside collection folder
                // before remove folder
                this.clearCollection( collectionName );
                removeCollection();
            }
        }

        return true;

    },

    clearCollection( collectionName ) {

        if( !this.isExistsCollection( collectionName ) ) {

            return null;
        }

        fs.readdirSync(
            pathResolver.join(
                this.pathCollectionList,
                collectionName
            ), {
                encoding: "utf-8",
                withFileTypes: true
            }
        ).forEach( docname => {

            this.deleteDoc(
                collectionName,
                this.extractDocId( docname )
            );

        } );

    },

    deleteAllCollections() {

        this.getCollectionsList()
        .forEach( collectionName => {
            this.deleteCollection( collectionName );
        } );

    },

    addCollection( collectionName ) {

        if( this.isExistsCollection( collectionName ) ) {

            return null;
        } else {

            const pathCollection = pathResolver.join(
                this.pathCollectionList,
                collectionName
            );

            fs.mkdirSync(
                pathCollection
            );

            return true;
        }

    },

    getCollectionsList() {

        return fs.readdirSync( this.pathCollectionList, {
            encoding: 'utf-8'
        } );
    },

    get collectionsList() {

        return this.getCollectionsList();
    },

    getDocsList( collectionName, isForce = false ) {

        if( !this.isExistsCollection( collectionName ) ) {

            if( !!isForce ) {
                this.addCollection( collectionName );
            } else {

                return null;
            }
        }

        const pathCollection = pathResolver.join(
            this.pathCollectionList,
            collectionName
        );

        return fs.readdirSync( pathCollection, {
            encoding: 'utf-8',
            withFileTypes: true, // get extension files
        } ).map( item => {

            if( typeof item === "object" ) {

                return item.name;
            } else {

                return item;
            }

        } );
    },

    addUsersCollection( config ) {

        UsersApi.STORAGE_METHODS_NAME_IMPLEMENTS.forEach( methodName => {

            if( this[ methodName ] instanceof Function ) {

                throw new RangeError('UserAPI already call on this storage.');
            }

        } );

        if( typeof config === "object" ) {

            this.apis.users = new UsersApi( config );

            this.apis.users.storage = this;

            this.apis.users.addUsersCollection();

        } else {

            throw new RangeError('Storage Error: addUsersCollection method arg1: config ,should be a object');
        }

    },

    createFaker( locality ) {

        const faker = new GeneratorFixtures({
            locality,

            isAppendOneTime: false,

            onAppend: this.onAppendFixtures
        });

        return faker;
    },

    onAppendFixtures( {
        options,
        state
    } ) {

        const {collectionName} = options;

        if( typeof collectionName !== "string" ) {

            throw new RangeError("fully-storage fixtures error: you should set: faker.options.collectionName, before execute fixtures");
        }

        if( !Storage.isExistsCollection( collectionName ) ) {

            Storage.addCollection( collectionName );
        }

        Storage.addDoc(
            collectionName,
            state,
            !!options.AUTO_SAVE_ID
        );
    }
};

module.exports = Storage;
