# 1.5.4

- Add method: `get( collectionName: string ): object[]` because `getDocsList` return *docsname list* [issue](https://github.com/Orivoir/fully-storage/issues/16)

# 1.5.3

- Fix **fixtures load** from **CLI** is append, add call to `regenerate` collection before load [issue](https://github.com/Orivoir/fully-storage/issues/13)
- Add **output log** to `regenerate` CLI command *muted* [issue](https://github.com/Orivoir/fully-storage/issues/3)

# 1.5.2

- Fix syntax show version form CLI command
- Added **usage locality for load fixtures from CLI** [issue](https://github.com/Orivoir/fully-storage/issues/14)

# 1.5.1

- Added link git to app example usage **fixtures API** *[example usage app](https://github.com/Orivoir/fully-storage-fixtures)*

# [1.5.0](https://github.com/Orivoir/fully-storage/releases/tag/1.5.0)

- Added usage **generator fixtures** from **CLI** (bac27bbb81c5d2390d3b78179fed16bac26d661c)
- Upgrade **README.md**

# 1.4.5

- Added API implemented by **package** [fully-storage-faker-api](https://npmjs.com/package/fully-storage-faker-api)
- Upgrade **README.md**

# 1.4.0

- Refactoring **ManagerSession** (df949feee742d7c16668f08373f552d365f0b1d2)
- add `autoSave` attribute for not forced call method `save` after each update session data (382b416178a963a0e3ef2de8539b80ff6d1ea46d)

# 1.3.2

- Optimize README.md add link to example app usage manager session HTTP
- Optimize README.md add link to example app basic usage storage nosql

# 1.3.1

- Optimize README.md, fix anchor and add minor precision

# 1.3.0

- Fix command dump collection with a collection name composed: `foo-bar`
- Fix in: `onRequest` middleware handler HTTP session method save implemented in `request.session` is remove after call, and cant save many time in single request.

# 1.2.1

- Add exemple usage HTTP session as middleware with Express

# [1.2.0](https://github.com/Orivoir/fully-storage/pull/2)

- Added **users API**, handler collection as *users collection*
- Upgrade **README.md** for add usage **users API**

# [1.1.0](https://github.com/Orivoir/fully-storage/pull/1)

- refactoring bin script *( one file one command )* [ref](https://github.com/Orivoir/fully-storage/pull/1/commits/f80551e053dfd4109d62ddedbf9f835d606be5e0)

- add regenerate command, optimize import and export command with a code base remove arg path for import/export command, fix bug show author as `[Object Object]` from version command [ref](https://github.com/Orivoir/fully-storage/pull/1/commits/8a699391944837db964eac8405f29d6a7e87d1a3)

# [1.0.2](https://github.com/Orivoir/fully-storage/commit/47f35d881c4bcebf0e0b546c0524a36c785f5135)

- Fix default folder *collections* at root, not exists in prod.


# 1.0.1

- Fix anchor from README.md
- add keywords from package.json
