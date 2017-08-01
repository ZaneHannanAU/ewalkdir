# ewalkdir

Node.js event-emitting asynchronous directory walking.

## Usage

All the files under your homedir:

```javascript
const ewalkdir = require('ewalkdir');
const home = require('os').homedir();
const walker = ewalkdir(home)
.on('file', ({dir, stats, relTop}) => {
  console.log('dir', dir, stats);
})
.on('symboliclink', ({dir, stats, relTop}) => {
  console.log('symboliclink', dir, stats)
})
```

## Options

Can be set by `ewalkdir({key: value})`

* `dir` and/or `dirs`: `string` or `array` of `string`s pointing to directories to scan.
* `depth`: `number` (default `Infinity`); defines what depth to explore to.
* `keepFound`: `boolean` (default `false`); keeps data in a `Map` under `this.foundItems`.
* `no`: `regex` (default `/^(node_modules|\..*)$/g`); filter; returns true on `no.test` if not to be scanned.
* `emitDefault`: `boolean` (default `true`); sets default for all emitters.
* `emit*`: `boolean` (default `emitDefault`); see [Events](#eventsemittables) below.

## Events/emittables

* `file` (if `fs.Stats.isFile()`, controlled by option `emitFiles`)
* `dir` (if `fs.Stats.isDirectory()`, controlled by option `emitDirectorys`)
* `blockdevice` (if `fs.Stats.isBlockDevice()`, controlled by option `emitBlockDevices`)
* `characterdevice` (if `fs.Stats.isCharacterDevice()`, controlled by option `emitCharacterDevices`)
* `symboliclink` (if `fs.Stats.isSymbolicLink()`, controlled by option `emitSymbolicLinks`)
* `fifo` (if `fs.Stats.isFIFO()`, controlled by option `emitFIFOs`, First In First Out/"Queue")
* `socket` (if `fs.Stats.isSocket()`, controlled by option `emitSockets`)
