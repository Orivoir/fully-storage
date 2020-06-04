const fs = require('fs');

class ManagerSession {

    static DEFAULT_EXPIRES = 1e3 * 60 * 60;
    static DEFAULT_CLEAR = true;
    static SESSION_STORAGE_STATIC = 'session-storage';
    static PATTERN_STORAGE_NAME = /^session\-storage[\d]{20,60}$/

    static METHODS_NAME_STORAGE_RECOGNIZE = [
        'regenerate',
        'getDocsList',
        'getPathDocByDocname',
        'addCollection',
        'getCollectionsList',
        'deleteCollection',
        'addDoc'
    ];

    static clearStorage( storage ) {

        storage.getCollectionsList().forEach( collectionName => {

            if( ManagerSession.PATTERN_STORAGE_NAME.test( collectionName ) ) {

                storage.deleteCollection( collectionName );
            }
        } );
    }

    constructor({
        expires,
        storage
    }) {

        this.expiresID = null;
        this.storageName = this.generateStorageName();
        this.expires = expires;
        this.storage = storage;

        this.storage.addCollection( this.storageName );

        this.onClearSession = this.onClearSession.bind( this );
        this.onRequest = this.onRequest.bind( this );
        this.onSaveSession = this.onSaveSession.bind( this );

        this.expiresID = setInterval( this.onClearSession, this.expires );
    }

    getSessionPaths() {

        return this.storage.getDocsList( this.storageName )
            .map( docname => typeof docname === "object" ? docname.name: docname )
            .filter( docname => {

                const pathDoc = this.storage.getPathDocByDocname( docname );

                return !!fs.existsSync( pathDoc );
            } )
        ;
    }

    getSessionDocs() {

        return this.getSessionPaths()
            .map( docname => (
                require( this.storage.getPathDocByDocname( docname ) )
            ) )
        ;
    }

    getClientHTTP( userAgent ) {

        let backSession = null;

        this.getSessionDocs()
        .forEach( session => {

            if( session.userAgent === userAgent ) {

                backSession = session;
            }

        } );

        if( !backSession ) {

            const newSession = {
                userAgent,
                // for check expires session from save method
                lastUpdate: Date.now()
            };

            this.storage.addDoc(
                this.storageName,
                newSession
            );

            backSession = newSession;
        }

        return backSession;
    }

    onClearSession() {

        const { expires } = this ;

        this.getSessionPaths()
        .forEach( docname => {

            const session = require( this.storage.getPathDocByDocname( docname ) );

            if ( Date.now() - ( session.lastUpdate ) >= expires ) {
                // free session doc
                fs.unlinkSync( this.storage.getPathDocByDocname( docname ) );
            }

        } );
    }

    /**
     * middleware, for usage Storage as handler session HTTP
     * user recognize with user-agent
     */
    onRequest( request, response, callback ) {

        const session = this.getClientHTTP( request.headers['user-agent'] );

        this.request = request;

        request.session = session;

        request.session.save = this.onSaveSession;

        if( callback instanceof Function ) {
            // probably `next` function of free middleware
            callback();
        }

        delete this.request;
    }

    onSaveSession() {

        // remove this method for not try save
        // circular structure JSON
        // use save method after change
        // for upgrade lastUpdate at
        // for clear session data after expires delay

        const saveFunc = this.request.session.save;
        delete this.request.session.save;

        this.request.session.lastUpdate = Date.now();

        this.getSessionPaths()
        .forEach( docname => {

            const session = require( this.storage.getPathDocByDocname( docname ) );

            if( session.userAgent === this.request.session.userAgent ) {

                fs.writeFileSync(
                    this.storage.getPathDocByDocname( docname ) ,
                    JSON.stringify( this.request.session ),
                    'utf-8'
                );
            }

        } );

        this.request.session.save = saveFunc;
    }

    /**
     * close and re open expires interval
     */
    restart() {

        this.stop();
        this.expiresID = setInterval( this.onClearSession, this.expires );
    }

    /**
     * close interval expires, remove data session
     */
    stop() {

        clearInterval(this.expiresID);

        this.storage.deleteCollection( this.storageName );
    }

    /**
     * close the expires interval but not remove data session
     */
    freeze() {

        clearInterval( this.expiresID );
    }

    /**
     * generate a random storage name for can opened many times manager session
     */
    generateStorageName() {

        return ManagerSession.SESSION_STORAGE_STATIC + ( Date.now().toString() + Math.random().toString().replace('.','0') );
    }

    /**
     * @var storage {object}
     * @description storage of session data
     */
    get storage() {
        return this._storage;
    }
    set storage(storage) {

        if( typeof storage !== "object" ) {

            throw new RangeError('ManagerSession, constructor error: attribute `storage` should be a object');
        }

        ManagerSession.METHODS_NAME_STORAGE_RECOGNIZE.forEach( methodName => {

            if( !(storage[ methodName ] instanceof Function) ) {

                throw new RangeError('ManagerSession, constructor error: attribute `storage` not recognize, one or many methods not exists.');
            }

        } );

        this._storage = storage;
    }

    /**
     * @var expires {number}
     * @description time life of session user
     */
    get expires() {
        return this._expires;
    }
    set expires(expires) {

        expires = parseInt( expires );

        if( isNaN( expires ) ) {
            expires = ManagerSession.DEFAULT_EXPIRES;
        }

        this._expires =  expires;
    }

};

module.exports = ManagerSession;
