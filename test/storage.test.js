// should be attach to: ./server/lib/storage directory
const
    {expect, assert} = require('chai'),
    Storage = require('./../index'),

    methods = require('./factory-data/methods.json'),
    fs = require('fs'),
    pathResolver = require('path')
;

const ROOT_COLLECTION = pathResolver.join(
    __dirname,
    './../collections'
);

describe('storage module test', () => {

    after( () => {
        // clean storage
        Storage.deleteAllCollections();
    } );

    it('should be a object', () => {

        assert.isObject( Storage );
    } );

    describe('should exists methods:', () => {

        Object.keys( methods ).forEach( methodName => {

            let itMessage = `method: "${methodName}", should be exists`;

            it( itMessage, () => {

                assert.isFunction( Storage[ methodName ] );

            }  );

            const argsLength = methods[methodName].args;

            itMessage = `method: "${methodName}", should await: ${argsLength} params`;

            it( itMessage, () => {

                expect( Storage[ methodName ] ).to.be.lengthOf( argsLength );

            } );

        } );

    } );

    describe('should create element inside storage', () => {

        describe('should append collections:', () => {

            const collections2create = require('./factory-data/create.collections.json');
            assert.isArray( collections2create );
            collections2create.forEach( collectionName => {

                assert.isString( collectionName );

                const itMessage = `should append a collection: "${collectionName}"`;

                it( itMessage, () => {

                    Storage.addCollection( collectionName );

                    const isExists = fs.existsSync(
                        pathResolver.join(
                            ROOT_COLLECTION,
                            collectionName
                        )
                    );

                    expect( isExists ).to.be.equal( true );

                    const isExistsFromStorage = Storage.isExistsCollection( collectionName );

                    expect( isExistsFromStorage ).to.be.equal( true );

                } );
            } );

        } );

        describe('should append documents:', () => {

            const docs2create = require('./factory-data/create.docs.json');

            docs2create.forEach( doc => {

                let itMessage = `should create document child of: "${doc["collection-parent"]}"`;

                let currentDocId = null;
                let currentCollectionName = null;

                it( itMessage, () => {
                    const docId = Storage.addDoc(
                        doc['collection-parent'],
                        doc.state
                    );

                    const isExistsDoc = Storage.isExistsDoc(
                        doc['collection-parent'], docId
                    ) ;

                    currentCollectionName = doc['collection-parent'];
                    currentDocId = docId;

                    expect( isExistsDoc ).to.be.equal( true );
                } );

                itMessage = `document create should contains a object`;

                it( itMessage, () => {

                    const state = Storage.getDoc(
                        currentCollectionName,
                        currentDocId
                    );

                    assert.isObject( state );

                } );

            } );

        } );

    } );


} );
