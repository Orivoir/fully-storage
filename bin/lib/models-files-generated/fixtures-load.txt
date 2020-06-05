/**
* this file is use by command `--fixture-load` **do not change filename**
*/
const args = process.argv.slice( 2, );

let collectionName = args[0];

const fs = require('fs');
const pathResolver = require('path');
const fullyStorage = require('fully-storage');

const faker = fullyStorage.createFaker('en_US');

const load = pathFixturesFile => {

    const Fixtures = require( pathFixturesFile );

    // faker.locality = Fixtures.locality;

    const fixture = new Fixtures( faker );

    fixture.onLoad();

    console.log(
        `\n\t> ${pathResolver.basename(pathFixturesFile)} have been loaded.\n`
    );
};

if( collectionName ) {

    collectionName = collectionName.trim();

    const pathFixturesFile = pathResolver.join( __dirname, ( collectionName + '.js' ) );

    load( pathFixturesFile );

} else {

    // load all fixtures

    fs.readdirSync( __dirname, {
        encoding: "utf-8",
        withFileTypes: true
    } )
    .map( item => typeof item === "object" ? item.name: item )
    .filter( item => {

        const ext = item.split('.').pop();
        return ext === 'js';
    } )
    /* .filter( item => {

        const stat = fs.statSync( pathResolver.join( __dirname, item ) );

        return stat.isFile();
    }  ) */
    .filter( item => {

        return item !== "load.js";

    } )
    .forEach( fixtureFileName => {

        load( pathResolver.join( __dirname, fixtureFileName ) );

    } );
}
