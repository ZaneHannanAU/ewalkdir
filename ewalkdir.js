const path = require('path');
const util = require('util');
const fs = require('fs');
const [stat, readdir] = [fs.lstat, fs.readdir].map(util.promisify)
const {EventEmitter} = require('events');
const none = /^(node_modules|\..*)$/g
const types = 'file;dir;blockdevice;characterdevice;symboliclink;fifo;socket'.split(/;/g)

class ewalkdir extends EventEmitter {
  /**
   * @constructor ewalkdir
   * @extends {events} eventemitter
   * @arg {string|array<...string>} dir to scan
   * @arg {string|array<...string>} dirs - alternatives to scan
   * @arg {number} depth to scan to.
   * @arg {boolean} keepFound - keep the found items in ewalkdir.foundItems
   * @arg {regex} no - a filter, I couldn't find a better name for it.
   * @arg {boolean} emitDefault - emits all by default.
   * @arg {boolean} emit* - uses the same as emitDefault.
   */
  constructor({
    dir, dirs, depth = Infinity,
    keepFound = false, no = none,

    emitDefault = true, emitFiles = emitDefault, emitDirs = emitDefault,
    emitBlockDevices = emitDefault, emitCharacterDevices = emitDefault,
    emitSymbolicLinks = emitDefault, emitFIFOs = emitDefault,
    emitSockets = emitDefault
  } = {}) {
    if (!(dir || dirs))
      throw new SyntaxError('walkdir requires at least one dir(s) to walk')
    ;;

    super()
    if (keepFound) process.nextTick(this.keepFound);

    let opts = this.opts = {
      emitFiles, emitDirs, emitBlockDevices,
      emitCharacterDevices, emitSymbolicLinks,
      emitFIFOs, emitSockets, no, depth,
      emit: this.emit.bind(this),
      walk: this.walk.bind(this)
    };

    if (dir && Array.isArray(dir))
      dir.forEach(io => setImmediate(this.walk, {dir: io, depth, opts}))
    else if (dir && typeof dir === 'string')
      setImmediate(this.walk, {dir, depth, opts})

    ;;

    if (dirs && Array.isArray(dirs))
      dirs.forEach(io => setImmediate(this.walk, {dir: io, depth, opts}))
    else if (dirs && typeof dirs === 'string')
      setImmediate(this.walk, {dir: dirs, depth, opts})

    ;;

    this.emit('ready')
  }

  /**
   * @func walk
   * @static
   * @arg {string|array<string>|object}
   */
  static walk(opts) {
    if (typeof opts === 'string') opts = {dir: opts}
    else if (Array.isArray(opts)) opts = {dirs: opts};
    return new ewalkdir(opts)
  }

  /**
   * @func walks
   * @static
   * @arg {arguments<(string|array<string>|number|regex|boolean|object)>}
   */
  static walks(...options) {
    options = options.reduce((opts, option) => {
      switch (typeof option) {
        case 'object':
          if (Array.isArray(option)) opts.dirs = opts.dirs.concat(option)
          else if (option instanceof RegExp) opts.no = RegExp(option)
          else opts = Object.assign(opts, option)
          break;
        case 'string':
          opts.dirs = opts.dirs.concat(option)
          break;
        case 'number':
          opts.depth = Number(option) | 0
          break;
        case 'boolean':
          opts.keepFound = Boolean(option)
          break;
        default:

      }
      return opts
    }, {dirs: []});
    return new ewalkdir(options)
  }

  /**
   * @method walk
   * @async
   */
  async walk({dir, depth = Infinity, relTop = '/', opts}) {
    setImmediate(opts.emit, 'walk', {path: dir, dir, depth, relTop})
    const stats = await stat(dir);
    // console.log({this: this, opts});
    if (stats.isFile() && opts.emitFiles) {
      setImmediate(opts.emit, 'file', {path: dir, dir, stats, relTop})
    } else if (stats.isDirectory()) {
      if (opts.emitDirs)
        setImmediate(opts.emit, 'dir', {path: dir, dir, stats, relTop})
      ;;

      if (depth-1 > 0) {
        for (const child of await readdir(dir)) {
          if (!opts.no.test(child)) setImmediate(
            opts.walk.bind(opts, {
              dir: path.join(dir, child),
              depth: depth-1,
              relTop: path.posix.join(relTop, child),
              opts
              // ASAP walk dir/child, depth = depth - 1,
              // relTop = posix join relTop/child
            })
          );
        };
      };
    } else if (stats.isBlockDevice() && opts.emitBlockDevices) {
      setImmediate(opts.emit, 'blockdevice', {
        path: dir, dir, stats, relTop
      })
    } else if (stats.isCharacterDevice() && opts.emitCharacterDevices) {
      setImmediate(opts.emit, 'characterdevice', {
        path: dir, dir, stats, relTop
      })
    } else if (stats.isSymbolicLink() && opts.emitSymbolicLinks) {
      setImmediate(opts.emit, 'symboliclink', {
        path: dir, dir, stats, relTop
      })
    } else if (stats.isFIFO() && opts.emitFIFOs) {
      setImmediate(opts.emit, 'fifo', {
        path: dir, dir, stats, relTop
      })
    } else if (stats.isSocket() && opts.emitSockets) {
      setImmediate(opts.emit, 'socket', {
        path: dir, dir, stats, relTop
      })
    };
  }

  /**
   * @method keepFound
   */
  keepFound() {
    this.foundItems = {};
    types.forEach(type => {
      this.foundItems[type] = new Map;
      this.on(type, ({dir: name, /*path, */stats, relTop}) => setImmediate(() => {
        this.foundItems[type].set(name, stats)
        this.foundItems[type].set(relTop, stats)
      }))
    })
  }
}

exports = module.exports = (opts) => ewalkdir.walk(opts);
exports.walk = (opts) => ewalkdir.walk(opts);
exports.emittable = types;
exports.walks = (...opts) => ewalkdir.walks(...opts);
exports.constructor = ewalkdir;
