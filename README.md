# [fully-storage](https://npmjs.com/package/fully-storage)

> fully-storage is a simple **no-sql** data store with an **HTTP session** manager implemented

- [installation](#installtation)

- [store](#store)

- [store usage](#basic-usage)
    - [create collection](#create-collection)
    - [create doc](#create-doc)
    - [get doc](#get-doc)
    - [docs list](#docs-list)
    - [update doc](#update-doc)
    - [delete doc](#delete-doc)
    - [stat doc](#stat-doc)
    - [delete collection](#delete-collection)
    - [collection list](#collection-list)
- [HTTP session manager](#HTTP-session-manager)
    - [session-start](#session-start)
    - [session-stop](#session-stop)
    - [usage as middleware](#usage-as-middleware)
- [CLI usage](#cli-usage)
    - [workflow](#workflow)
        - [export](#export)
        - [import](#import)
    - [delete](#delete)
        - [delete-collection](#delete-collection)
        - [delete-doc](#delete-doc)
    - [add-collection]
    - [dump]
        - [dump-collections-list](#dump-collections-list)
        - [dump-docs-list](#dump-docs-list)

## installtation

You can local install **fully-storage** with your handler dependencies favorite

```bash
npm install fully-storage --save
```

or with yarn

```bash
yarn add fully-storage
```

## store

The data store and stored in folders called collections and the entries are stored in JSON files called doc inside the fully-storage collections created one file per entry.
For comparison to relational database management systems, collections are tables and docs are entries.

### store usage

```js

const fullyStorage = require('fully-storage');

```

### create collection

A collection is a new list of docs ( entries ), you can made a collect*ions for data game of: users, commentaries, articles...

```js

fullyStorage.addCollection('users');
fullyStorage.addCollection('articles');

```

If collections you attempts create already exists, she are not erase,
you should explicit ask erase collection for execute this action, with: `fullyStorage.deleteCollection( collectionName )`

### create doc

During the exec of your app you have need add docs ( entries ) inside your collection,
during post of a new article, register of new users ect...

```js

const collectionName = "article";

const doc = {

    contentText: "Excepteur elit esse irure laborum duis sint magna.",
    imageUrl: "https://i.picsum.photos/id/237/500/500.jpg",
    createAt: Date.now()
};

const docId = fullyStorage.addDoc(
    collectionName,
    doc
);

console.log( docId );
```

You can see fully storage have attribute a uniq id for doc ( number auto increment ) but your entry article have not id,
you can update the doc and add the `docId`, but more easy give third arg with `true` value for fully-storage auto add id key inside your
doc with the value equal to the docId.

```js
const collectionName = "article";

const doc = {

    contentText: "Excepteur elit esse irure laborum duis sint magna.",
    imageUrl: "https://i.picsum.photos/id/237/500/500.jpg",
    createAt: Date.now()
};

const docId = fullyStorage.addDoc(
    collectionName,
    doc,
    true // AUTO SAVE ID
);

console.log( docId );
```

You can make reference to auto save id with the constant: `fullyStorage.AUTO_SAVE_ID`

```js
const docId = fullyStorage.addDoc(
    collectionName,
    doc,
    fullyStorage.AUTO_SAVE_ID
);

```

### get doc

For show data inside a user interface you have needs get a specific doc or a docs list,
for get a specific, you have need of the collection name and the doc id auto generate.

You can think during a request HTTP for get a specific article,

exemple with HTTP router [express](https://npmjs.com/package/express):

```js

const express = require('express');
const app = express();
const server = require('http').Server( app );

const fullyStorage = require('fully-storage');

fullyStorage.addCollection('articles');

app
    .get('/article/:id', ( request, response ) => {

        response.type('json');

        const {id} = request.params;

        const article = fullyStorage.getDoc('articles', id);

        if( article ) {

            response.status( 200 );

            response.json({
                success: true,
                statusCode:200,
                statusText: "Success",

                data: article
            })

        } else {

            response.status( 404 );

            response.json({
                success: false,
                statusCode: 404,
                statusText: "Not found",
            });
        }

    } )
;

server.listen( 3001, () => {

    console.log( 'server run...' )

}  );
```

The method `fullyStorage.getDoc` return `null` if not found doc.


### docs list

You can have needs get all docs of any collection for your interface, API or any sorted of data,
you can use the method: `fullyStorage.getDocsList( collectionName )` for get the list of docnames inside the collection name

```js


const articles = [];

const docsname = fullyStorage.getDocsList( 'articles' );

docsname.forEach( docname => {

    articles.push(
        fullyStorage.getDocByDocname( docname )
    );

} );

console.log( articles );
```

The method: `fullyStorage.getDocByDocname` is equal to `fullyStorage.getDoc` but await a docname in argument 1 while `fullyStorage.getDoc` await collectionName and docId.

A docname is composed of: `{collectionName}-{id}.json`

And its sorted inside:

- /node_modules/
    - / fully-storage
        - / collections
            - / {collectionName}
                - {collectionName}-{id}.json

### update doc

During the exec of your app you can have need update a doc

```js

const article = fullyStorage.getDoc( 'articles', 0 );

article.text = "Nostrud labore nisi laborum mollit proident elit dolor tempor.";
article.lastUpdate = Date.now();

fullyStorage.updateDoc( 'articles', 0, article );

```

you can ask a update with force,
if the doc and/or the collection name not exists
the collection name and/or the doc is create

```js

fullyStorage.updateDoc(

    'articles',
    0,
    {
        text: "Reprehenderit dolore exercitation ex elit ea esse."
    },
    fullyStorage.IS_FORCE
);
```

### delete doc

You can delete a specific doc with the collection name and the doc id

```js

fullyStorage.deleteDoc( 'articles', 0 );

```

### exists

You can make existing test on doc and collection

### exists doc

you can test if a specific doc exists with collection name and doc id

```js

const isExists = fullyStorage.isExistsDoc( 'articles', 0 );

if( isExists === true ) {

    console.log('hi exists');
} else {

    console.log( 'hi not exists');
}
```

### exists collection

you can test if a collection exists with collection name

```js

const isExists = fullyStorage.isExistsCollection( 'articles' );

if( isExists === true ) {

    console.log('she exists');
} else {

    console.log( 'she not exists');
}
```

### stat doc

The doc is stored inside file also you can ask stat of doc as file:

create at, last update at ...

```js

const createAt = fullyStorage.getCreateAtDoc( 'articles', 0 );

const lastUpdateAt = fullyStorage.gegetLastUpdateAtDoc('articles', 0 );

```

The time is give with timestamp ms,
you can get a full stats doc with:
`fullyStorage.getStatDoc( collectionName, docId )`

This method return a native [fs.stats](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_class_fs_stats) object.

### delete collection

You can delete a collection with:

`fullyStorage.deleteCollection( collectionName )`

### collection list

You can get the list of collections with attribute:

`fullyStorage.collectionsList`

## HTTP session manager

You can use fully-storage as manager HTTP session,
very easy usage the recognize client is based on user-agent of
the headers request, the storage structure is identical to storage outside
manager session:

- /node_modules
    - /fully-storages
        - /collections
            - /session-store

fully-storage create a collection for stock the session with the name
session-store, you should not use this name for another collection
the collection name: `session-store` is reserved by fully-storage

### session start

you should call the method: `fullyStorage.sessionStart`,
for start a new handler session HTTP

```js

const http = require('http');

const fullyStorage = require('fully-storage');

const onRequest = fullyStorage.sessionStart({

    // time in ms default 1hours
    expires: ( 1e3 * 60 * 60 ),

    // if the session store is clear between 2 call to sessionStart for prod
    // should be true
    // for dev if you want persist your session data
    // between on/off app you can give false value
    isClearBetweenCall: true,

});

const server = http.createServer( function( request, response ) {

    onRequest( request, response );

    if( !request.session.test ) {

        request.session.test = Math.random();
        request.session.save();
    }

    res.end( `test session value is: ${request.session.test}` );

} );

```

### session-stop

If you want manually destroy the manager session you can call:
`fullyStorage.sessionStop()`


### usage as middleware

you can use the manager session as middleware with [Express](https://npmjs.com/package/Express)

```js

```

## cli usage

the fully-storage implement a CLI for have overview handler of store
and resolve the /node_modules/ storage

from your package.json you can add scripts key

```json
{
    "scripts": {
        "storage": "storage"
    }
}
```

or you can access to cli with:

```bash
> ./node_modules/.bin/storage
```

### workflow

#### export

The command `export`, traced back the store from: node_modules folders
to: your project

with npm key script:
```bash
> npm run store -- --export articles --path ./collections/articles
```

The folders `collections` and `articles` should exists before execute command,
the `--path` argument is optional but is recomanded,
if you dont give `--path` argument the docs is traced back inside root of your project.

You should execute this command before remove the node_modules, folder
for not lost your store data

```bash
> ./node_modules/bin/storage --export articles --path ./collections/articles
```

#### import

if you have need import a collection you can use the `import` command

with npm key script:
```bash
> npm run store -- --import articles --path ./collections/articles
```

Here article is the collection name create and the docs
inside articles is the docs import,
if the collection articles already exists command is reject.

You should execute this command after have regenrate the node_modules folder

### delete

you delete collection or doc from CLI,
Warning the cli do not ask confirm action.

#### delete collection

for delete a collection:

with npm key script:
```bash
> npm run store -- --delete articles
```

```bash
> ./node_modules/bin/storage --delete articles
```

#### delete doc

for delete a doc use the format: `{collectionName}.{docId}`

with npm key script:
```bash
> npm run store -- --delete-doc articles.0
```

```bash
> ./node_modules/bin/storage --delete-doc articles.0
```

### add collection

You can create a new empty collection:

```bash
> npm run store -- --add-collection users
```

```bash
> ./node_modules/bin/storage --add-collection users
```

if collection already exists command is reject.

### dump

you can dump data from the CLI

#### dump collections list

for show the collections list:


```bash
> npm run store -- --collections-dump
```

```bash
> ./node_modules/bin/storage --collections-dump
```

output should have this format:

```bash

    {number} collections found.s

        {collectionsName} have {number} docs
        {collectionsName} have {number} docs
        {collectionsName} have {number} docs
```

if you have create 0 collection the command is reject.

#### dump-docs-list


```bash
> npm run store -- --dump articles
```

```bash
> ./node_modules/bin/storage --dump articles
```

output should have this format:

```bash

    {collectionName} have {number} docs

    {docname} ({numbers} keys) :
        {
            keyname: value,
            keyname: value
        }

    {docname} ({numbers} keys)
        {
            keyname: value,
            keyname: value
        }
```

if collection name not exists the command is reject.