const
    {expect, assert} = require('chai'),
    Storage = require('./../index'),
    pathResolver = require('path'),
    fs = require('fs'),
    UsersAPI = require('fully-storage-users-api')
;

const ROOT_COLLECTION = pathResolver.join(
    __dirname,
    './../collections'
);

describe('test UsersAPI implement Storage', () => {

    after( () => {
        // clean storage
        Storage.deleteAllCollections();
    } );

    it('should append the: user collection', () => {

        Storage.addUsersCollection({
            passwordHash: {
                hash: 'bcrypt'
            }
        });

        assert.isTrue(
            fs.existsSync(
                pathResolver.join(
                    ROOT_COLLECTION,
                    'users'
                )
            )
        );

    } );

    describe('should implement methods:', () => {

        UsersAPI.STORAGE_METHODS_NAME_IMPLEMENTS.forEach( methodName => {

            const messageIt = `should exists method: "${methodName}"`;

            it( messageIt, () => {

                assert.isFunction( Storage[ methodName ] );

            } );

        } )

    } );

    it('should create user and auto hash password', () => {

        const userPost = {
            pseudo: 'foobar',
            password: 'secret ^.^',
        };

        const response = Storage.addUser( userPost );

        const user = response.user;

        const userGet = Storage.getUserById(
            user.id
        );

        assert.isObject( userGet );

        assert.isString( userGet.id );

        assert.isString( userGet.token );
    } );

    describe('test get user method', () => {

        const userPost = {
            pseudo: 'lorem21',
            password: 'secret ^.^',
        };

        it('test get user by matcher:', () => {

            Storage.addUser( userPost );

            const users = Storage.getUsersBy( {
                pseudo: 'lorem21'
            } );

            assert.isArray( users );
            assert.isObject( users[0] );

            expect( users[0].pseudo ).to.be.equal( 'lorem21' );

        } );

    } );

    describe('test authentication', () => {

        const plainPassword = 'secret ^.^';

        const userPost = {
            pseudo: 'loremIpsum',
            email: 'loremIpsum@hotmail.com',
            password: plainPassword,
        };

        it('should success authentication', () => {

            Storage.addUser( userPost );

            const response = Storage.authentication( {
                login: userPost.email,
                password: plainPassword
            } );

            assert.isObject( response );

            assert.isTrue( response.success );

        } );

        it('should error authentication', () => {

            userPost.email = "abc@def.gmail.com";
            Storage.addUser( userPost );

            const response = Storage.authentication( {
                login: userPost.email,
                password: "bad password"
            } );

            assert.isObject( response );

            assert.isFalse( response.success );

        } );

    } );

} );
