# ewalkdir

Node.js event-emitting asynchronous directory walking.

## Usage

All the files under your homedir:

```javascript
const ewalkdir = require('ewalkdir');
const dir = require('os').homedir();
const walker = ewalkdir(dir)
.on('file', ({dir,/* path,*/ stats, relTop}) => {
  console.log('dir', dir, stats);
})
.on('symboliclink', ({dir,/* path,*/ stats, relTop}) => {
  console.log('symboliclink', dir, stats)
})
```

## Options

Can be set by `ewalkdir({key: value})`

* `dir` and/or `dirs`: `string` or `array` of `string`s pointing to directories to scan.
* `depth`: `number` (default `Infinity`); defines what depth to explore to.
* `relTop`: `string` (default `"/"`); relative path to top scan, included in all events except `ready`.
* `readlinks`/`followLinks`/`followSymlinks`: `boolean` (default `false`); follow symbolic links. Subitems will emit as if it were a directory, with the exception of the `{dir, path = dir}` attributes which will be completely different; but will follow the same `{relTop}` attribute.
* `keepFound`: `boolean` (default `false`); keeps data in a `Map` under `this.foundItems`.
* `no`: `regex` (default `/^(node_modules|\..*)$/g`); filter; returns true on `no.test` if not to be scanned.
* `emitDefault`: `boolean` (default `true`); sets default for all emitters.
* `emit*`: `boolean` (default `emitDefault`); see [Events](#eventsemittables) below.

## Events/emittables

* `ready` emitted before beginning directory walking and emitting of data.
* `walk` emitted every walked item.
* `file` (if `fs.Stats.isFile()`, controlled by option `emitFiles`)
* `dir` (if `fs.Stats.isDirectory()`, controlled by option `emitDirectorys`)
* `blockdevice` (if `fs.Stats.isBlockDevice()`, controlled by option `emitBlockDevices`)
* `characterdevice` (if `fs.Stats.isCharacterDevice()`, controlled by option `emitCharacterDevices`)
* `symboliclink` (if `fs.Stats.isSymbolicLink()`, controlled by option `emitSymbolicLinks`)
* `fifo` (if `fs.Stats.isFIFO()`, controlled by option `emitFIFOs`, First In First Out/"Queue")
* `socket` (if `fs.Stats.isSocket()`, controlled by option `emitSockets`)

## Event structure

All events, excluding `ready` and `walk`, attach a `{dir, path = dir, stats, relTop}` event, documenting the `{dir, path}` to the item, `{stats}` is an `fs.Stats` object and `relTop` is a HTTP relative path if a server was based on it.

Event `ready` emits no data.

Event `walk` emits `{dir, path = dir, depth, relTop}` regardless.

## Usecases

Current usecases involve:

* Finding and/or hashing a large amount of files in several seconds.
* Mapping a directory into many stat instances.
