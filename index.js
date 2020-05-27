/*
    / collections
        / users
            - {id-doc}.json
        / {doc-name}
            - {id-doc}.json

    doc {
        "column-name": "column-value"
    }
*/

const fs = require('fs');
const pathResolver = require('path');

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
    sessionOptions: null,
    expiresID: null,

    sessionStart( {
        expires = ( 1e3 * 60 * 60 ), // 1hours default expires session
        isClearBetweenCall = true
    } ) {

        if( this.isStartSession ) {
            throw "start session already active";
        }

        const collectionName = 'session-storage';

        if( !!isClearBetweenCall ) {

            this.regenerate( collectionName );
        } else {

            this.addCollection( collectionName );
        }

        this.sessionOptions = {
            collectionName,
            expires: typeof expires === "number" ? expires: (1e3*60*60)
        };

        this.isStartSession = true;

        this.onClearSession = this.onClearSession.bind( this );

        this.expiresID = setInterval( this.onClearSession , expires );

        this.onRequest = this.onRequest.bind( this );

        return this.onRequest;
    },

    sessionStop() {

        if( !this.isStartSession ) {

            throw "session is not active";
        }

        this.deleteCollection( this.sessionOptions.collectionName );
        clearInterval( this.expiresID );
        this.isStartSession = false;
    },

    onClearSession() {

        const { expires } = this.sessionOptions;

        this.getSessionDocs()
        .forEach( pathDoc => {

            const session = require( pathDoc );

            if ( Date.now() - ( session.lastUpdate ) >= expires ) {

                // free session doc
                fs.unlinkSync( pathDoc );
            }

        } );

    },

    getSessionDocs() {

        const {collectionName} = this.sessionOptions;

        return fs.readdirSync( pathResolver.join( this.pathCollectionList, collectionName ) , {
            encoding: 'utf-8',
            withFileTypes: true
        } ).map( docname => {

            if( typeof docname === "object" ) {
                docname = docname.name;
            }

            return this.getPathDoc(
                collectionName,
                this.extractDocId( docname )
            )
        } );
    },

    getClientHTTP( userAgent ) {

        const {collectionName} = this.sessionOptions;
        let backSession = null;

        this.getSessionDocs()
        .forEach( pathDoc => {

            if( this.isClientHTTP( pathDoc, userAgent ) ) {

                backSession = require( pathDoc );
            }

        } );

        if( !backSession ) {

            const newSession = {
                userAgent,
                lastUpdate: Date.now()
            };

            this.addDoc(
                collectionName,
                newSession
            );

            backSession = newSession;
        }

        return backSession;
    },

    isClientHTTP( pathDoc, userAgent ) {

        let isClient = false;

        if( fs.existsSync( pathDoc ) ) {

            const session = require( pathDoc );

            isClient = session.userAgent === userAgent;

        }

        return isClient;


    },

    /**
     * middleware, for usage Storage as handler session HTTP
     * user recognize with user-agent
     */
    onRequest( request, response, next ) {
        const session = this.getClientHTTP( request.headers['user-agent'] );


        request.session = session;

        request.session.save = () => {
            // remove this method for not try save
            // circular structure JSON
            // use save method after change
            // for upgrade lastUpdate at
            // for clear session data after expires delay
            delete request.session.save;

            request.session.lastUpdate = Date.now();

            this.getSessionDocs()
            .forEach( pathDoc => {

                if( this.isClientHTTP(
                    pathDoc, request.session.userAgent
                ) ) {

                    fs.writeFileSync(
                        pathDoc,
                        JSON.stringify( request.session ),
                        'utf-8'
                    );
                }

            } );
        } ;

        // free midlleware
        if( next instanceof Function ) {
            next();
        }
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

        const collectionName = docname.split('-')[0];

        const docId = docname.split('-')[1].split('.')[0];

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
    }

};

module.exports = Storage;
