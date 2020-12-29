(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('http'), require('fs'), require('path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'http', 'fs', 'path'], factory) :
  (global = global || self, factory(global.Client = {}, global.http, global.fs, global.path));
}(this, function (exports, http, fs, path) { 'use strict';

  http = http && http.hasOwnProperty('default') ? http['default'] : http;
  fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
  path = path && path.hasOwnProperty('default') ? path['default'] : path;

  // Unique ID creation requires a high quality random # generator. In the browser we therefore
  // require the crypto API and do not support built-in fallback to lower quality random number
  // generators (like Math.random()).
  // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
  // find the complete implementation of crypto (msCrypto) on IE11.
  var getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }

    return getRandomValues(rnds8);
  }

  var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

  function validate(uuid) {
    return typeof uuid === 'string' && REGEX.test(uuid);
  }

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */

  var byteToHex = [];

  for (var i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).substr(1));
  }

  function stringify(arr) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
    // of the following:
    // - One or more input array values don't map to a hex octet (leading to
    // "undefined" in the uuid)
    // - Invalid input values for the RFC `version` or `variant` fields

    if (!validate(uuid)) {
      throw TypeError('Stringified UUID is invalid');
    }

    return uuid;
  }

  /*
   * Browser-compatible JavaScript MD5
   *
   * Modification of JavaScript MD5
   * https://github.com/blueimp/JavaScript-MD5
   *
   * Copyright 2011, Sebastian Tschan
   * https://blueimp.net
   *
   * Licensed under the MIT license:
   * https://opensource.org/licenses/MIT
   *
   * Based on
   * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
   * Digest Algorithm, as defined in RFC 1321.
   * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
   * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
   * Distributed under the BSD License
   * See http://pajhome.org.uk/crypt/md5 for more info.
   */

  function v4(options, buf, offset) {
    options = options || {};
    var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      offset = offset || 0;

      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }

      return buf;
    }

    return stringify(rnds);
  }

  // Adapted from Chris Veness' SHA1 code at

  /**
   * This class implements a singleton game world instance, created by Lance.
   * It represents an instance of the game world, and includes all the game objects.
   * It is the state of the game.
   */

  class GameWorld {

      /**
       * Constructor of the World instance.  Invoked by Lance on startup.
       *
       * @hideconstructor
       */
      constructor() {
          this.stepCount = 0;
          this.objects = {};
          this.playerCount = 0;
          this.idCount = 0;
          this.groups = new Map();
      }

      get size() {
          return Object.keys(this.objects).length
      }

      /**
       * Gets a new, fresh and unused id that can be used for a new object
       * @private
       * @return {Number} the new id
       */
      getNewId() {
          return v4();
      }

      /**
       * Returns all the game world objects which match a criteria
       * @param {Object} query The query object
       * @param {Object} [query.id] object id
       * @param {Object} [query.playerId] player id
       * @param {Class} [query.instanceType] matches whether `object instanceof instanceType`
       * @param {Array} [query.components] An array of component names
       * @param {Boolean} [query.returnSingle] Return the first object matched
       * @return {Array | Object} All game objects which match all the query parameters, or the first match if returnSingle was specified
       */
      queryObjects(query) {
          let queriedObjects = [];

          // todo this is currently a somewhat inefficient implementation for API testing purposes.
          // It should be implemented with cached dictionaries like in nano-ecs
          this.forEachObject((id, object) => {
              let conditions = [];

              // object id condition
              conditions.push(!('id' in query) || query.id !== null && object.id === query.id);

              // player id condition
              conditions.push(!('playerId' in query) || query.playerId !== null && object.playerId === query.playerId);

              // instance type conditio
              conditions.push(!('instanceType' in query) || query.instanceType !== null && object instanceof query.instanceType);

              // components conditions
              if ('components' in query) {
                  query.components.forEach(componentClass => {
                      conditions.push(object.hasComponent(componentClass));
                  });
              }

              // all conditions are true, object is qualified for the query
              if (conditions.every(value => value)) {
                  queriedObjects.push(object);
                  if (query.returnSingle) return false;
              }
          });

          // return a single object or null
          if (query.returnSingle) {
              return queriedObjects.length > 0 ? queriedObjects[0] : null;
          }

          return queriedObjects;
      }

      /**
       * Returns The first game object encountered which matches a criteria.
       * Syntactic sugar for {@link queryObjects} with `returnSingle: true`
       * @param {Object} query See queryObjects
       * @return {Object} The game object, if found
       */
      queryObject(query) {
          return this.queryObjects(Object.assign(query, {
              returnSingle: true
          }));
      }

      has(id) {
          return !!this.objects[id]
      }

      getObject(id) {
          if (typeof id != 'string') {
              id = id.id;
          }
          return this.objects[id]
      }

      getObjectsOfGroup(groupName) {
          return this.groups.get(groupName).collections.map(id => this.getObject(id))
      }

      /**
       * Add an object to the game world
       * @private
       * @param {Object} object object to add
       */
      addObject(object) {
          this.objects[object.id] = object;
      }

      addObjectInGroup(object, groupName) {
          if (!this.groups.has(groupName)) {
              this.addGroup(groupName);
          }
          this.groups.get(groupName).collections.push(object.id);
      }

      /**
       * Remove an object from the game world
       * @private
       * @param {number} id id of the object to remove
       */
      removeObject(id) {
          const groupsDeleted = [];
          this.groups.forEach((group) => {
              const isDeleted = this.removeObjectOfGroup(group.groupName, id);
              if (isDeleted) groupsDeleted.push(group.groupName);
          });
          delete this.objects[id];
          return groupsDeleted
      }

      /**
       * World object iterator.
       * Invoke callback(objId, obj) for each object
       *
       * @param {function} callback function receives id and object. If callback returns false, the iteration will cease
       */
      forEachObject(callback) {
          for (let id of Object.keys(this.objects)) {
              let returnValue = callback(id, this.objects[id]);  // TODO: the key should be Number(id)
              if (returnValue === false) break;
          }
      }

      forEach(callback) {
          for (let id in this.objects) {
              callback(this.objects[id], id);
          }
      }

      addGroup(groupName) {
          this.groups.set(groupName, {
              collections: [],
              requestImmediateSync: false,
              requestFullSync: false,
              syncCounter: 0,
              groupName
          });
          if (this.onAddGroup) this.onAddGroup(groupName);
      }

      removeGroup(groupName) {
          this.groups.delete(groupName);
          if (this.onRemoveGroup) this.onRemoveGroup(groupName);
      }

      removeObjectOfGroup(groupName, id) {
          const group = this.groups.get(groupName);
          let isDeleted = false;
          const collections = group.collections.filter(objId => {
              if (objId != id) {
                  return true
              }
              else {
                  isDeleted = true;
                  return false
              }
          });
          if (collections.length == 0) {
              this.removeGroup(groupName);
          }
          else {
              this.groups.set(groupName, {
                  ...group,
                  collections
              }); 
          }
          return isDeleted
      }

  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  // ES3 safe
  var _undefined = void 0;

  var is = function (value) { return value !== _undefined && value !== null; };

  // prettier-ignore
  var possibleTypes = { "object": true, "function": true, "undefined": true /* document.all */ };

  var is$1 = function (value) {
  	if (!is(value)) return false;
  	return hasOwnProperty.call(possibleTypes, typeof value);
  };

  var is$2 = function (value) {
  	if (!is$1(value)) return false;
  	try {
  		if (!value.constructor) return false;
  		return value.constructor.prototype === value;
  	} catch (error) {
  		return false;
  	}
  };

  var is$3 = function (value) {
  	if (typeof value !== "function") return false;

  	if (!hasOwnProperty.call(value, "length")) return false;

  	try {
  		if (typeof value.length !== "number") return false;
  		if (typeof value.call !== "function") return false;
  		if (typeof value.apply !== "function") return false;
  	} catch (error) {
  		return false;
  	}

  	return !is$2(value);
  };

  var classRe = /^\s*class[\s{/}]/, functionToString = Function.prototype.toString;

  var is$4 = function (value) {
  	if (!is$3(value)) return false;
  	if (classRe.test(functionToString.call(value))) return false;
  	return true;
  };

  var isImplemented = function () {
  	var assign = Object.assign, obj;
  	if (typeof assign !== "function") return false;
  	obj = { foo: "raz" };
  	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
  	return (obj.foo + obj.bar + obj.trzy) === "razdwatrzy";
  };

  var isImplemented$1 = function () {
  	try {
  		return true;
  	} catch (e) {
  		return false;
  	}
  };

  // eslint-disable-next-line no-empty-function
  var noop = function () {};

  var _undefined$1 = noop(); // Support ES3 engines

  var isValue = function (val) {
   return (val !== _undefined$1) && (val !== null);
  };

  var keys = Object.keys;

  var shim = function (object) { return keys(isValue(object) ? Object(object) : object); };

  var keys$1 = isImplemented$1() ? Object.keys : shim;

  var validValue = function (value) {
  	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
  	return value;
  };

  var max   = Math.max;

  var shim$1 = function (dest, src /*, …srcn*/) {
  	var error, i, length = max(arguments.length, 2), assign;
  	dest = Object(validValue(dest));
  	assign = function (key) {
  		try {
  			dest[key] = src[key];
  		} catch (e) {
  			if (!error) error = e;
  		}
  	};
  	for (i = 1; i < length; ++i) {
  		src = arguments[i];
  		keys$1(src).forEach(assign);
  	}
  	if (error !== undefined) throw error;
  	return dest;
  };

  var assign = isImplemented()
  	? Object.assign
  	: shim$1;

  var forEach = Array.prototype.forEach, create = Object.create;

  var process$1 = function (src, obj) {
  	var key;
  	for (key in src) obj[key] = src[key];
  };

  // eslint-disable-next-line no-unused-vars
  var normalizeOptions = function (opts1 /*, …options*/) {
  	var result = create(null);
  	forEach.call(arguments, function (options) {
  		if (!isValue(options)) return;
  		process$1(Object(options), result);
  	});
  	return result;
  };

  var str = "razdwatrzy";

  var isImplemented$2 = function () {
  	if (typeof str.contains !== "function") return false;
  	return (str.contains("dwa") === true) && (str.contains("foo") === false);
  };

  var indexOf = String.prototype.indexOf;

  var shim$2 = function (searchString/*, position*/) {
  	return indexOf.call(this, searchString, arguments[1]) > -1;
  };

  var contains = isImplemented$2()
  	? String.prototype.contains
  	: shim$2;

  var d_1 = createCommonjsModule(function (module) {



  var d = (module.exports = function (dscr, value/*, options*/) {
  	var c, e, w, options, desc;
  	if (arguments.length < 2 || typeof dscr !== "string") {
  		options = value;
  		value = dscr;
  		dscr = null;
  	} else {
  		options = arguments[2];
  	}
  	if (is(dscr)) {
  		c = contains.call(dscr, "c");
  		e = contains.call(dscr, "e");
  		w = contains.call(dscr, "w");
  	} else {
  		c = w = true;
  		e = false;
  	}

  	desc = { value: value, configurable: c, enumerable: e, writable: w };
  	return !options ? desc : assign(normalizeOptions(options), desc);
  });

  d.gs = function (dscr, get, set/*, options*/) {
  	var c, e, options, desc;
  	if (typeof dscr !== "string") {
  		options = set;
  		set = get;
  		get = dscr;
  		dscr = null;
  	} else {
  		options = arguments[3];
  	}
  	if (!is(get)) {
  		get = undefined;
  	} else if (!is$4(get)) {
  		options = get;
  		get = set = undefined;
  	} else if (!is(set)) {
  		set = undefined;
  	} else if (!is$4(set)) {
  		options = set;
  		set = undefined;
  	}
  	if (is(dscr)) {
  		c = contains.call(dscr, "c");
  		e = contains.call(dscr, "e");
  	} else {
  		c = true;
  		e = false;
  	}

  	desc = { get: get, set: set, configurable: c, enumerable: e };
  	return !options ? desc : assign(normalizeOptions(options), desc);
  };
  });

  var validCallable = function (fn) {
  	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
  	return fn;
  };

  var eventEmitter = createCommonjsModule(function (module, exports) {

  var apply = Function.prototype.apply, call = Function.prototype.call
    , create = Object.create, defineProperty = Object.defineProperty
    , defineProperties = Object.defineProperties
    , hasOwnProperty = Object.prototype.hasOwnProperty
    , descriptor = { configurable: true, enumerable: false, writable: true }

    , on, once, off, emit, methods, descriptors, base;

  on = function (type, listener) {
  	var data;

  	validCallable(listener);

  	if (!hasOwnProperty.call(this, '__ee__')) {
  		data = descriptor.value = create(null);
  		defineProperty(this, '__ee__', descriptor);
  		descriptor.value = null;
  	} else {
  		data = this.__ee__;
  	}
  	if (!data[type]) data[type] = listener;
  	else if (typeof data[type] === 'object') data[type].push(listener);
  	else data[type] = [data[type], listener];

  	return this;
  };

  once = function (type, listener) {
  	var once, self;

  	validCallable(listener);
  	self = this;
  	on.call(this, type, once = function () {
  		off.call(self, type, once);
  		apply.call(listener, this, arguments);
  	});

  	once.__eeOnceListener__ = listener;
  	return this;
  };

  off = function (type, listener) {
  	var data, listeners, candidate, i;

  	validCallable(listener);

  	if (!hasOwnProperty.call(this, '__ee__')) return this;
  	data = this.__ee__;
  	if (!data[type]) return this;
  	listeners = data[type];

  	if (typeof listeners === 'object') {
  		for (i = 0; (candidate = listeners[i]); ++i) {
  			if ((candidate === listener) ||
  					(candidate.__eeOnceListener__ === listener)) {
  				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
  				else listeners.splice(i, 1);
  			}
  		}
  	} else {
  		if ((listeners === listener) ||
  				(listeners.__eeOnceListener__ === listener)) {
  			delete data[type];
  		}
  	}

  	return this;
  };

  emit = function (type) {
  	var i, l, listener, listeners, args;

  	if (!hasOwnProperty.call(this, '__ee__')) return;
  	listeners = this.__ee__[type];
  	if (!listeners) return;

  	if (typeof listeners === 'object') {
  		l = arguments.length;
  		args = new Array(l - 1);
  		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

  		listeners = listeners.slice();
  		for (i = 0; (listener = listeners[i]); ++i) {
  			apply.call(listener, this, args);
  		}
  	} else {
  		switch (arguments.length) {
  		case 1:
  			call.call(listeners, this);
  			break;
  		case 2:
  			call.call(listeners, this, arguments[1]);
  			break;
  		case 3:
  			call.call(listeners, this, arguments[1], arguments[2]);
  			break;
  		default:
  			l = arguments.length;
  			args = new Array(l - 1);
  			for (i = 1; i < l; ++i) {
  				args[i - 1] = arguments[i];
  			}
  			apply.call(listeners, this, args);
  		}
  	}
  };

  methods = {
  	on: on,
  	once: once,
  	off: off,
  	emit: emit
  };

  descriptors = {
  	on: d_1(on),
  	once: d_1(once),
  	off: d_1(off),
  	emit: d_1(emit)
  };

  base = defineProperties({}, descriptors);

  module.exports = exports = function (o) {
  	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
  };
  exports.methods = methods;
  });
  var eventEmitter_1 = eventEmitter.methods;

  // TODO: needs documentation
  // I think the API could be simpler
  //   - Timer.run(waitSteps, cb)
  //   - Timer.repeat(waitSteps, count, cb) // count=null=>forever
  //   - Timer.cancel(cb)
  class Timer {

      constructor() {
          this.currentTime = 0;
          this.isActive = false;
          this.idCounter = 0;

          this.events = {};
      }

      play() {
          this.isActive = true;
      }

      tick() {
          let event;
          let eventId;

          if (this.isActive) {
              this.currentTime++;

              for (eventId in this.events) {
                  event = this.events[eventId];
                  if (event) {

                      if (event.type == 'repeat') {
                          if ((this.currentTime - event.startOffset) % event.time == 0) {
                              event.callback.apply(event.thisContext, event.args);
                          }
                      }
                      if (event.type == 'single') {
                          if ((this.currentTime - event.startOffset) % event.time == 0) {
                              event.callback.apply(event.thisContext, event.args);
                              event.destroy();
                          }
                      }

                  }

              }
          }
      }

      destroyEvent(eventId) {
          delete this.events[eventId];
      }

      loop(time, callback) {
          let timerEvent = new TimerEvent(this,
              TimerEvent.TYPES.repeat,
              time,
              callback
          );

          this.events[timerEvent.id] = timerEvent;

          return timerEvent;
      }

      add(time, callback, thisContext, args) {
          let timerEvent = new TimerEvent(this,
              TimerEvent.TYPES.single,
              time,
              callback,
              thisContext,
              args
          );

          this.events[timerEvent.id] = timerEvent;
          return timerEvent;
      }

      // todo implement timer delete all events

      destroy(id) {
          delete this.events[id];
      }
  }

  // timer event
  class TimerEvent {
      constructor(timer, type, time, callback, thisContext, args) {
          this.id = ++timer.idCounter;
          this.timer = timer;
          this.type = type;
          this.time = time;
          this.callback = callback;
          this.startOffset = timer.currentTime;
          this.thisContext = thisContext;
          this.args = args;

          this.destroy = function() {
              this.timer.destroy(this.id);
          };
      }
  }

  TimerEvent.TYPES = {
      repeat: 'repeat',
      single: 'single'
  };

  /**
   * Tracing Services.
   * Use the trace functions to trace game state.  Turn on tracing by
   * specifying the minimum trace level which should be recorded.  For
   * example, setting traceLevel to Trace.TRACE_INFO will cause info,
   * warn, and error traces to be recorded.
   */
  class Trace {

      constructor(options) {

          this.options = Object.assign({
              traceLevel: this.TRACE_DEBUG
          }, options);

          this.traceBuffer = [];
          this.step = 'initializing';

          // syntactic sugar functions
          this.error = this.trace.bind(this, Trace.TRACE_ERROR);
          this.warn = this.trace.bind(this, Trace.TRACE_WARN);
          this.info = this.trace.bind(this, Trace.TRACE_INFO);
          this.debug = this.trace.bind(this, Trace.TRACE_DEBUG);
          this.trace = this.trace.bind(this, Trace.TRACE_ALL);
      }

      /**
       * Include all trace levels.
       * @memberof Trace
       * @member {Number} TRACE_ALL
       */
      static get TRACE_ALL() { return 0; }

       /**
        * Include debug traces and higher.
        * @memberof Trace
        * @member {Number} TRACE_DEBUG
        */
      static get TRACE_DEBUG() { return 1; }

       /**
        * Include info traces and higher.
        * @memberof Trace
        * @member {Number} TRACE_INFO
        */
      static get TRACE_INFO() { return 2; }

       /**
        * Include warn traces and higher.
        * @memberof Trace
        * @member {Number} TRACE_WARN
        */
      static get TRACE_WARN() { return 3; }

       /**
        * Include error traces and higher.
        * @memberof Trace
        * @member {Number} TRACE_ERROR
        */
      static get TRACE_ERROR() { return 4; }

       /**
        * Disable all tracing.
        * @memberof Trace
        * @member {Number} TRACE_NONE
        */
      static get TRACE_NONE() { return 1000; }

      trace(level, dataCB) {

           // all traces must be functions which return strings
          if (typeof dataCB !== 'function') {
              throw new Error(`Lance trace was called but instead of passing a function, it received a [${typeof dataCB}]`);
          }

          if (level < this.options.traceLevel)
              return;

          this.traceBuffer.push({ data: dataCB(), level, step: this.step, time: new Date() });
      }

      rotate() {
          let buffer = this.traceBuffer;
          this.traceBuffer = [];
          return buffer;
      }

      get length() {
          return this.traceBuffer.length;
      }

      setStep(s) {
          this.step = s;
      }
  }

  /**
   * The GameEngine contains the game logic.  Extend this class
   * to implement game mechanics.  The GameEngine derived
   * instance runs once on the server, where the final decisions
   * are always taken, and one instance will run on each client as well,
   * where the client emulates what it expects to be happening
   * on the server.
   *
   * The game engine's logic must listen to user inputs and
   * act on these inputs to change the game state.  For example,
   * the game engine listens to controller/keyboard inputs to infer
   * movement for the player/ship/first-person.  The game engine listens
   * to clicks, button-presses to infer firing, etc..
   *
   * Note that the game engine runs on both the server and on the
   * clients - but the server decisions always have the final say,
   * and therefore clients must resolve server updates which conflict
   * with client-side predictions.
   */
  class GameEngine {

      /**
        * Create a game engine instance.  This needs to happen
        * once on the server, and once on each client.
        *
        * @param {Object} options - options object
        * @param {Number} options.traceLevel - the trace level.
        */
      constructor(options) {

          // place the game engine in the LANCE globals
          const isServerSide = (typeof window === 'undefined');
          const glob = isServerSide ? global : window;
          glob.LANCE = { gameEngine: this };

          // set options
          const defaultOpts = { traceLevel: Trace.TRACE_NONE };
          if (!isServerSide) defaultOpts.clientIDSpace = 1000000;
          this.options = Object.assign(defaultOpts, options);

          /**
           * client's player ID, as a string. If running on the client, this is set at runtime by the clientEngine
           * @member {String}
           */
          this.playerId = NaN;

          // set up event emitting and interface
          let eventEmitter$1 = this.options.eventEmitter;
          if (typeof eventEmitter$1 === 'undefined')
              eventEmitter$1 = new eventEmitter();

          /**
           * Register a handler for an event
           *
           * @method on
           * @memberof GameEngine
           * @instance
           * @param {String} eventName - name of the event
           * @param {Function} eventHandler - handler function
           */
          this.on = eventEmitter$1.on;

          /**
           * Register a handler for an event, called just once (if at all)
           *
           * @method once
           * @memberof GameEngine
           * @instance
           * @param {String} eventName - name of the event
           * @param {Function} eventHandler - handler function
           */
          this.once = eventEmitter$1.once;

          /**
           * Remove a handler
           *
           * @method removeListener
           * @memberof GameEngine
           * @instance
           * @param {String} eventName - name of the event
           * @param {Function} eventHandler - handler function
           */
          this.removeListener = eventEmitter$1.off;
          this.off = eventEmitter$1.off;

          this.emit = eventEmitter$1.emit;

          // set up trace
          this.trace = new Trace({ traceLevel: this.options.traceLevel });
      }

      findLocalShadow(serverObj) {

          for (let localId of Object.keys(this.world.objects)) {
              if (localId < this.options.clientIDSpace) continue;
              let localObj = this.world.objects[localId];
              if (localObj.hasOwnProperty('inputId') && localObj.inputId === serverObj.inputId)
                  return localObj;
          }

          return null;
      }

      initWorld(worldSettings) {

          this.world = new GameWorld();

          // on the client we have a different ID space
          if (this.options.clientIDSpace) {
              this.world.idCount = this.options.clientIDSpace;
          }

          /**
          * The worldSettings defines the game world constants, such
          * as width, height, depth, etc. such that all other classes
          * can reference these values.
          * @member {Object} worldSettings
          * @memberof GameEngine
          */
          this.worldSettings = Object.assign({}, worldSettings);
      }

      /**
        * Start the game. This method runs on both server
        * and client. Extending the start method is useful
        * for setting up the game's worldSettings attribute,
        * and registering methods on the event handler.
        */
      start() {
          this.trace.info(() => '========== game engine started ==========');
          this.initWorld();

          // create the default timer
          this.timer = new Timer();
          this.timer.play();
          this.on('postStep', (step, isReenact) => {
              if (!isReenact) this.timer.tick();
          });

          this.emit('start', { timestamp: (new Date()).getTime() });
      }

      /**
        * Single game step.
        *
        * @param {Boolean} isReenact - is this step a re-enactment of the past.
        * @param {Number} t - the current time (optional)
        * @param {Number} dt - elapsed time since last step was called.  (optional)
        * @param {Boolean} physicsOnly - do a physics step only, no game logic
        */
      step(isReenact, t, dt, physicsOnly) {
          // physics-only step
          if (physicsOnly) {
              if (dt) dt /= 1000; // physics engines work in seconds
              this.physicsEngine.step(dt, objectFilter);
              return;
          }

          // emit preStep event
          if (isReenact === undefined)
              throw new Error('game engine does not forward argument isReenact to super class');

          isReenact = Boolean(isReenact);
          let step = ++this.world.stepCount;
          let clientIDSpace = this.options.clientIDSpace;
          this.emit('preStep', { step, isReenact, dt });

          // skip physics for shadow objects during re-enactment
          function objectFilter(o) {
              return !isReenact || o.id < clientIDSpace;
          }

          // physics step
          if (this.physicsEngine && !this.ignorePhysics) {
              if (dt) dt /= 1000; // physics engines work in seconds
              this.physicsEngine.step(dt, objectFilter);
          }

          // for each object
          // - apply incremental bending
          // - refresh object positions after physics
          this.world.forEachObject((id, o) => {
              if (typeof o.refreshFromPhysics === 'function')
                  o.refreshFromPhysics();
              this.trace.trace(() => `object[${id}] after ${isReenact ? 'reenact' : 'step'} : ${o.toString()}`);
          });

          // emit postStep event
          this.emit('postStep', { step, isReenact });
      }

      /**
       * Add object to the game world.
       * On the client side, the object may not be created, if the server copy
       * of this object is already in the game world.  This could happen when the client
       * is using delayed-input, and the RTT is very low.
       *
       * @param {Object} object - the object.
       * @return {Object} the final object.
       */
      addObjectToWorld(object) {

          // if we are asked to create a local shadow object
          // the server copy may already have arrived.
          if (object.id >= this.options.clientIDSpace) {
              let serverCopyArrived = false;
              this.world.forEachObject((id, o) => {
                  if (o.hasOwnProperty('inputId') && o.inputId === object.inputId) {
                      serverCopyArrived = true;
                      return false;
                  }
              });
              if (serverCopyArrived) {
                  this.trace.info(() => `========== shadow object NOT added ${object.toString()} ==========`);
                  return null;
              }
          }

          this.world.addObject(object);

          // tell the object to join the game, by creating
          // its corresponding physical entities and renderer entities.
          if (typeof object.onAddToWorld === 'function')
              object.onAddToWorld(this);

          this.emit('objectAdded', object);
          this.trace.info(() => `========== object added ${object.toString()} ==========`);

          return object;
      }

      /**
       * Override this function to implement input handling.
       * This method will be called on the specific client where the
       * input was received, and will also be called on the server
       * when the input reaches the server.  The client does not call this
       * method directly, rather the client calls {@link ClientEngine#sendInput}
       * so that the input is sent to both server and client, and so that
       * the input is delayed artificially if so configured.
       *
       * The input is described by a short string, and is given an index.
       * The index is used internally to keep track of inputs which have already been applied
       * on the client during synchronization.  The input is also associated with
       * the ID of a player.
       *
       * @param {Object} inputDesc - input descriptor object
       * @param {String} inputDesc.input - describe the input (e.g. "up", "down", "fire")
       * @param {Number} inputDesc.messageIndex - input identifier
       * @param {Number} inputDesc.step - the step on which this input occurred
       * @param {Number} playerId - the player ID
       * @param {Boolean} isServer - indicate if this function is being called on the server side
       */
      processInput(inputDesc, playerId, isServer) {
          this.trace.info(() => `game engine processing input[${inputDesc.messageIndex}] <${inputDesc.input}> from playerId ${playerId}`);
      }

      /**
       * Remove an object from the game world.
       *
       * @param {Object|String} objectId - the object or object ID
       */
      removeObjectFromWorld(objectId) {

          if (typeof objectId === 'object') objectId = objectId.id;
          let object = this.world.objects[objectId];

          if (!object) {
              throw new Error(`Game attempted to remove a game object which doesn't (or never did) exist, id=${objectId}`);
          }
          this.trace.info(() => `========== destroying object ${object.toString()} ==========`);

          if (typeof object.onRemoveFromWorld === 'function')
              object.onRemoveFromWorld(this);

          const groups = this.world.removeObject(objectId);
          this.emit('objectDestroyed', { object, groups });
          
      }

      /**
       * Check if a given object is owned by the player on this client
       *
       * @param {Object} object the game object to check
       * @return {Boolean} true if the game object is owned by the player on this client
       */
      isOwnedByPlayer(object) {
          return (object.playerId == this.playerId);
      }

      /**
       * Register Game Object Classes
       *
       * @example
       * registerClasses(serializer) {
       *   serializer.registerClass(Paddle);
       *   serializer.registerClass(Ball);
       * }
       *
       * @param {Serializer} serializer - the serializer
       */
      registerClasses(serializer) {
      }

      /**
       * Decide whether the player game is over by returning an Object, need to be implemented
       *
       * @return {Object} truthful if the game is over for the player and the object is returned as GameOver data
       */
      getPlayerGameOverResult() {
          return null;
      }
  }

  // The base Physics Engine class defines the expected interface
  // for all physics engines
  class PhysicsEngine {

      constructor(options) {
          this.options = options;
          this.gameEngine = options.gameEngine;

          if (!options.gameEngine) {
              console.warn('Physics engine initialized without gameEngine!');
          }
      }

      /**
       * A single Physics step.
       *
       * @param {Number} dt - time elapsed since last step
       * @param {Function} objectFilter - a test function which filters which objects should move
       */
      step(dt, objectFilter) {}

  }

  class Utils {

      static hashStr(str, bits) {
          let hash = 5381;
          let i = str.length;
          bits = bits ? bits : 8;

          while (i) {
              hash = (hash * 33) ^ str.charCodeAt(--i);
          }
          hash = hash >>> 0;
          hash = hash % (Math.pow(2, bits) - 1);

          // JavaScript does bitwise operations (like XOR, above) on 32-bit signed
          // integers. Since we want the results to be always positive, convert the
          // signed int to an unsigned by doing an unsigned bitshift. */
          return hash;
      }

      static arrayBuffersEqual(buf1, buf2) {
          if (buf1.byteLength !== buf2.byteLength) return false;
          let dv1 = new Int8Array(buf1);
          let dv2 = new Int8Array(buf2);
          for (let i = 0; i !== buf1.byteLength; i++) {
              if (dv1[i] !== dv2[i]) return false;
          }
          return true;
      }

      static httpGetPromise(url) {
          return new Promise((resolve, reject) => {
              let req = new XMLHttpRequest();
              req.open('GET', url, true);
              req.onload = () => {
                  if (req.status >= 200 && req.status < 400) resolve(JSON.parse(req.responseText));
                  else reject();
              };
              req.onerror = () => {};
              req.send();
          });
      }
  }

  /**
   * The BaseTypes class defines the base types used in Lance.
   * These are the types which can be used to define an object's netscheme attributes,
   * which can be serialized by lance.
   * @example
   *     static get netScheme() {
   *       return {
   *             strength: { type: BaseTypes.TYPES.FLOAT32 },
   *             shield: { type: BaseTypes.TYPES.INT8 },
   *             name: { type: BaseTypes.TYPES.STRING },
   *             backpack: { type: BaseTypes.TYPES.CLASSINSTANCE },
   *             coins: {
   *                 type: BaseTypes.TYPES.LIST,
   *                 itemType: BaseTypes.TYPES.UINT8
   *             }
   *         };
   *     }
   */
  class BaseTypes {}

  /**
   * @type {object}
   * @property {string} FLOAT32 Seriablizable float
   * @property {string} INT32 Seriablizable 32-bit integer
   * @property {string} INT16 Seriablizable 16-bit integer
   * @property {string} INT8 Seriablizable 8-bit integer
   * @property {string} UINT8 Seriablizable unsigned 8-bit integer
   * @property {string} STRING Seriablizable string
   * @property {string} CLASSINSTANCE Seriablizable class. Make sure you register all the classes included in this way.
   * @property {string} LIST Seriablizable list.  In the netScheme definition, if an attribute is defined as a list, the itemType should also be defined.
   */
  BaseTypes.TYPES = {

    /**
     * Seriablizable float
     * @alias TYPES.FLOAT32
     * @memberof! BaseTypes#
     */
      FLOAT32: 'FLOAT32',

      /**
       * Seriablizable 32-bit int
       * @alias TYPES.INT32
       * @memberof! BaseTypes#
       */
      INT32: 'INT32',

      /**
       * Seriablizable 16-bit int
       * @alias TYPES.INT16
       * @memberof! BaseTypes#
       */
      INT16: 'INT16',

      /**
       * Seriablizable 8-bit int
       * @alias TYPES.INT8
       * @memberof! BaseTypes#
       */
      INT8: 'INT8',

      /**
       * Seriablizable unsigned 8-bit int
       * @alias TYPES.UINT8
       * @memberof! BaseTypes#
       */
      UINT8: 'UINT8',

      /**
       * Seriablizable string
       * @alias TYPES.STRING
       * @memberof! BaseTypes#
       */
      STRING: 'STRING',

      /**
       * Seriablizable class.  Make sure you registered the classes included in this way.
       * @alias TYPES.CLASSINSTANCE
       * @memberof! BaseTypes#
       */
      CLASSINSTANCE: 'CLASSINSTANCE',

      /**
       * Seriablizable list.
       * @alias TYPES.LIST
       * @memberof! BaseTypes#
       */
      LIST: 'LIST'
  };

  class Serializable {
      /**
       *  Class can be serialized using either:
       * - a class based netScheme
       * - an instance based netScheme
       * - completely dynamically (not implemented yet)
       *
       * @param {Object} serializer - Serializer instance
       * @param {Object} [options] - Options object
       * @param {Object} options.dataBuffer [optional] - Data buffer to write to. If null a new data buffer will be created
       * @param {Number} options.bufferOffset [optional] - The buffer data offset to start writing at. Default: 0
       * @param {String} options.dry [optional] - Does not actually write to the buffer (useful to gather serializeable size)
       * @return {Object} the serialized object.  Contains attributes: dataBuffer - buffer which contains the serialized data;  bufferOffset - offset where the serialized data starts.
       */
      serialize(serializer, options) {
          options = Object.assign({
              bufferOffset: 0
          }, options);

          let netScheme;
          let dataBuffer;
          let dataView;
          let classId = 0;
          let bufferOffset = options.bufferOffset;
          let localBufferOffset = 0; // used for counting the bufferOffset

          // instance classId
          if (this.classId) {
              classId = this.classId;
          } else {
              classId = Utils.hashStr(this.constructor.name);
          }

          // instance netScheme
          if (this.netScheme) {
              netScheme = this.netScheme;
          } else if (this.constructor.netScheme) {
              netScheme = this.constructor.netScheme;
          } else {
              // todo define behaviour when a netScheme is undefined
              console.warn('no netScheme defined! This will result in awful performance');
          }

          // TODO: currently we serialize every node twice, once to calculate the size
          //       of the buffers and once to write them out.  This can be reduced to
          //       a single pass by starting with a large (and static) ArrayBuffer and
          //       recursively building it up.
          // buffer has one Uint8Array for class id, then payload
          if (options.dataBuffer == null && options.dry != true) {
              let bufferSize = this.serialize(serializer, { dry: true }).bufferOffset;
              dataBuffer = new ArrayBuffer(bufferSize);
          } else {
              dataBuffer = options.dataBuffer;
          }

          if (options.dry != true) {
              dataView = new DataView(dataBuffer);
              // first set the id of the class, so that the deserializer can fetch information about it
              dataView.setUint8(bufferOffset + localBufferOffset, classId);
          }

          // advance the offset counter
          localBufferOffset += Uint8Array.BYTES_PER_ELEMENT;

          if (netScheme) {
              for (let property of Object.keys(netScheme).sort()) {

                  // write the property to buffer
                  if (options.dry != true) {
                      serializer.writeDataView(dataView, this[property], bufferOffset + localBufferOffset, netScheme[property]);
                  }

                  if (netScheme[property].type === BaseTypes.TYPES.STRING) {
                      // derive the size of the string
                      localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
                      if (this[property] !== null && this[property] !== undefined)
                          localBufferOffset += this[property].length * Uint16Array.BYTES_PER_ELEMENT;
                  } else if (netScheme[property].type === BaseTypes.TYPES.CLASSINSTANCE) {
                      // derive the size of the included class
                      let objectInstanceBufferOffset = this[property].serialize(serializer, { dry: true }).bufferOffset;
                      localBufferOffset += objectInstanceBufferOffset;
                  } else if (netScheme[property].type === BaseTypes.TYPES.LIST) {
                      // derive the size of the list
                      // list starts with number of elements
                      localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;

                      for (let item of this[property]) {
                          // todo inelegant, currently doesn't support list of lists
                          if (netScheme[property].itemType === BaseTypes.TYPES.CLASSINSTANCE) {
                              let listBufferOffset = item.serialize(serializer, { dry: true }).bufferOffset;
                              localBufferOffset += listBufferOffset;
                          } else if (netScheme[property].itemType === BaseTypes.TYPES.STRING) {
                              // size includes string length plus double-byte characters
                              localBufferOffset += Uint16Array.BYTES_PER_ELEMENT * (1 + item.length);
                          } else {
                              localBufferOffset += serializer.getTypeByteSize(netScheme[property].itemType);
                          }
                      }
                  } else {
                      // advance offset
                      localBufferOffset += serializer.getTypeByteSize(netScheme[property].type);
                  }

              }
          }

          return { dataBuffer, bufferOffset: localBufferOffset };
      }

      // build a clone of this object with pruned strings (if necessary)
      prunedStringsClone(serializer, prevObject) {

          if (!prevObject) return this;
          prevObject = serializer.deserialize(prevObject).obj;

          // get list of string properties which changed
          let netScheme = this.constructor.netScheme;
          let isString = p => netScheme[p].type === BaseTypes.TYPES.STRING;
          let hasChanged = p => prevObject[p] !== this[p];
          let changedStrings = Object.keys(netScheme).filter(isString).filter(hasChanged);
          if (changedStrings.length == 0) return this;

          // build a clone with pruned strings
          let prunedCopy = new this.constructor(null, { id: null });
          for (let p of Object.keys(netScheme))
              prunedCopy[p] = changedStrings.indexOf(p) < 0 ? this[p] : null;

          return prunedCopy;
      }

      syncTo(other) {
          let netScheme = this.constructor.netScheme;
          for (let p of Object.keys(netScheme)) {

              // ignore classes and lists
              if (netScheme[p].type === BaseTypes.TYPES.LIST || netScheme[p].type === BaseTypes.TYPES.CLASSINSTANCE)
                  continue;

              // strings might be pruned
              if (netScheme[p].type === BaseTypes.TYPES.STRING) {
                  if (typeof other[p] === 'string') this[p] = other[p];
                  continue;
              }

              // all other values are copied
              this[p] = other[p];
          }
      }

  }

  /**
   * A TwoVector is a geometric object which is completely described
   * by two values.
   */
  class TwoVector extends Serializable {

      static get netScheme() {
          return {
              x: { type: BaseTypes.TYPES.FLOAT32 },
              y: { type: BaseTypes.TYPES.FLOAT32 }
          };
      }

      /**
      * Creates an instance of a TwoVector.
      * @param {Number} x - first value
      * @param {Number} y - second value
      * @return {TwoVector} v - the new TwoVector
      */
      constructor(x, y) {
          super();
          this.x = x;
          this.y = y;

          return this;
      }

      /**
       * Formatted textual description of the TwoVector.
       * @return {String} description
       */
      toString() {
          function round3(x) { return Math.round(x * 1000) / 1000; }
          return `[${round3(this.x)}, ${round3(this.y)}]`;
      }

      /**
       * Set TwoVector values
       *
       * @param {Number} x x-value
       * @param {Number} y y-value
       * @return {TwoVector} returns self
       */
      set(x, y) {
          this.x = x;
          this.y = y;
          return this;
      }

      multiply(other) {
          this.x *= other.x;
          this.y *= other.y;

          return this;
      }

      /**
       * Multiply this TwoVector by a scalar
       *
       * @param {Number} s the scale
       * @return {TwoVector} returns self
       */
      multiplyScalar(s) {
          this.x *= s;
          this.y *= s;

          return this;
      }

      /**
       * Add other vector to this vector
       *
       * @param {TwoVector} other the other vector
       * @return {TwoVector} returns self
       */
      add(other) {
          this.x += other.x;
          this.y += other.y;

          return this;
      }

      /**
       * Subtract other vector to this vector
       *
       * @param {TwoVector} other the other vector
       * @return {TwoVector} returns self
       */
      subtract(other) {
          this.x -= other.x;
          this.y -= other.y;

          return this;
      }

      /**
       * Get vector length
       *
       * @return {Number} length of this vector
       */
      length() {
          return Math.sqrt(this.x * this.x + this.y * this.y);
      }

      /**
       * Normalize this vector, in-place
       *
       * @return {TwoVector} returns self
       */
      normalize() {
          this.multiplyScalar(1 / this.length());
          return this;
      }

      /**
       * Copy values from another TwoVector into this TwoVector
       *
       * @param {TwoVector} sourceObj the other vector
       * @return {TwoVector} returns self
       */
      copy(sourceObj) {
          this.x = sourceObj.x;
          this.y = sourceObj.y;

          return this;
      }

      /**
       * Create a clone of this vector
       *
       * @return {TwoVector} returns clone
       */
      clone() {
          return new TwoVector(this.x, this.y);
      }

      /**
       * Apply in-place lerp (linear interpolation) to this TwoVector
       * towards another TwoVector
       * @param {TwoVector} target the target vector
       * @param {Number} p The percentage to interpolate
       * @return {TwoVector} returns self
       */
      lerp(target, p) {
          this.x += (target.x - this.x) * p;
          this.y += (target.y - this.y) * p;

          return this;
      }

      /**
       * Get bending Delta Vector
       * towards another TwoVector
       * @param {TwoVector} target the target vector
       * @param {Object} options bending options
       * @param {Number} options.increments number of increments
       * @param {Number} options.percent The percentage to bend
       * @param {Number} options.min No less than this value
       * @param {Number} options.max No more than this value
       * @return {TwoVector} returns new Incremental Vector
       */
      getBendingDelta(target, options) {
          let increment = target.clone();
          increment.subtract(this);
          increment.multiplyScalar(options.percent);

          // check for max case
          if (((typeof options.max === 'number') && increment.length() > options.max) ||
              ((typeof options.min === 'number') && increment.length() < options.min)) {
              return new TwoVector(0, 0);
          }

          // divide into increments
          increment.multiplyScalar(1 / options.increments);

          return increment;
      }
  }

  // Hierarchical Spatial Hash Grid: HSHG
  // source: https://gist.github.com/kirbysayshi/1760774

  // ---------------------------------------------------------------------
  // GLOBAL FUNCTIONS
  // ---------------------------------------------------------------------

  /**
   * Updates every object's position in the grid, but only if
   * the hash value for that object has changed.
   * This method DOES NOT take into account object expansion or
   * contraction, just position, and does not attempt to change
   * the grid the object is currently in; it only (possibly) changes
   * the cell.
   *
   * If the object has significantly changed in size, the best bet is to
   * call removeObject() and addObject() sequentially, outside of the
   * normal update cycle of HSHG.
   *
   * @return  void   desc
   */
  function update_RECOMPUTE() {

      var i,
          obj,
          grid,
          meta,
          objAABB,
          newObjHash;

      // for each object
      for (i = 0; i < this._globalObjects.length; i++) {
          obj = this._globalObjects[i];
          meta = obj.HSHG;
          grid = meta.grid;

          // recompute hash
          objAABB = obj.getAABB();
          newObjHash = grid.toHash(objAABB.min[0], objAABB.min[1]);

          if (newObjHash !== meta.hash) {
              // grid position has changed, update!
              grid.removeObject(obj);
              grid.addObject(obj, newObjHash);
          }
      }
  }

  // not implemented yet :)
  function update_REMOVEALL() {

  }

  function testAABBOverlap(objA, objB) {
      var a = objA.getAABB(),
          b = objB.getAABB();

      // if(a.min[0] > b.max[0] || a.min[1] > b.max[1] || a.min[2] > b.max[2]
      // || a.max[0] < b.min[0] || a.max[1] < b.min[1] || a.max[2] < b.min[2]){

      if (a.min[0] > b.max[0] || a.min[1] > b.max[1] ||
          a.max[0] < b.min[0] || a.max[1] < b.min[1]) {
          return false;
      }
      return true;

  }

  function getLongestAABBEdge(min, max) {
      return Math.max(
          Math.abs(max[0] - min[0])
          , Math.abs(max[1] - min[1])
          // ,Math.abs(max[2] - min[2])
      );
  }

  // ---------------------------------------------------------------------
  // ENTITIES
  // ---------------------------------------------------------------------

  function HSHG() {

      this.MAX_OBJECT_CELL_DENSITY = 1 / 8; // objects / cells
      this.INITIAL_GRID_LENGTH = 256; // 16x16
      this.HIERARCHY_FACTOR = 2;
      this.HIERARCHY_FACTOR_SQRT = Math.SQRT2;
      this.UPDATE_METHOD = update_RECOMPUTE; // or update_REMOVEALL

      this._grids = [];
      this._globalObjects = [];
  }

  // HSHG.prototype.init = function(){
  //	this._grids = [];
  //	this._globalObjects = [];
  // }

  HSHG.prototype.addObject = function (obj) {
      var x, i,
          cellSize,
          objAABB = obj.getAABB(),
          objSize = getLongestAABBEdge(objAABB.min, objAABB.max),
          oneGrid, newGrid;

      // for HSHG metadata
      obj.HSHG = {
          globalObjectsIndex: this._globalObjects.length
      };

      // add to global object array
      this._globalObjects.push(obj);

      if (this._grids.length == 0) {
          // no grids exist yet
          cellSize = objSize * this.HIERARCHY_FACTOR_SQRT;
          newGrid = new Grid(cellSize, this.INITIAL_GRID_LENGTH, this);
          newGrid.initCells();
          newGrid.addObject(obj);

          this._grids.push(newGrid);
      } else {
          x = 0;

          // grids are sorted by cellSize, smallest to largest
          for (i = 0; i < this._grids.length; i++) {
              oneGrid = this._grids[i];
              x = oneGrid.cellSize;
              if (objSize < x) {
                  x /= this.HIERARCHY_FACTOR;
                  if (objSize < x) {
                      // find appropriate size
                      while (objSize < x) {
                          x /= this.HIERARCHY_FACTOR;
                      }
                      newGrid = new Grid(x * this.HIERARCHY_FACTOR, this.INITIAL_GRID_LENGTH, this);
                      newGrid.initCells();
                      // assign obj to grid
                      newGrid.addObject(obj);
                      // insert grid into list of grids directly before oneGrid
                      this._grids.splice(i, 0, newGrid);
                  } else {
                      // insert obj into grid oneGrid
                      oneGrid.addObject(obj);
                  }
                  return;
              }
          }

          while (objSize >= x) {
              x *= this.HIERARCHY_FACTOR;
          }

          newGrid = new Grid(x, this.INITIAL_GRID_LENGTH, this);
          newGrid.initCells();
          // insert obj into grid
          newGrid.addObject(obj);
          // add newGrid as last element in grid list
          this._grids.push(newGrid);
      }
  };

  HSHG.prototype.removeObject = function (obj) {
      var meta = obj.HSHG,
          globalObjectsIndex,
          replacementObj;

      if (meta === undefined) {
          throw Error(obj + ' was not in the HSHG.');
          return;
      }

      // remove object from global object list
      globalObjectsIndex = meta.globalObjectsIndex;
      if (globalObjectsIndex === this._globalObjects.length - 1) {
          this._globalObjects.pop();
      } else {
          replacementObj = this._globalObjects.pop();
          replacementObj.HSHG.globalObjectsIndex = globalObjectsIndex;
          this._globalObjects[globalObjectsIndex] = replacementObj;
      }

      meta.grid.removeObject(obj);

      // remove meta data
      delete obj.HSHG;
  };

  HSHG.prototype.update = function () {
      this.UPDATE_METHOD.call(this);
  };

  HSHG.prototype.queryForCollisionPairs = function (broadOverlapTestCallback) {

      var i, j, k, l, c,
          grid,
          cell,
          objA,
          objB,
          offset,
          adjacentCell,
          biggerGrid,
          objAAABB,
          objAHashInBiggerGrid,
          possibleCollisions = [];

      // default broad test to internal aabb overlap test
      let broadOverlapTest = broadOverlapTestCallback || testAABBOverlap;

      // for all grids ordered by cell size ASC
      for (i = 0; i < this._grids.length; i++) {
          grid = this._grids[i];

          // for each cell of the grid that is occupied
          for (j = 0; j < grid.occupiedCells.length; j++) {
              cell = grid.occupiedCells[j];

              // collide all objects within the occupied cell
              for (k = 0; k < cell.objectContainer.length; k++) {
                  objA = cell.objectContainer[k];
                  for (l = k + 1; l < cell.objectContainer.length; l++) {
                      objB = cell.objectContainer[l];
                      if (broadOverlapTest(objA, objB) === true) {
                          possibleCollisions.push([objA, objB]);
                      }
                  }
              }

              // for the first half of all adjacent cells (offset 4 is the current cell)
              for (c = 0; c < 4; c++) {
                  offset = cell.neighborOffsetArray[c];

                  // if(offset === null) { continue; }

                  adjacentCell = grid.allCells[cell.allCellsIndex + offset];

                  // collide all objects in cell with adjacent cell
                  for (k = 0; k < cell.objectContainer.length; k++) {
                      objA = cell.objectContainer[k];
                      for (l = 0; l < adjacentCell.objectContainer.length; l++) {
                          objB = adjacentCell.objectContainer[l];
                          if (broadOverlapTest(objA, objB) === true) {
                              possibleCollisions.push([objA, objB]);
                          }
                      }
                  }
              }
          }

          // forall objects that are stored in this grid
          for (j = 0; j < grid.allObjects.length; j++) {
              objA = grid.allObjects[j];
              objAAABB = objA.getAABB();

              // for all grids with cellsize larger than grid
              for (k = i + 1; k < this._grids.length; k++) {
                  biggerGrid = this._grids[k];
                  objAHashInBiggerGrid = biggerGrid.toHash(objAAABB.min[0], objAAABB.min[1]);
                  cell = biggerGrid.allCells[objAHashInBiggerGrid];

                  // check objA against every object in all cells in offset array of cell
                  // for all adjacent cells...
                  for (c = 0; c < cell.neighborOffsetArray.length; c++) {
                      offset = cell.neighborOffsetArray[c];

                      // if(offset === null) { continue; }

                      adjacentCell = biggerGrid.allCells[cell.allCellsIndex + offset];

                      // for all objects in the adjacent cell...
                      for (l = 0; l < adjacentCell.objectContainer.length; l++) {
                          objB = adjacentCell.objectContainer[l];
                          // test against object A
                          if (broadOverlapTest(objA, objB) === true) {
                              possibleCollisions.push([objA, objB]);
                          }
                      }
                  }
              }
          }
      }

      // return list of object pairs
      return possibleCollisions;
  };

  HSHG.update_RECOMPUTE = update_RECOMPUTE;
  HSHG.update_REMOVEALL = update_REMOVEALL;

  /**
   * Grid
   *
   * @constructor
   * @param    int cellSize  the pixel size of each cell of the grid
   * @param    int cellCount  the total number of cells for the grid (width x height)
   * @param    HSHG parentHierarchy    the HSHG to which this grid belongs
   * @return  void
   */
  function Grid(cellSize, cellCount, parentHierarchy) {
      this.cellSize = cellSize;
      this.inverseCellSize = 1 / cellSize;
      this.rowColumnCount = ~~Math.sqrt(cellCount);
      this.xyHashMask = this.rowColumnCount - 1;
      this.occupiedCells = [];
      this.allCells = Array(this.rowColumnCount * this.rowColumnCount);
      this.allObjects = [];
      this.sharedInnerOffsets = [];

      this._parentHierarchy = parentHierarchy || null;
  }

  Grid.prototype.initCells = function () {

      // TODO: inner/unique offset rows 0 and 2 may need to be
      // swapped due to +y being "down" vs "up"

      var i,
          gridLength = this.allCells.length,
          x, y,
          wh = this.rowColumnCount,
          isOnRightEdge, isOnLeftEdge, isOnTopEdge, isOnBottomEdge,
          innerOffsets = [
              // y+ down offsets
              // -1 + -wh, -wh, -wh + 1,
              // -1, 0, 1,
              // wh - 1, wh, wh + 1

              // y+ up offsets
              wh - 1, wh, wh + 1,
              -1, 0, 1,
              -1 + -wh, -wh, -wh + 1
          ],
          leftOffset, rightOffset, topOffset, bottomOffset,
          uniqueOffsets = [],
          cell;

      this.sharedInnerOffsets = innerOffsets;

      // init all cells, creating offset arrays as needed

      for (i = 0; i < gridLength; i++) {

          cell = new Cell();
          // compute row (y) and column (x) for an index
          y = ~~(i / this.rowColumnCount);
          x = ~~(i - (y * this.rowColumnCount));

          // reset / init
          isOnRightEdge = false;
          isOnLeftEdge = false;
          isOnTopEdge = false;
          isOnBottomEdge = false;

          // right or left edge cell
          if ((x + 1) % this.rowColumnCount == 0) {
              isOnRightEdge = true;
          } else if (x % this.rowColumnCount == 0) {
              isOnLeftEdge = true;
          }

          // top or bottom edge cell
          if ((y + 1) % this.rowColumnCount == 0) {
              isOnTopEdge = true;
          } else if (y % this.rowColumnCount == 0) {
              isOnBottomEdge = true;
          }

          // if cell is edge cell, use unique offsets, otherwise use inner offsets
          if (isOnRightEdge || isOnLeftEdge || isOnTopEdge || isOnBottomEdge) {

              // figure out cardinal offsets first
              rightOffset = isOnRightEdge === true ? -wh + 1 : 1;
              leftOffset = isOnLeftEdge === true ? wh - 1 : -1;
              topOffset = isOnTopEdge === true ? -gridLength + wh : wh;
              bottomOffset = isOnBottomEdge === true ? gridLength - wh : -wh;

              // diagonals are composites of the cardinals
              uniqueOffsets = [
                  // y+ down offset
                  // leftOffset + bottomOffset, bottomOffset, rightOffset + bottomOffset,
                  // leftOffset, 0, rightOffset,
                  // leftOffset + topOffset, topOffset, rightOffset + topOffset

                  // y+ up offset
                  leftOffset + topOffset, topOffset, rightOffset + topOffset,
                  leftOffset, 0, rightOffset,
                  leftOffset + bottomOffset, bottomOffset, rightOffset + bottomOffset
              ];

              cell.neighborOffsetArray = uniqueOffsets;
          } else {
              cell.neighborOffsetArray = this.sharedInnerOffsets;
          }

          cell.allCellsIndex = i;
          this.allCells[i] = cell;
      }
  };

  Grid.prototype.toHash = function (x, y, z) {
      var i, xHash, yHash;

      if (x < 0) {
          i = (-x) * this.inverseCellSize;
          xHash = this.rowColumnCount - 1 - (~~i & this.xyHashMask);
      } else {
          i = x * this.inverseCellSize;
          xHash = ~~i & this.xyHashMask;
      }

      if (y < 0) {
          i = (-y) * this.inverseCellSize;
          yHash = this.rowColumnCount - 1 - (~~i & this.xyHashMask);
      } else {
          i = y * this.inverseCellSize;
          yHash = ~~i & this.xyHashMask;
      }

      // if(z < 0){
      //	i = (-z) * this.inverseCellSize;
      //	zHash = this.rowColumnCount - 1 - ( ~~i & this.xyHashMask );
      // } else {
      //	i = z * this.inverseCellSize;
      //	zHash = ~~i & this.xyHashMask;
      // }

      return xHash + yHash * this.rowColumnCount;
      // + zHash * this.rowColumnCount * this.rowColumnCount;
  };

  Grid.prototype.addObject = function (obj, hash) {
      var objAABB,
          objHash,
          targetCell;

      // technically, passing this in this should save some computational effort when updating objects
      if (hash !== undefined) {
          objHash = hash;
      } else {
          objAABB = obj.getAABB();
          objHash = this.toHash(objAABB.min[0], objAABB.min[1]);
      }
      targetCell = this.allCells[objHash];

      if (targetCell.objectContainer.length === 0) {
          // insert this cell into occupied cells list
          targetCell.occupiedCellsIndex = this.occupiedCells.length;
          this.occupiedCells.push(targetCell);
      }

      // add meta data to obj, for fast update/removal
      obj.HSHG.objectContainerIndex = targetCell.objectContainer.length;
      obj.HSHG.hash = objHash;
      obj.HSHG.grid = this;
      obj.HSHG.allGridObjectsIndex = this.allObjects.length;
      // add obj to cell
      targetCell.objectContainer.push(obj);

      // we can assume that the targetCell is already a member of the occupied list

      // add to grid-global object list
      this.allObjects.push(obj);

      // do test for grid density
      if (this.allObjects.length / this.allCells.length > this._parentHierarchy.MAX_OBJECT_CELL_DENSITY) {
          // grid must be increased in size
          this.expandGrid();
      }
  };

  Grid.prototype.removeObject = function (obj) {
      var meta = obj.HSHG,
          hash,
          containerIndex,
          allGridObjectsIndex,
          cell,
          replacementCell,
          replacementObj;

      hash = meta.hash;
      containerIndex = meta.objectContainerIndex;
      allGridObjectsIndex = meta.allGridObjectsIndex;
      cell = this.allCells[hash];

      // remove object from cell object container
      if (cell.objectContainer.length === 1) {
          // this is the last object in the cell, so reset it
          cell.objectContainer.length = 0;

          // remove cell from occupied list
          if (cell.occupiedCellsIndex === this.occupiedCells.length - 1) {
              // special case if the cell is the newest in the list
              this.occupiedCells.pop();
          } else {
              replacementCell = this.occupiedCells.pop();
              replacementCell.occupiedCellsIndex = cell.occupiedCellsIndex;
              this.occupiedCells[cell.occupiedCellsIndex] = replacementCell;
          }

          cell.occupiedCellsIndex = null;
      } else {
          // there is more than one object in the container
          if (containerIndex === cell.objectContainer.length - 1) {
              // special case if the obj is the newest in the container
              cell.objectContainer.pop();
          } else {
              replacementObj = cell.objectContainer.pop();
              replacementObj.HSHG.objectContainerIndex = containerIndex;
              cell.objectContainer[containerIndex] = replacementObj;
          }
      }

      // remove object from grid object list
      if (allGridObjectsIndex === this.allObjects.length - 1) {
          this.allObjects.pop();
      } else {
          replacementObj = this.allObjects.pop();
          replacementObj.HSHG.allGridObjectsIndex = allGridObjectsIndex;
          this.allObjects[allGridObjectsIndex] = replacementObj;
      }
  };

  Grid.prototype.expandGrid = function () {
      var i, currentCellCount = this.allCells.length,
          currentRowColumnCount = this.rowColumnCount,
          currentXYHashMask = this.xyHashMask,

          newCellCount = currentCellCount * 4, // double each dimension
          newRowColumnCount = ~~Math.sqrt(newCellCount),
          newXYHashMask = newRowColumnCount - 1,
          allObjects = this.allObjects.slice(0); // duplicate array, not objects contained

      // remove all objects
      for (i = 0; i < allObjects.length; i++) {
          this.removeObject(allObjects[i]);
      }

      // reset grid values, set new grid to be 4x larger than last
      this.rowColumnCount = newRowColumnCount;
      this.allCells = Array(this.rowColumnCount * this.rowColumnCount);
      this.xyHashMask = newXYHashMask;

      // initialize new cells
      this.initCells();

      // re-add all objects to grid
      for (i = 0; i < allObjects.length; i++) {
          this.addObject(allObjects[i]);
      }
  };

  /**
   * A cell of the grid
   *
   * @constructor
   * @return  void   desc
   */
  function Cell() {
      this.objectContainer = [];
      this.neighborOffsetArray;
      this.occupiedCellsIndex = null;
      this.allCellsIndex = null;
  }

  // ---------------------------------------------------------------------
  // EXPORTS
  // ---------------------------------------------------------------------

  HSHG._private = {
      Grid: Grid,
      Cell: Cell,
      testAABBOverlap: testAABBOverlap,
      getLongestAABBEdge: getLongestAABBEdge
  };

  // Collision detection based on Hierarchical Spatial Hash Grid
  // uses this implementation https://gist.github.com/kirbysayshi/1760774
  class HSHGCollisionDetection {

      constructor(options) {
          this.options = Object.assign({ COLLISION_DISTANCE: 28 }, options);
      }

      init(options) {
          this.gameEngine = options.gameEngine;
          this.grid = new HSHG();
          this.previousCollisionPairs = {};
          this.stepCollidingPairs = {};

          this.gameEngine.on('objectAdded', obj => {
              // add the gameEngine obj the the spatial grid
              this.grid.addObject(obj);
          });

          this.gameEngine.on('objectDestroyed', obj => {
              // add the gameEngine obj the the spatial grid
              this.grid.removeObject(obj);
          });
      }

      detect() {
          this.grid.update();
          this.stepCollidingPairs = this.grid.queryForCollisionPairs().reduce((accumulator, currentValue, i) => {
              let pairId = getArrayPairId(currentValue);
              accumulator[pairId] = { o1: currentValue[0], o2: currentValue[1] };
              return accumulator;
          }, {});

          for (let pairId of Object.keys(this.previousCollisionPairs)) {
              let pairObj = this.previousCollisionPairs[pairId];

              // existed in previous pairs, but not during this step: this pair stopped colliding
              if (pairId in this.stepCollidingPairs === false) {
                  this.gameEngine.emit('collisionStop', pairObj);
              }
          }

          for (let pairId of Object.keys(this.stepCollidingPairs)) {
              let pairObj = this.stepCollidingPairs[pairId];

              // didn't exist in previous pairs, but exists now: this is a new colliding pair
              if (pairId in this.previousCollisionPairs === false) {
                  this.gameEngine.emit('collisionStart', pairObj);
              }
          }

          this.previousCollisionPairs = this.stepCollidingPairs;
      }

      /**
       * checks wheter two objects are currently colliding
       * @param {Object} o1 first object
       * @param {Object} o2 second object
       * @return {boolean} are the two objects colliding?
       */
      areObjectsColliding(o1, o2) {
          return getArrayPairId([o1, o2]) in this.stepCollidingPairs;
      }

  }

  function getArrayPairId(arrayPair) {
      // make sure to get the same id regardless of object order
      let sortedArrayPair = arrayPair.slice(0).sort();
      return sortedArrayPair[0].id + '-' + sortedArrayPair[1].id;
  }

  let differenceVector = new TwoVector();

  // The collision detection of SimplePhysicsEngine is a brute-force approach
  class BruteForceCollisionDetection {

      constructor(options) {
          this.options = Object.assign({
              autoResolve: true
          }, options);
          this.collisionPairs = {};
      }

      init(options) {
          this.gameEngine = options.gameEngine;
      }

      findCollision(o1, o2) {

          // static objects don't collide
          if (o1.isStatic && o2.isStatic)
              return false;

          // allow a collision checker function
          if (typeof o1.collidesWith === 'function') {
              if (!o1.collidesWith(o2))
                  return false;
          }

          // radius-based collision
          if (this.options.collisionDistance) {
              differenceVector.copy(o1.position).subtract(o2.position);
              return differenceVector.length() < this.options.collisionDistance;
          }

          // check for no-collision first
          let o1Box = getBox(o1);
          let o2Box = getBox(o2);
          if (o1Box.xMin > o2Box.xMax ||
              o1Box.yMin > o2Box.yMax ||
              o2Box.xMin > o1Box.xMax ||
              o2Box.yMin > o1Box.yMax)
              return false;

          if (!this.options.autoResolve)
              return true;

          // need to auto-resolve
          let shiftY1 = o2Box.yMax - o1Box.yMin;
          let shiftY2 = o1Box.yMax - o2Box.yMin;
          let shiftX1 = o2Box.xMax - o1Box.xMin;
          let shiftX2 = o1Box.xMax - o2Box.xMin;
          let smallestYShift = Math.min(Math.abs(shiftY1), Math.abs(shiftY2));
          let smallestXShift = Math.min(Math.abs(shiftX1), Math.abs(shiftX2));

          // choose to apply the smallest shift which solves the collision
          if (smallestYShift < smallestXShift) {
              if (o1Box.yMin > o2Box.yMin && o1Box.yMin < o2Box.yMax) {
                  if (o2.isStatic) o1.position.y += shiftY1;
                  else if (o1.isStatic) o2.position.y -= shiftY1;
                  else {
                      o1.position.y += shiftY1 / 2;
                      o2.position.y -= shiftY1 / 2;
                  }
              } else if (o1Box.yMax > o2Box.yMin && o1Box.yMax < o2Box.yMax) {
                  if (o2.isStatic) o1.position.y -= shiftY2;
                  else if (o1.isStatic) o2.position.y += shiftY2;
                  else {
                      o1.position.y -= shiftY2 / 2;
                      o2.position.y += shiftY2 / 2;
                  }
              }
              o1.velocity.y = 0;
              o2.velocity.y = 0;
          } else {
              if (o1Box.xMin > o2Box.xMin && o1Box.xMin < o2Box.xMax) {
                  if (o2.isStatic) o1.position.x += shiftX1;
                  else if (o1.isStatic) o2.position.x -= shiftX1;
                  else {
                      o1.position.x += shiftX1 / 2;
                      o2.position.x -= shiftX1 / 2;
                  }
              } else if (o1Box.xMax > o2Box.xMin && o1Box.xMax < o2Box.xMax) {
                  if (o2.isStatic) o1.position.x -= shiftX2;
                  else if (o1.isStatic) o2.position.x += shiftX2;
                  else {
                      o1.position.x -= shiftX2 / 2;
                      o2.position.x += shiftX2 / 2;
                  }
              }
              o1.velocity.x = 0;
              o2.velocity.x = 0;
          }

          return true;
      }

      // check if pair (id1, id2) have collided
      checkPair(id1, id2) {
          let objects = this.gameEngine.world.objects;
          let o1 = objects[id1];
          let o2 = objects[id2];

          // make sure that objects actually exist. might have been destroyed
          if (!o1 || !o2) return;
          let pairId = [id1, id2].join(',');

          if (this.findCollision(o1, o2)) {
              if (!(pairId in this.collisionPairs)) {
                  this.collisionPairs[pairId] = true;
                  this.gameEngine.emit('collisionStart', { o1, o2 });
              }
          } else if (pairId in this.collisionPairs) {
              this.gameEngine.emit('collisionStop', { o1, o2 });
              delete this.collisionPairs[pairId];
          }
      }

      // detect by checking all pairs
      detect() {
          let objects = this.gameEngine.world.objects;
          let keys = Object.keys(objects);

          // delete non existant object pairs
          for (let pairId in this.collisionPairs)
              if (this.collisionPairs.hasOwnProperty(pairId))
                  if (keys.indexOf(pairId.split(',')[0]) === -1 || keys.indexOf(pairId.split(',')[1]) === -1)
                      delete this.collisionPairs[pairId];

          // check all pairs
          for (let k1 of keys)
              for (let k2 of keys)
                  if (k2 > k1) this.checkPair(k1, k2);
      }
  }

  // get bounding box of object o
  function getBox(o) {
      return {
          xMin: o.position.x,
          xMax: o.position.x + o.width,
          yMin: o.position.y,
          yMax: o.position.y + o.height
      };
  }

  let dv = new TwoVector();
  let dx = new TwoVector();

  /**
   * SimplePhysicsEngine is a pseudo-physics engine which works with
   * objects of class DynamicObject.
   * The Simple Physics Engine is a "fake" physics engine, which is more
   * appropriate for arcade games, and it is sometimes referred to as "arcade"
   * physics. For example if a character is standing at the edge of a platform,
   * with only one foot on the platform, it won't fall over. This is a desired
   * game behaviour in platformer games.
   */

  class SimplePhysicsEngine extends PhysicsEngine {

      /**
      * Creates an instance of the Simple Physics Engine.
      * @param {Object} options - physics options
      * @param {Object} options.collisions - collision options
      * @param {String} options.collisions.type - can be set to "HSHG" or "bruteForce".  Default is Brute-Force collision detection.
      * @param {Number} options.collisions.collisionDistance - for brute force, this can be set for a simple distance-based (radius) collision detection.
      * @param {Boolean} options.collisions.autoResolve - for brute force collision, colliding objects should be moved apart
      * @param {TwoVector} options.gravity - TwoVector instance which describes gravity, which will be added to the velocity of all objects at every step.  For example TwoVector(0, -0.01)
      */
      constructor(options) {
          super(options);

          // todo does this mean both modules always get loaded?
          if (options.collisions && options.collisions.type === 'HSHG') {
              this.collisionDetection = new HSHGCollisionDetection(options.collisions);
          } else {
              this.collisionDetection = new BruteForceCollisionDetection(options.collisions);
          }

          /**
           * The actor's name.
           * @memberof SimplePhysicsEngine
           * @member {TwoVector} gravity affecting all objects
           */
          this.gravity = new TwoVector(0, 0);

          if (options.gravity)
              this.gravity.copy(options.gravity);

          let collisionOptions = Object.assign({ gameEngine: this.gameEngine }, options.collisionOptions);
          this.collisionDetection.init(collisionOptions);
      }

      // a single object advances, based on:
      // isRotatingRight, isRotatingLeft, isAccelerating, current velocity
      // wrap-around the world if necessary
      objectStep(o, dt) {

          // calculate factor
          if (dt === 0)
              return;

          if (dt)
              dt /= (1 / 60);
          else
              dt = 1;

          // TODO: worldsettings is a hack.  Find all places which use it in all games
          // and come up with a better solution.  for example an option sent to the physics Engine
          // with a "worldWrap:true" options
          // replace with a "worldBounds" parameter to the PhysicsEngine constructor

          let worldSettings = this.gameEngine.worldSettings;

          // TODO: remove this code in version 4: these attributes are deprecated
          if (o.isRotatingRight) { o.angle += o.rotationSpeed; }
          if (o.isRotatingLeft) { o.angle -= o.rotationSpeed; }

          // TODO: remove this code in version 4: these attributes are deprecated
          if (o.angle >= 360) { o.angle -= 360; }
          if (o.angle < 0) { o.angle += 360; }

          // TODO: remove this code in version 4: these attributes are deprecated
          if (o.isAccelerating) {
              let rad = o.angle * (Math.PI / 180);
              dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(o.acceleration).multiplyScalar(dt);
              o.velocity.add(dv);
          }

          // apply gravity
          if (!o.isStatic) o.velocity.add(this.gravity);

          let velMagnitude = o.velocity.length();
          if ((o.maxSpeed !== null) && (velMagnitude > o.maxSpeed)) {
              o.velocity.multiplyScalar(o.maxSpeed / velMagnitude);
          }

          o.isAccelerating = false;
          o.isRotatingLeft = false;
          o.isRotatingRight = false;

          dx.copy(o.velocity).multiplyScalar(dt);
          o.position.add(dx);

          o.velocity.multiply(o.friction);

          // wrap around the world edges
          if (worldSettings.worldWrap) {
              if (o.position.x >= worldSettings.width) { o.position.x -= worldSettings.width; }
              if (o.position.y >= worldSettings.height) { o.position.y -= worldSettings.height; }
              if (o.position.x < 0) { o.position.x += worldSettings.width; }
              if (o.position.y < 0) { o.position.y += worldSettings.height; }
          }
      }

      // entry point for a single step of the Simple Physics
      step(dt, objectFilter) {

          // each object should advance
          let objects = this.gameEngine.world.objects;
          for (let objId of Object.keys(objects)) {

              // shadow objects are not re-enacted
              let ob = objects[objId];
              if (!objectFilter(ob))
                  continue;

              // run the object step
              this.objectStep(ob, dt);
          }

          // emit event on collision
          this.collisionDetection.detect(this.gameEngine);
      }
  }

  const CANNON = require('cannon');

  /**
   * CannonPhysicsEngine is a three-dimensional lightweight physics engine
   */
  class CannonPhysicsEngine extends PhysicsEngine {

      constructor(options) {
          super(options);

          this.options.dt = this.options.dt || (1 / 60);
          let world = this.world = new CANNON.World();
          world.quatNormalizeSkip = 0;
          world.quatNormalizeFast = false;
          world.gravity.set(0, -10, 0);
          world.broadphase = new CANNON.NaiveBroadphase();
          this.CANNON = CANNON;
      }

      // entry point for a single step of the Simple Physics
      step(dt, objectFilter) {
          this.world.step(dt || this.options.dt);
      }

      addSphere(radius, mass) {
          let shape = new CANNON.Sphere(radius);
          let body = new CANNON.Body({ mass, shape });
          body.position.set(0, 0, 0);
          this.world.addBody(body);
          return body;
      }

      addBox(x, y, z, mass, friction) {
          let shape = new CANNON.Box(new CANNON.Vec3(x, y, z));
          let options = { mass, shape };
          if (friction !== undefined)
              options.material = new CANNON.Material({ friction });

          let body = new CANNON.Body(options);
          body.position.set(0, 0, 0);
          this.world.addBody(body);
          return body;
      }

      addCylinder(radiusTop, radiusBottom, height, numSegments, mass) {
          let shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments);
          let body = new CANNON.Body({ mass, shape });
          this.world.addBody(body);
          return body;
      }

      removeObject(obj) {
          this.world.removeBody(obj);
      }
  }

  /**
   * A ThreeVector is a geometric object which is completely described
   * by three values.
   */
  class ThreeVector extends Serializable {

      static get netScheme() {
          return {
              x: { type: BaseTypes.TYPES.FLOAT32 },
              y: { type: BaseTypes.TYPES.FLOAT32 },
              z: { type: BaseTypes.TYPES.FLOAT32 }
          };
      }

      /**
      * Creates an instance of a ThreeVector.
      * @param {Number} x - first value
      * @param {Number} y - second value
      * @param {Number} z - second value
      * @return {ThreeVector} v - the new ThreeVector
      */
      constructor(x, y, z) {
          super();
          this.x = x;
          this.y = y;
          this.z = z;

          return this;
      }

      /**
       * Formatted textual description of the ThreeVector.
       * @return {String} description
       */
      toString() {
          function round3(x) { return Math.round(x * 1000) / 1000; }
          return `[${round3(this.x)}, ${round3(this.y)}, ${round3(this.z)}]`;
      }

      /**
       * Multiply this ThreeVector by a scalar
       *
       * @param {Number} s the scale
       * @return {ThreeVector} returns self
       */
      multiplyScalar(s) {
          this.x *= s;
          this.y *= s;
          this.z *= s;
          return this;
      }

      /**
       * Get vector length
       *
       * @return {Number} length of this vector
       */
      length() {
          return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      }

      /**
       * Add other vector to this vector
       *
       * @param {ThreeVector} other the other vector
       * @return {ThreeVector} returns self
       */
      add(other) {
          this.x += other.x;
          this.y += other.y;
          this.z += other.z;
          return this;
      }

      /**
       * Subtract other vector from this vector
       *
       * @param {ThreeVector} other the other vector
       * @return {ThreeVector} returns self
       */
      subtract(other) {
          this.x -= other.x;
          this.y -= other.y;
          this.z -= other.z;
          return this;
      }

      /**
       * Normalize this vector, in-place
       *
       * @return {ThreeVector} returns self
       */
      normalize() {
          this.multiplyScalar(1 / this.length());
          return this;
      }

      /**
       * Copy values from another ThreeVector into this ThreeVector
       *
       * @param {ThreeVector} sourceObj the other vector
       * @return {ThreeVector} returns self
       */
      copy(sourceObj) {
          this.x = sourceObj.x;
          this.y = sourceObj.y;
          this.z = sourceObj.z;
          return this;
      }

      /**
       * Set ThreeVector values
       *
       * @param {Number} x x-value
       * @param {Number} y y-value
       * @param {Number} z z-value
       * @return {ThreeVector} returns self
       */
      set(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
          return this;
      }

      /**
       * Create a clone of this vector
       *
       * @return {ThreeVector} returns clone
       */
      clone() {
          return new ThreeVector(this.x, this.y, this.z);
      }

      /**
       * Apply in-place lerp (linear interpolation) to this ThreeVector
       * towards another ThreeVector
       * @param {ThreeVector} target the target vector
       * @param {Number} p The percentage to interpolate
       * @return {ThreeVector} returns self
       */
      lerp(target, p) {
          this.x += (target.x - this.x) * p;
          this.y += (target.y - this.y) * p;
          this.z += (target.z - this.z) * p;
          return this;
      }

      /**
       * Get bending Delta Vector
       * towards another ThreeVector
       * @param {ThreeVector} target the target vector
       * @param {Object} options bending options
       * @param {Number} options.increments number of increments
       * @param {Number} options.percent The percentage to bend
       * @param {Number} options.min No less than this value
       * @param {Number} options.max No more than this value
       * @return {ThreeVector} returns new Incremental Vector
       */
      getBendingDelta(target, options) {
          let increment = target.clone();
          increment.subtract(this);
          increment.multiplyScalar(options.percent);

          // check for max case
          if ((options.max && increment.length() > options.max) ||
              (options.max && increment.length() < options.min)) {
              return new ThreeVector(0, 0, 0);
          }

          // divide into increments
          increment.multiplyScalar(1 / options.increments);

          return increment;
      }
  }

  const MAX_DEL_THETA = 0.2;

  /**
   * A Quaternion is a geometric object which can be used to
   * represent a three-dimensional rotation.
   */
  class Quaternion extends Serializable {

      static get netScheme() {
          return {
              w: { type: BaseTypes.TYPES.FLOAT32 },
              x: { type: BaseTypes.TYPES.FLOAT32 },
              y: { type: BaseTypes.TYPES.FLOAT32 },
              z: { type: BaseTypes.TYPES.FLOAT32 }
          };
      }

      /**
      * Creates an instance of a Quaternion.
      * @param {Number} w - first value
      * @param {Number} x - second value
      * @param {Number} y - third value
      * @param {Number} z - fourth value
      * @return {Quaternion} v - the new Quaternion
      */
      constructor(w, x, y, z) {
          super();
          this.w = w;
          this.x = x;
          this.y = y;
          this.z = z;

          return this;
      }

      /**
       * Formatted textual description of the Quaternion.
       * @return {String} description
       */
      toString() {
          function round3(x) { return Math.round(x * 1000) / 1000; }
          {
              let axisAngle = this.toAxisAngle();
              return `[${round3(axisAngle.angle)},${axisAngle.axis.toString()}]`;
          }
          return `[${round3(this.w)}, ${round3(this.x)}, ${round3(this.y)}, ${round3(this.z)}]`;
      }

      /**
       * copy values from another quaternion into this quaternion
       *
       * @param {Quaternion} sourceObj the quaternion to copy from
       * @return {Quaternion} returns self
       */
      copy(sourceObj) {
          this.set(sourceObj.w, sourceObj.x, sourceObj.y, sourceObj.z);
          return this;
      }

      /**
       * set quaternion values
       *
       * @param {Number} w w-value
       * @param {Number} x x-value
       * @param {Number} y y-value
       * @param {Number} z z-value
       * @return {Quaternion} returns self
       */
      set(w, x, y, z) {
          this.w = w;
          this.x = x;
          this.y = y;
          this.z = z;

          return this;
      }

      /**
       * return an axis-angle representation of this quaternion
       *
       * @return {Object} contains two attributes: axis (ThreeVector) and angle.
       */
      toAxisAngle() {

          // assuming quaternion normalised then w is less than 1, so term always positive.
          let axis = new ThreeVector(1, 0, 0);
          this.normalize();
          let angle = 2 * Math.acos(this.w);
          let s = Math.sqrt(1 - this.w * this.w);
          if (s > 0.001) {
              let divS = 1 / s;
              axis.x = this.x * divS;
              axis.y = this.y * divS;
              axis.z = this.z * divS;
          }
          if (s > Math.PI) {
              s -= 2 * Math.PI;
          }
          return { axis, angle };
      }

      normalize() {
          let l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
          if (l === 0) {
              this.x = 0;
              this.y = 0;
              this.z = 0;
              this.w = 0;
          } else {
              l = 1 / l;
              this.x *= l;
              this.y *= l;
              this.z *= l;
              this.w *= l;
          }

          return this;
      }

      /**
       * set the values of this quaternion from an axis/angle representation
       *
       * @param {ThreeVector} axis The axis
       * @param {Number} angle angle in radians
       * @return {Quaternion} returns self
       */
      setFromAxisAngle(axis, angle) {

          if (angle < 0)
              angle += Math.PI * 2;
          let halfAngle = angle * 0.5;
          let s = Math.sin(halfAngle);
          this.x = axis.x * s;
          this.y = axis.y * s;
          this.z = axis.z * s;
          this.w = Math.cos(halfAngle);

          return this;
      }

      /**
       * conjugate the quaternion, in-place
       *
       * @return {Quaternion} returns self
       */
      conjugate() {
          this.x *= -1;
          this.y *= -1;
          this.z *= -1;
          return this;
      }

      /* eslint-disable */
      /**
       * multiply this quaternion by another, in-place
       *
       * @param {Quaternion} other The other quaternion
       * @return {Quaternion} returns self
       */
      multiply(other) {
          let aw = this.w, ax = this.x, ay = this.y, az = this.z;
          let bw = other.w, bx = other.x, by = other.y, bz = other.z;

          this.x = ax * bw + aw * bx + ay * bz - az * by;
          this.y = ay * bw + aw * by + az * bx - ax * bz;
          this.z = az * bw + aw * bz + ax * by - ay * bx;
          this.w = aw * bw - ax * bx - ay * by - az * bz;

          return this;
      }
      /* eslint-enable */

      /* eslint-disable */
      /**
       * Apply in-place slerp (spherical linear interpolation) to this quaternion,
       * towards another quaternion.
       *
       * @param {Quaternion} target The target quaternion
       * @param {Number} bending The percentage to interpolate
       * @return {Quaternion} returns self
       */
      slerp(target, bending) {

          if (bending <= 0) return this;
          if (bending >= 1) return this.copy(target);

          let aw = this.w, ax = this.x, ay = this.y, az = this.z;
          let bw = target.w, bx = target.x, by = target.y, bz = target.z;

          let cosHalfTheta = aw*bw + ax*bx + ay*by + az*bz;
          if (cosHalfTheta < 0) {
              this.set(-bw, -bx, -by, -bz);
              cosHalfTheta = -cosHalfTheta;
          } else {
              this.copy(target);
          }

          if (cosHalfTheta >= 1.0) {
              this.set(aw, ax, ay, az);
              return this;
          }

          let sqrSinHalfTheta = 1.0 - cosHalfTheta*cosHalfTheta;
          if (sqrSinHalfTheta < Number.EPSILON) {
              let s = 1 - bending;
              this.set(s*aw + bending*this.w, s*ax + bending*this.x, s*ay + bending*this.y, s*az + bending*this.z);
              return this.normalize();
          }

          let sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
          let halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
          let delTheta = bending * halfTheta;
          if (Math.abs(delTheta) > MAX_DEL_THETA)
              delTheta = MAX_DEL_THETA * Math.sign(delTheta);
          let ratioA = Math.sin(halfTheta - delTheta)/sinHalfTheta;
          let ratioB = Math.sin(delTheta)/sinHalfTheta;
          this.set(aw*ratioA + this.w*ratioB,
              ax*ratioA + this.x*ratioB,
              ay*ratioA + this.y*ratioB,
              az*ratioA + this.z*ratioB);
          return this;
      }
      /* eslint-enable */
  }

  /**
   * GameObject is the base class of all game objects.
   * It is created only for the purpose of clearly defining the game
   * object interface.
   * Game developers will use one of the subclasses such as DynamicObject,
   * or PhysicalObject.
   */
  class GameObject extends Serializable {

      static get netScheme() {
          return {
              id: { type: BaseTypes.TYPES.STRING },
              playerId: { type: BaseTypes.TYPES.STRING }
          };
      }

      /**
      * Creates an instance of a game object.
      * @param {GameEngine} gameEngine - the gameEngine this object will be used in
      * @param {Object} options - options for instantiation of the GameObject
      * @param {Number} id - if set, the new instantiated object will be set to this id instead of being generated a new one. Use with caution!
      * @param {Object} props - additional properties for creation
      * @param {Number} props.playerId - the playerId value of the player who owns this object
      */
      constructor(gameEngine, options, props) {
          super();
          /**
           * The gameEngine this object will be used in
           * @member {GameEngine}
           */
          this.gameEngine = gameEngine;

          /**
          * ID of this object's instance.
          * There are three cases of instance creation which can occur:
          * 1. In the normal case, the constructor is asked to assign an ID which is unique
          * across the entire game world, including the server and all the clients.
          * 2. In extrapolation mode, the client may have an object instance which does not
          * yet exist on the server, these objects are known as shadow objects.  Their IDs must
          * be allocated from a different range.
          * 3. Also, temporary objects are created on the client side each time a sync is received.
          * These are used for interpolation purposes and as bending targets of position, velocity,
          * angular velocity, and orientation.  In this case the id will be set to null.
          * @member {Number}
          */
          this.id = null;
          this.playerId = (props && props.playerId) ? props.playerId : 0;
          
          if (options && 'id' in options)
              this.id = options.id;
          else if (this.gameEngine)
              this.id = this.playerId || this.gameEngine.world.getNewId();

          /**
          * playerId of player who created this object
          * @member {Number}
          */
         

          this.components = {};
      }

      /**
       * Called after the object is added to to the game world.
       * This is the right place to add renderer sub-objects, physics sub-objects
       * and any other resources that should be created
       * @param {GameEngine} gameEngine the game engine
       */
      onAddToWorld(gameEngine) {}

      /**
       * Called after the object is removed from game-world.
       * This is where renderer sub-objects and any other resources should be freed
       * @param {GameEngine} gameEngine the game engine
       */
      onRemoveFromWorld(gameEngine) {}

      /**
       * Formatted textual description of the game object.
       * @return {String} description - a string description
       */
      toString() {
          return `game-object[${this.id}]`;
      }

      /**
       * Formatted textual description of the game object's current bending properties.
       * @return {String} description - a string description
       */
      bendingToString() {
          return 'no bending';
      }

      saveState(other) {
          this.savedCopy = (new this.constructor(this.gameEngine, { id: null }));
          this.savedCopy.syncTo(other ? other : this);
      }
     /**
      * Bending is defined as the amount of error correction that will be applied
      * on the client side to a given object's physical attributes, incrementally,
      * by the time the next server broadcast is expected to arrive.
      *
      * When this percentage is 0.0, the client always ignores the server object's value.
      * When this percentage is 1.0, the server object's attributes will be applied in full.
      *
      * The GameObject bending attribute is implemented as a getter, and can provide
      * distinct values for position, velocity, angle, and angularVelocity.
      * And in each case, you can also provide overrides for local objects,
      * these attributes will be called, respectively, positionLocal, velocityLocal,
      * angleLocal, angularVelocityLocal.
      *
      * @example
      * get bending() {
      *   return {
      *     position: { percent: 1.0, min: 0.0 },
      *     velocity: { percent: 0.0, min: 0.0 },
      *     angularVelocity: { percent: 0.0 },
      *     angleLocal: { percent: 1.0 }
      *   }
      * };
      *
      * @memberof GameObject
      * @member {Object} bending
      */
      get bending() {
          return {
              position: { percent: 1.0, min: 0.0 },
              velocity: { percent: 0.0, min: 0.0 },
              angularVelocity: { percent: 0.0 },
              angleLocal: { percent: 1.0 }
          };
      }

      // TODO:
      // rather than pass worldSettings on each bend, they could
      // be passed in on the constructor just once.
      bendToCurrentState(bending, worldSettings, isLocal, bendingIncrements) {
          if (this.savedCopy) {
              this.bendToCurrent(this.savedCopy, bending, worldSettings, isLocal, bendingIncrements);
          }
          this.savedCopy = null;
      }

      bendToCurrent(original, bending, worldSettings, isLocal, bendingIncrements) {
      }

      /**
       * synchronize this object to the state of an other object, by copying all the netscheme variables.
       * This is used by the synchronizer to create temporary objects, and must be implemented by all sub-classes as well.
       * @param {GameObject} other the other object to synchronize to
       */
      syncTo(other) {
          super.syncTo(other);
          this.playerId = other.playerId;
      }

      // copy physical attributes to physics sub-object
      refreshToPhysics() {}

      // copy physical attributes from physics sub-object
      refreshFromPhysics() {}

      // apply a single bending increment
      applyIncrementalBending() { }

      // clean up resources
      destroy() {}

      addComponent(componentInstance) {
          componentInstance.parentObject = this;
          this.components[componentInstance.constructor.name] = componentInstance;

          // a gameEngine might not exist if this class is instantiated by the serializer
          if (this.gameEngine) {
              this.gameEngine.emit('componentAdded', this, componentInstance);
          }
      }

      removeComponent(componentName) {
          // todo cleanup of the component ?
          delete this.components[componentName];

          // a gameEngine might not exist if this class is instantiated by the serializer
          if (this.gameEngine) {
              this.gameEngine.emit('componentRemoved', this, componentName);
          }
      }

      /**
       * Check whether this game object has a certain component
       * @param {Object} componentClass the comp
       * @return {Boolean} true if the gameObject contains this component
       */
      hasComponent(componentClass) {
          return componentClass.name in this.components;
      }

      getComponent(componentClass) {
          return this.components[componentClass.name];
      }

  }

  class MathUtils {

      // interpolate from start to end, advancing "percent" of the way
      static interpolate(start, end, percent) {
          return (end - start) * percent + start;
      }

      // interpolate from start to end, advancing "percent" of the way
      //
      // returns just the delta. i.e. the value that must be added to the start value
      static interpolateDelta(start, end, percent) {
          return (end - start) * percent;
      }

      // interpolate from start to end, advancing "percent" of the way
      // and noting that the dimension wraps around {x >= wrapMin, x < wrapMax}
      //
      // returns just the delta. i.e. the value that must be added to the start value
      static interpolateDeltaWithWrapping(start, end, percent, wrapMin, wrapMax) {
          let wrapTest = wrapMax - wrapMin;
          if (start - end > wrapTest / 2) end += wrapTest;
          else if (end - start > wrapTest / 2) start += wrapTest;
          if (Math.abs(start - end) > wrapTest / 3) {
              console.log('wrap interpolation is close to limit.  Not sure which edge to wrap to.');
          }
          return (end - start) * percent;
      }

      static interpolateWithWrapping(start, end, percent, wrapMin, wrapMax) {
          let interpolatedVal = start + this.interpolateDeltaWithWrapping(start, end, percent, wrapMin, wrapMax);
          let wrapLength = wrapMax - wrapMin;
          if (interpolatedVal >= wrapLength) interpolatedVal -= wrapLength;
          if (interpolatedVal < 0) interpolatedVal += wrapLength;
          return interpolatedVal;
      }
  }

  /**
   * DynamicObject is the base class of the game's objects, for 2D games which
   * rely on {@link SimplePhysicsEngine}.  It defines the
   * base object which can move around in the game world.  The
   * extensions of this object (the subclasses)
   * will be periodically synchronized from the server to every client.
   *
   * The dynamic objects have pseudo-physical properties, which
   * allow the client to extrapolate the position
   * of dynamic objects in-between server updates.
   */
  class DynamicObject extends GameObject {

      /**
      * The netScheme is a dictionary of attributes in this game
      * object.  The attributes listed in the netScheme are those exact
      * attributes which will be serialized and sent from the server
      * to each client on every server update.
      * The netScheme member is implemented as a getter.
      *
      * You may choose not to implement this method, in which
      * case your object only transmits the default attributes
      * which are already part of {@link DynamicObject}.
      * But if you choose to add more attributes, make sure
      * the return value includes the netScheme of the super class.
      *
      * @memberof DynamicObject
      * @member {Object} netScheme
      * @example
      *     static get netScheme() {
      *       return Object.assign({
      *           mojo: { type: BaseTypes.TYPES.UINT8 },
      *         }, super.netScheme);
      *     }
      */
      static get netScheme() {
          return Object.assign({
              position: { type: BaseTypes.TYPES.CLASSINSTANCE },
              width: { type: BaseTypes.TYPES.INT16 },
              height: { type: BaseTypes.TYPES.INT16 },
              isStatic: { type: BaseTypes.TYPES.UINT8 },
              velocity: { type: BaseTypes.TYPES.CLASSINSTANCE },
              angle: { type: BaseTypes.TYPES.FLOAT32 }
          }, super.netScheme);
      }

      /**
      * Creates an instance of a dynamic object.
      * NOTE 1: do not add logic to subcclasses of this function, instead, create an instance and
      *       assign attributes to the new objects.
      * NOTE 2: all subclasses of this class must comply with this constructor signature.
      *       This is required because the engine will create temporary instances when
      *       syncs arrive on the clients.
      * @param {GameEngine} gameEngine - the gameEngine this object will be used in
      * @param {Object} options - options for the new object. See {@link GameObject}
      * @param {Object} props - properties to be set in the new object
      * @param {TwoVector} props.position - position vector
      * @param {TwoVector} props.velocity - velocity vector
      * @param {Number} props.height - object height
      * @param {Number} props.width - object width
      */
      constructor(gameEngine, options, props) {
          super(gameEngine, options, props);

          this.bendingIncrements = 0;

          this.position = new TwoVector(0, 0);
          this.velocity = new TwoVector(0, 0);

          /**
           * Object width for collision detection purposes. Default is 1
           * @member {Number}
           */
          this.width = (props && props.width) ? props.width : 1;

          /**
           * Object height for collision detection purposes. Default is 1
           * @member {Number}
           */
          this.height = (props && props.height) ? props.height : 1;

          /**
           * Determine if the object is static (i.e. it never moves, like a wall). The value 0 implies the object is dynamic.  Default is 0 (dynamic).
           * @member {Number}
           */
          this.isStatic = (props && props.isStatic) ? props.isStatic : 0;

          /**
           * The friction coefficient. Velocity is multiplied by this for each step. Default is (1,1)
           * @member {TwoVector}
           */
          this.friction = new TwoVector(1, 1);

          /**
          * position
          * @member {TwoVector}
          */
          if (props && props.position) this.position.copy(props.position);

          /**
          * velocity
          * @member {TwoVector}
          */
          if (props && props.velocity) this.velocity.copy(props.velocity);

          /**
          * object orientation angle in degrees
          * @member {Number}
          */
          this.angle = 90;

          /**
          * @deprecated since version 3.0.8
          * should rotate left by {@link DynamicObject#rotationSpeed} on next step
          * @member {Boolean}
          */
          this.isRotatingLeft = false;

          /**
          * @deprecated since version 3.0.8
          * should rotate right by {@link DynamicObject#rotationSpeed} on next step
          * @member {Boolean}
          */
          this.isRotatingRight = false;

          /**
          * @deprecated since version 3.0.8
          * should accelerate by {@link DynamicObject#acceleration} on next step
          * @member {Boolean}
          */
          this.isAccelerating = false;

          /**
          * @deprecated since version 3.0.8
          * angle rotation per step
          * @member {Number}
          */
          this.rotationSpeed = 2.5;

          /**
          * @deprecated since version 3.0.8
          * acceleration per step
          * @member {Number}
          */
          this.acceleration = 0.1;

          this.deceleration = 0.99;
      }

      // convenience getters
      get x() { return this.position.x; }
      get y() { return this.position.y; }

      /**
       * Formatted textual description of the dynamic object.
       * The output of this method is used to describe each instance in the traces,
       * which significantly helps in debugging.
       *
       * @return {String} description - a string describing the DynamicObject
       */
      toString() {
          function round3(x) { return Math.round(x * 1000) / 1000; }
          return `${this.constructor.name}[${this.id}] player${this.playerId} Pos=${this.position} Vel=${this.velocity} angle${round3(this.angle)}`;
      }

      /**
       * Each object class can define its own bending overrides.
       * return an object which can include attributes: position, velocity,
       * and angle.  In each case, you can specify a min value, max
       * value, and a percent value.  { @see GameObject.bending }
       *
       * @return {Object} bending - an object with bending paramters
       */
      get bending() {
          return {
              // example:
              // position: { percent: 0.8, min: 0.0, max: 4.0 },
              // velocity: { percent: 0.4, min: 0.0 },
              // angleLocal: { percent: 0.0 }
          };
      }

      /**
      * turn object clock-wise
      * @param {Number} deltaAngle - the angle to turn, in degrees
      * @return {DynamicObject} return this object
      */
      turnRight(deltaAngle) {
          this.angle += deltaAngle;
          if (this.angle >= 360) { this.angle -= 360; }
          if (this.angle < 0) { this.angle += 360; }
          return this;
      }

      /**
      * turn object counter-clock-wise
      * @param {Number} deltaAngle - the angle to turn, in degrees
      * @return {DynamicObject} return this object
      */
      turnLeft(deltaAngle) {
          return this.turnRight(-deltaAngle);
      }

      /**
      * accelerate along the direction that the object is facing
      * @param {Number} acceleration - the acceleration
      * @return {DynamicObject} return this object
      */
      accelerate(acceleration) {
          let rad = this.angle * (Math.PI / 180);
          let dv = new TwoVector(Math.cos(rad), Math.sin(rad));
          dv.multiplyScalar(acceleration);
          this.velocity.add(dv);

          return this;
      }

      /**
       * Formatted textual description of the game object's current bending properties.
       * @return {String} description - a string description
       */
      bendingToString() {
          if (this.bendingIncrements)
              return `ΔPos=${this.bendingPositionDelta} ΔVel=${this.bendingVelocityDelta} ΔAngle=${this.bendingAngleDelta} increments=${this.bendingIncrements}`;
          return 'no bending';
      }

      /**
      * The maximum velocity allowed.  If returns null then ignored.
      * @memberof DynamicObject
      * @member {Number} maxSpeed
      */
      get maxSpeed() { return null; }

      /**
      * Copy the netscheme variables from another DynamicObject.
      * This is used by the synchronizer to create temporary objects, and must be implemented by all sub-classes as well.
      * @param {DynamicObject} other DynamicObject
      */
      syncTo(other) {
          super.syncTo(other);
          this.position.copy(other.position);
          this.velocity.copy(other.velocity);
          this.width = other.width;
          this.height = other.height;
          this.bendingAngle = other.bendingAngle;
          this.rotationSpeed = other.rotationSpeed;
          this.acceleration = other.acceleration;
          this.deceleration = other.deceleration;
      }

      bendToCurrent(original, percent, worldSettings, isLocal, increments) {

          let bending = { increments, percent };
          // if the object has defined a bending multiples for this object, use them
          let positionBending = Object.assign({}, bending, this.bending.position);
          let velocityBending = Object.assign({}, bending, this.bending.velocity);
          let angleBending = Object.assign({}, bending, this.bending.angle);

          if (isLocal) {
              Object.assign(positionBending, this.bending.positionLocal);
              Object.assign(velocityBending, this.bending.velocityLocal);
              Object.assign(angleBending, this.bending.angleLocal);
          }

          // get the incremental delta position & velocity
          this.incrementScale = percent / increments;
          this.bendingPositionDelta = original.position.getBendingDelta(this.position, positionBending);
          this.bendingVelocityDelta = original.velocity.getBendingDelta(this.velocity, velocityBending);
          this.bendingAngleDelta = MathUtils.interpolateDeltaWithWrapping(original.angle, this.angle, angleBending.percent, 0, 360) / increments;

          this.bendingTarget = (new this.constructor());
          this.bendingTarget.syncTo(this);

          // revert to original
          this.position.copy(original.position);
          this.velocity.copy(original.velocity);
          this.angle = original.angle;

          // keep parameters
          this.bendingIncrements = increments;
          this.bendingOptions = bending;
      }

      applyIncrementalBending(stepDesc) {
          if (this.bendingIncrements === 0)
              return;

          let timeFactor = 1;
          if (stepDesc && stepDesc.dt)
              timeFactor = stepDesc.dt / (1000 / 60);

          const posDelta = this.bendingPositionDelta.clone().multiplyScalar(timeFactor);
          const velDelta = this.bendingVelocityDelta.clone().multiplyScalar(timeFactor);
          this.position.add(posDelta);
          this.velocity.add(velDelta);
          this.angle += (this.bendingAngleDelta * timeFactor);

          this.bendingIncrements--;
      }

      getAABB() {
          // todo take rotation into account
          // registration point is in the middle
          return {
              min: [this.x - this.width / 2, this.y - this.height / 2],
              max: [this.x + this.width / 2, this.y + this.height / 2]
          };
      }

      /**
      * Determine if this object will collide with another object.
      * Only applicable on "bruteForce" physics engine.
      * @param {DynamicObject} other DynamicObject
      * @return {Boolean} true if the two objects collide
      */
      collidesWith(other) {
          return true;
      }

  }

  /**
   * The PhysicalObject2D is the base class for physical game objects in 2D Physics
   */
  class PhysicalObject2D extends GameObject {

      /**
      * The netScheme is a dictionary of attributes in this game
      * object.  The attributes listed in the netScheme are those exact
      * attributes which will be serialized and sent from the server
      * to each client on every server update.
      * The netScheme member is implemented as a getter.
      *
      * You may choose not to implement this method, in which
      * case your object only transmits the default attributes
      * which are already part of {@link PhysicalObject2D}.
      * But if you choose to add more attributes, make sure
      * the return value includes the netScheme of the super class.
      *
      * @memberof PhysicalObject2D
      * @member {Object} netScheme
      * @example
      *     static get netScheme() {
      *       return Object.assign({
      *           mojo: { type: BaseTypes.TYPES.UINT8 },
      *         }, super.netScheme);
      *     }
      */
      static get netScheme() {
          return Object.assign({
              mass: { type: BaseTypes.TYPES.FLOAT32 },
              position: { type: BaseTypes.TYPES.CLASSINSTANCE },
              angle: { type: BaseTypes.TYPES.FLOAT32 },
              velocity: { type: BaseTypes.TYPES.CLASSINSTANCE },
              angularVelocity: { type: BaseTypes.TYPES.FLOAT32 }
          }, super.netScheme);
      }

      /**
      * Creates an instance of a physical object.
      * Override to provide starting values for position, velocity, angle and angular velocity.
      * NOTE: all subclasses of this class must comply with this constructor signature.
      *       This is required because the engine will create temporary instances when
      *       syncs arrive on the clients.
      * @param {GameEngine} gameEngine - the gameEngine this object will be used in
      * @param {Object} options - options for the new object. See {@link GameObject}
      * @param {Object} props - properties to be set in the new object
      * @param {TwoVector} props.position - position vector
      * @param {TwoVector} props.velocity - velocity vector
      * @param {Number} props.angle - orientation angle
      * @param {Number} props.mass - the mass
      * @param {Number} props.angularVelocity - angular velocity
      */
      constructor(gameEngine, options, props) {
          super(gameEngine, options, props);
          this.bendingIncrements = 0;

          // set default position, velocity and quaternion
          this.position = new TwoVector(0, 0);
          this.velocity = new TwoVector(0, 0);
          this.angle = 0;
          this.angularVelocity = 0;
          this.mass = 0;

          // use values if provided
          props = props || {};
          if (props.position) this.position.copy(props.position);
          if (props.velocity) this.velocity.copy(props.velocity);
          if (props.angle) this.angle = props.angle;
          if (props.angularVelocity) this.angularVelocity = props.angularVelocity;
          if (props.mass) this.mass = props.mass;

          this.class = PhysicalObject2D;
      }

      /**
       * Called after the object is added to to the game world.
       * This is the right place to add renderer sub-objects, physics sub-objects
       * and any other resources that should be created
       */
      onAddToWorld() {}

      /**
       * Formatted textual description of the dynamic object.
       * The output of this method is used to describe each instance in the traces,
       * which significantly helps in debugging.
       *
       * @return {String} description - a string describing the PhysicalObject2D
       */
      toString() {
          let p = this.position.toString();
          let v = this.velocity.toString();
          let a = this.angle;
          let av = this.angularVelocity;
          return `phyObj2D[${this.id}] player${this.playerId} Pos=${p} Vel=${v} Ang=${a} AVel=${av}`;
      }

      /**
       * Each object class can define its own bending overrides.
       * return an object which can include attributes: position, velocity,
       * angle, and angularVelocity.  In each case, you can specify a min value, max
       * value, and a percent value.
       *
       * @return {Object} bending - an object with bending paramters
       */
      get bending() {
          return {
              // example:
              // position: { percent: 0.8, min: 0.0, max: 4.0 },
              // velocity: { percent: 0.4, min: 0.0 },
              // angularVelocity: { percent: 0.0 },
              // angleLocal: { percent: 0.0 }
          };
      }

      // display object's physical attributes as a string
      // for debugging purposes mostly
      bendingToString() {
          if (this.bendingIncrements)
              return `ΔPos=${this.bendingPositionDelta} ΔVel=${this.bendingVelocityDelta} ΔAngle=${this.bendingAngleDelta} increments=${this.bendingIncrements}`;
          return 'no bending';
      }

      // derive and save the bending increment parameters:
      // - bendingPositionDelta
      // - bendingVelocityDelta
      // - bendingAVDelta
      // - bendingAngleDelta
      // these can later be used to "bend" incrementally from the state described
      // by "original" to the state described by "self"
      bendToCurrent(original, percent, worldSettings, isLocal, increments) {

          let bending = { increments, percent };
          // if the object has defined a bending multiples for this object, use them
          let positionBending = Object.assign({}, bending, this.bending.position);
          let velocityBending = Object.assign({}, bending, this.bending.velocity);
          let angleBending = Object.assign({}, bending, this.bending.angle);
          let avBending = Object.assign({}, bending, this.bending.angularVelocity);

          // check for local object overrides to bendingTarget
          if (isLocal) {
              Object.assign(positionBending, this.bending.positionLocal);
              Object.assign(velocityBending, this.bending.velocityLocal);
              Object.assign(angleBending, this.bending.angleLocal);
              Object.assign(avBending, this.bending.angularVelocityLocal);
          }

          // get the incremental delta position & velocity
          this.incrementScale = percent / increments;
          this.bendingPositionDelta = original.position.getBendingDelta(this.position, positionBending);
          this.bendingVelocityDelta = original.velocity.getBendingDelta(this.velocity, velocityBending);

          // get the incremental angular-velocity
          this.bendingAVDelta = (this.angularVelocity - original.angularVelocity) * this.incrementScale * avBending.percent;

          // get the incremental angle correction
          this.bendingAngleDelta = MathUtils.interpolateDeltaWithWrapping(original.angle, this.angle, angleBending.percent, 0, 2 * Math.PI) / increments;

          this.bendingTarget = (new this.constructor());
          this.bendingTarget.syncTo(this);

          // revert to original
          this.position.copy(original.position);
          this.angle = original.angle;
          this.angularVelocity = original.angularVelocity;
          this.velocity.copy(original.velocity);

          this.bendingIncrements = increments;
          this.bendingOptions = bending;

          this.refreshToPhysics();
      }

      syncTo(other, options) {

          super.syncTo(other);

          this.position.copy(other.position);
          this.angle = other.angle;
          this.angularVelocity = other.angularVelocity;

          if (!options || !options.keepVelocity) {
              this.velocity.copy(other.velocity);
          }

          if (this.physicsObj) this.refreshToPhysics();
      }

      // update position, angle, angular velocity, and velocity from new physical state.
      refreshFromPhysics() {
          this.copyVector(this.physicsObj.position, this.position);
          this.copyVector(this.physicsObj.velocity, this.velocity);
          this.angle = this.physicsObj.angle;
          this.angularVelocity = this.physicsObj.angularVelocity;
      }

      // generic vector copy.  We need this because different
      // physics engines have different implementations.
      // TODO: Better implementation: the physics engine implementor
      // should define copyFromLanceVector and copyToLanceVector
      copyVector(source, target) {
          let sourceVec = source;
          if (typeof source[0] === 'number' && typeof source[1] === 'number')
              sourceVec = { x: source[0], y: source[1] };

          if (typeof target.copy === 'function') {
              target.copy(sourceVec);
          } else if (target instanceof Float32Array) {
              target[0] = sourceVec.x;
              target[1] = sourceVec.y;
          } else {
              target.x = sourceVec.x;
              target.y = sourceVec.y;
          }
      }

      // update position, angle, angular velocity, and velocity from new game state.
      refreshToPhysics() {
          this.copyVector(this.position, this.physicsObj.position);
          this.copyVector(this.velocity, this.physicsObj.velocity);
          this.physicsObj.angle = this.angle;
          this.physicsObj.angularVelocity = this.angularVelocity;
      }

      // apply one increment of bending
      applyIncrementalBending(stepDesc) {
          if (this.bendingIncrements === 0)
              return;

          let timeFactor = 1;
          if (stepDesc && stepDesc.dt)
              timeFactor = stepDesc.dt / (1000 / 60);

          const posDelta = this.bendingPositionDelta.clone().multiplyScalar(timeFactor);
          const velDelta = this.bendingVelocityDelta.clone().multiplyScalar(timeFactor);
          this.position.add(posDelta);
          this.velocity.add(velDelta);
          this.angularVelocity += (this.bendingAVDelta * timeFactor);
          this.angle += (this.bendingAngleDelta * timeFactor);

          this.bendingIncrements--;
      }

      // interpolate implementation
      interpolate(nextObj, percent) {

          // slerp to target position
          this.position.lerp(nextObj.position, percent);
          this.angle = MathUtils.interpolateDeltaWithWrapping(this.angle, nextObj.angle, percent, 0, 2 * Math.PI);
      }
  }

  /**
   * The PhysicalObject3D is the base class for physical game objects
   */
  class PhysicalObject3D extends GameObject {

      /**
      * The netScheme is a dictionary of attributes in this game
      * object.  The attributes listed in the netScheme are those exact
      * attributes which will be serialized and sent from the server
      * to each client on every server update.
      * The netScheme member is implemented as a getter.
      *
      * You may choose not to implement this method, in which
      * case your object only transmits the default attributes
      * which are already part of {@link PhysicalObject3D}.
      * But if you choose to add more attributes, make sure
      * the return value includes the netScheme of the super class.
      *
      * @memberof PhysicalObject3D
      * @member {Object} netScheme
      * @example
      *     static get netScheme() {
      *       return Object.assign({
      *           mojo: { type: BaseTypes.TYPES.UINT8 },
      *         }, super.netScheme);
      *     }
      */
      static get netScheme() {
          return Object.assign({
              position: { type: BaseTypes.TYPES.CLASSINSTANCE },
              quaternion: { type: BaseTypes.TYPES.CLASSINSTANCE },
              velocity: { type: BaseTypes.TYPES.CLASSINSTANCE },
              angularVelocity: { type: BaseTypes.TYPES.CLASSINSTANCE }
          }, super.netScheme);
      }

      /**
      * Creates an instance of a physical object.
      * Override to provide starting values for position, velocity, quaternion and angular velocity.
      * NOTE: all subclasses of this class must comply with this constructor signature.
      *       This is required because the engine will create temporary instances when
      *       syncs arrive on the clients.
      * @param {GameEngine} gameEngine - the gameEngine this object will be used in
      * @param {Object} options - options for the new object. See {@link GameObject}
      * @param {Object} props - properties to be set in the new object
      * @param {ThreeVector} props.position - position vector
      * @param {ThreeVector} props.velocity - velocity vector
      * @param {Quaternion} props.quaternion - orientation quaternion
      * @param {ThreeVector} props.angularVelocity - 3-vector representation of angular velocity
      */
      constructor(gameEngine, options, props) {
          super(gameEngine, options, props);
          this.bendingIncrements = 0;

          // set default position, velocity and quaternion
          this.position = new ThreeVector(0, 0, 0);
          this.velocity = new ThreeVector(0, 0, 0);
          this.quaternion = new Quaternion(1, 0, 0, 0);
          this.angularVelocity = new ThreeVector(0, 0, 0);

          // use values if provided
          props = props || {};
          if (props.position) this.position.copy(props.position);
          if (props.velocity) this.velocity.copy(props.velocity);
          if (props.quaternion) this.quaternion.copy(props.quaternion);
          if (props.angularVelocity) this.angularVelocity.copy(props.angularVelocity);

          this.class = PhysicalObject3D;
      }

      /**
       * Formatted textual description of the dynamic object.
       * The output of this method is used to describe each instance in the traces,
       * which significantly helps in debugging.
       *
       * @return {String} description - a string describing the PhysicalObject3D
       */
      toString() {
          let p = this.position.toString();
          let v = this.velocity.toString();
          let q = this.quaternion.toString();
          let a = this.angularVelocity.toString();
          return `phyObj[${this.id}] player${this.playerId} Pos${p} Vel${v} Dir${q} AVel${a}`;
      }

      // display object's physical attributes as a string
      // for debugging purposes mostly
      bendingToString() {
          if (this.bendingOptions)
              return `bend=${this.bendingOptions.percent} deltaPos=${this.bendingPositionDelta} deltaVel=${this.bendingVelocityDelta} deltaQuat=${this.bendingQuaternionDelta}`;
          return 'no bending';
      }

      // derive and save the bending increment parameters:
      // - bendingPositionDelta
      // - bendingAVDelta
      // - bendingQuaternionDelta
      // these can later be used to "bend" incrementally from the state described
      // by "original" to the state described by "self"
      bendToCurrent(original, percent, worldSettings, isLocal, increments) {

          let bending = { increments, percent };
          // if the object has defined a bending multiples for this object, use them
          let positionBending = Object.assign({}, bending, this.bending.position);
          let velocityBending = Object.assign({}, bending, this.bending.velocity);

          // check for local object overrides to bendingTarget
          if (isLocal) {
              Object.assign(positionBending, this.bending.positionLocal);
              Object.assign(velocityBending, this.bending.velocityLocal);
          }

          // get the incremental delta position & velocity
          this.incrementScale = percent / increments;
          this.bendingPositionDelta = original.position.getBendingDelta(this.position, positionBending);
          this.bendingVelocityDelta = original.velocity.getBendingDelta(this.velocity, velocityBending);
          this.bendingAVDelta = new ThreeVector(0, 0, 0);

          // get the incremental quaternion rotation
          this.bendingQuaternionDelta = (new Quaternion()).copy(original.quaternion).conjugate();
          this.bendingQuaternionDelta.multiply(this.quaternion);

          let axisAngle = this.bendingQuaternionDelta.toAxisAngle();
          axisAngle.angle *= this.incrementScale;
          this.bendingQuaternionDelta.setFromAxisAngle(axisAngle.axis, axisAngle.angle);

          this.bendingTarget = (new this.constructor());
          this.bendingTarget.syncTo(this);

          this.position.copy(original.position);
          this.quaternion.copy(original.quaternion);
          this.angularVelocity.copy(original.angularVelocity);

          this.bendingIncrements = increments;
          this.bendingOptions = bending;

          this.refreshToPhysics();
      }

      syncTo(other, options) {

          super.syncTo(other);

          this.position.copy(other.position);
          this.quaternion.copy(other.quaternion);
          this.angularVelocity.copy(other.angularVelocity);

          if (!options || !options.keepVelocity) {
              this.velocity.copy(other.velocity);
          }

          if (this.physicsObj)
              this.refreshToPhysics();
      }

      // update position, quaternion, and velocity from new physical state.
      refreshFromPhysics() {
          this.position.copy(this.physicsObj.position);
          this.quaternion.copy(this.physicsObj.quaternion);
          this.velocity.copy(this.physicsObj.velocity);
          this.angularVelocity.copy(this.physicsObj.angularVelocity);
      }

      // update position, quaternion, and velocity from new game state.
      refreshToPhysics() {
          if (!this.physicsObj) return
          this.physicsObj.position.copy(this.position);
          this.physicsObj.quaternion.copy(this.quaternion);
          this.physicsObj.velocity.copy(this.velocity);
          this.physicsObj.angularVelocity.copy(this.angularVelocity);
      }

      // apply one increment of bending
      applyIncrementalBending(stepDesc) {
          if (this.bendingIncrements === 0)
              return;

          if (stepDesc && stepDesc.dt) {
              const timeFactor = stepDesc.dt / (1000 / 60);
              // TODO: use clone() below.  it's cleaner
              const posDelta = (new ThreeVector()).copy(this.bendingPositionDelta).multiplyScalar(timeFactor);
              const avDelta = (new ThreeVector()).copy(this.bendingAVDelta).multiplyScalar(timeFactor);
              this.position.add(posDelta);
              this.angularVelocity.add(avDelta);

              // one approach to orientation bending is slerp:
              this.quaternion.slerp(this.bendingTarget.quaternion, this.incrementScale * timeFactor * 0.8);
          } else {
              this.position.add(this.bendingPositionDelta);
              this.angularVelocity.add(this.bendingAVDelta);
              this.quaternion.slerp(this.bendingTarget.quaternion, this.incrementScale);
          }

          // alternative: fixed delta-quaternion correction
          // TODO: adjust quaternion bending to dt timefactor precision
          // this.quaternion.multiply(this.bendingQuaternionDelta);
          this.bendingIncrements--;
      }

      // interpolate implementation
      interpolate(nextObj, percent) {

          // slerp to target position
          this.position.lerp(nextObj.position, percent);
          this.quaternion.slerp(nextObj.quaternion, percent);
      }
  }

  var lib = {
      Trace,
      Utils
  };

  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api private
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = [
      'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
  ];

  var parseuri = function parseuri(str) {
      var src = str,
          b = str.indexOf('['),
          e = str.indexOf(']');

      if (b != -1 && e != -1) {
          str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
      }

      var m = re.exec(str || ''),
          uri = {},
          i = 14;

      while (i--) {
          uri[parts[i]] = m[i] || '';
      }

      if (b != -1 && e != -1) {
          uri.source = src;
          uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
          uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
          uri.ipv6uri = true;
      }

      return uri;
  };

  /**
   * Helpers.
   */

  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;

  /**
   * Parse or format the given `val`.
   *
   * Options:
   *
   *  - `long` verbose formatting [false]
   *
   * @param {String|Number} val
   * @param {Object} [options]
   * @throws {Error} throw an error if val is not a non-empty string or a number
   * @return {String|Number}
   * @api public
   */

  var ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
      return parse(val);
    } else if (type === 'number' && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      'val is not a non-empty string or a valid number. val=' +
        JSON.stringify(val)
    );
  };

  /**
   * Parse the given `str` and return milliseconds.
   *
   * @param {String} str
   * @return {Number}
   * @api private
   */

  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
      case 'years':
      case 'year':
      case 'yrs':
      case 'yr':
      case 'y':
        return n * y;
      case 'days':
      case 'day':
      case 'd':
        return n * d;
      case 'hours':
      case 'hour':
      case 'hrs':
      case 'hr':
      case 'h':
        return n * h;
      case 'minutes':
      case 'minute':
      case 'mins':
      case 'min':
      case 'm':
        return n * m;
      case 'seconds':
      case 'second':
      case 'secs':
      case 'sec':
      case 's':
        return n * s;
      case 'milliseconds':
      case 'millisecond':
      case 'msecs':
      case 'msec':
      case 'ms':
        return n;
      default:
        return undefined;
    }
  }

  /**
   * Short format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtShort(ms) {
    if (ms >= d) {
      return Math.round(ms / d) + 'd';
    }
    if (ms >= h) {
      return Math.round(ms / h) + 'h';
    }
    if (ms >= m) {
      return Math.round(ms / m) + 'm';
    }
    if (ms >= s) {
      return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
  }

  /**
   * Long format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtLong(ms) {
    return plural(ms, d, 'day') ||
      plural(ms, h, 'hour') ||
      plural(ms, m, 'minute') ||
      plural(ms, s, 'second') ||
      ms + ' ms';
  }

  /**
   * Pluralization helper.
   */

  function plural(ms, n, name) {
    if (ms < n) {
      return;
    }
    if (ms < n * 1.5) {
      return Math.floor(ms / n) + ' ' + name;
    }
    return Math.ceil(ms / n) + ' ' + name + 's';
  }

  var debug = createCommonjsModule(function (module, exports) {
  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
  exports.coerce = coerce;
  exports.disable = disable;
  exports.enable = enable;
  exports.enabled = enabled;
  exports.humanize = ms;

  /**
   * Active `debug` instances.
   */
  exports.instances = [];

  /**
   * The currently active debug mode names, and names to skip.
   */

  exports.names = [];
  exports.skips = [];

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */

  exports.formatters = {};

  /**
   * Select a color.
   * @param {String} namespace
   * @return {Number}
   * @api private
   */

  function selectColor(namespace) {
    var hash = 0, i;

    for (i in namespace) {
      hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return exports.colors[Math.abs(hash) % exports.colors.length];
  }

  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */

  function createDebug(namespace) {

    var prevTime;

    function debug() {
      // disabled?
      if (!debug.enabled) return;

      var self = debug;

      // set `diff` timestamp
      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      // turn the `arguments` into a proper Array
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

      args[0] = exports.coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %O
        args.unshift('%O');
      }

      // apply any `formatters` transformations
      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        index++;
        var formatter = exports.formatters[format];
        if ('function' === typeof formatter) {
          var val = args[index];
          match = formatter.call(self, val);

          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // apply env-specific formatting (colors, etc.)
      exports.formatArgs.call(self, args);

      var logFn = debug.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = exports.enabled(namespace);
    debug.useColors = exports.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;

    // env-specific initialization logic for debug instances
    if ('function' === typeof exports.init) {
      exports.init(debug);
    }

    exports.instances.push(debug);

    return debug;
  }

  function destroy () {
    var index = exports.instances.indexOf(this);
    if (index !== -1) {
      exports.instances.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */

  function enable(namespaces) {
    exports.save(namespaces);

    exports.names = [];
    exports.skips = [];

    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) continue; // ignore empty strings
      namespaces = split[i].replace(/\*/g, '.*?');
      if (namespaces[0] === '-') {
        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        exports.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < exports.instances.length; i++) {
      var instance = exports.instances[i];
      instance.enabled = exports.enabled(instance.namespace);
    }
  }

  /**
   * Disable debug output.
   *
   * @api public
   */

  function disable() {
    exports.enable('');
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }
    var i, len;
    for (i = 0, len = exports.skips.length; i < len; i++) {
      if (exports.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = exports.names.length; i < len; i++) {
      if (exports.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */

  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }
  });
  var debug_1 = debug.coerce;
  var debug_2 = debug.disable;
  var debug_3 = debug.enable;
  var debug_4 = debug.enabled;
  var debug_5 = debug.humanize;
  var debug_6 = debug.instances;
  var debug_7 = debug.names;
  var debug_8 = debug.skips;
  var debug_9 = debug.formatters;

  var browser = createCommonjsModule(function (module, exports) {
  /**
   * This is the web browser implementation of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = debug;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = 'undefined' != typeof chrome
                 && 'undefined' != typeof chrome.storage
                    ? chrome.storage.local
                    : localstorage();

  /**
   * Colors.
   */

  exports.colors = [
    '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
    '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
    '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
    '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
    '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
    '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
    '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
    '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
    '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
    '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
    '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
  ];

  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
      return true;
    }

    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }

    // is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
      // is firebug? http://stackoverflow.com/a/398120/376773
      (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
      // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
      // double check webkit in userAgent just in case we are in a worker
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
  }

  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  exports.formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return '[UnexpectedJSONParseError]: ' + err.message;
    }
  };


  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  function formatArgs(args) {
    var useColors = this.useColors;

    args[0] = (useColors ? '%c' : '')
      + this.namespace
      + (useColors ? ' %c' : ' ')
      + args[0]
      + (useColors ? '%c ' : ' ')
      + '+' + exports.humanize(this.diff);

    if (!useColors) return;

    var c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');

    // the final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, function(match) {
      if ('%%' === match) return;
      index++;
      if ('%c' === match) {
        // we only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });

    args.splice(lastC, 0, c);
  }

  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */

  function log() {
    // this hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'
    return 'object' === typeof console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */

  function save(namespaces) {
    try {
      if (null == namespaces) {
        exports.storage.removeItem('debug');
      } else {
        exports.storage.debug = namespaces;
      }
    } catch(e) {}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */

  function load() {
    var r;
    try {
      r = exports.storage.debug;
    } catch(e) {}

    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
      r = process.env.DEBUG;
    }

    return r;
  }

  /**
   * Enable namespaces listed in `localStorage.debug` initially.
   */

  exports.enable(load());

  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */

  function localstorage() {
    try {
      return window.localStorage;
    } catch (e) {}
  }
  });
  var browser_1 = browser.log;
  var browser_2 = browser.formatArgs;
  var browser_3 = browser.save;
  var browser_4 = browser.load;
  var browser_5 = browser.useColors;
  var browser_6 = browser.storage;
  var browser_7 = browser.colors;

  /**
   * Module dependencies.
   */


  var debug$1 = browser('socket.io-client:url');

  /**
   * Module exports.
   */

  var url_1 = url;

  /**
   * URL parser.
   *
   * @param {String} url
   * @param {Object} An object meant to mimic window.location.
   *                 Defaults to window.location.
   * @api public
   */

  function url (uri, loc) {
    var obj = uri;

    // default to window.location
    loc = loc || (typeof location !== 'undefined' && location);
    if (null == uri) uri = loc.protocol + '//' + loc.host;

    // relative path support
    if ('string' === typeof uri) {
      if ('/' === uri.charAt(0)) {
        if ('/' === uri.charAt(1)) {
          uri = loc.protocol + uri;
        } else {
          uri = loc.host + uri;
        }
      }

      if (!/^(https?|wss?):\/\//.test(uri)) {
        debug$1('protocol-less url %s', uri);
        if ('undefined' !== typeof loc) {
          uri = loc.protocol + '//' + uri;
        } else {
          uri = 'https://' + uri;
        }
      }

      // parse
      debug$1('parse %s', uri);
      obj = parseuri(uri);
    }

    // make sure we treat `localhost:80` and `localhost` equally
    if (!obj.port) {
      if (/^(http|ws)$/.test(obj.protocol)) {
        obj.port = '80';
      } else if (/^(http|ws)s$/.test(obj.protocol)) {
        obj.port = '443';
      }
    }

    obj.path = obj.path || '/';

    var ipv6 = obj.host.indexOf(':') !== -1;
    var host = ipv6 ? '[' + obj.host + ']' : obj.host;

    // define unique id
    obj.id = obj.protocol + '://' + host + ':' + obj.port;
    // define href
    obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

    return obj;
  }

  /**
   * Helpers.
   */

  var s$1 = 1000;
  var m$1 = s$1 * 60;
  var h$1 = m$1 * 60;
  var d$1 = h$1 * 24;
  var y$1 = d$1 * 365.25;

  /**
   * Parse or format the given `val`.
   *
   * Options:
   *
   *  - `long` verbose formatting [false]
   *
   * @param {String|Number} val
   * @param {Object} [options]
   * @throws {Error} throw an error if val is not a non-empty string or a number
   * @return {String|Number}
   * @api public
   */

  var ms$1 = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
      return parse$1(val);
    } else if (type === 'number' && isNaN(val) === false) {
      return options.long ? fmtLong$1(val) : fmtShort$1(val);
    }
    throw new Error(
      'val is not a non-empty string or a valid number. val=' +
        JSON.stringify(val)
    );
  };

  /**
   * Parse the given `str` and return milliseconds.
   *
   * @param {String} str
   * @return {Number}
   * @api private
   */

  function parse$1(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
      case 'years':
      case 'year':
      case 'yrs':
      case 'yr':
      case 'y':
        return n * y$1;
      case 'days':
      case 'day':
      case 'd':
        return n * d$1;
      case 'hours':
      case 'hour':
      case 'hrs':
      case 'hr':
      case 'h':
        return n * h$1;
      case 'minutes':
      case 'minute':
      case 'mins':
      case 'min':
      case 'm':
        return n * m$1;
      case 'seconds':
      case 'second':
      case 'secs':
      case 'sec':
      case 's':
        return n * s$1;
      case 'milliseconds':
      case 'millisecond':
      case 'msecs':
      case 'msec':
      case 'ms':
        return n;
      default:
        return undefined;
    }
  }

  /**
   * Short format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtShort$1(ms) {
    if (ms >= d$1) {
      return Math.round(ms / d$1) + 'd';
    }
    if (ms >= h$1) {
      return Math.round(ms / h$1) + 'h';
    }
    if (ms >= m$1) {
      return Math.round(ms / m$1) + 'm';
    }
    if (ms >= s$1) {
      return Math.round(ms / s$1) + 's';
    }
    return ms + 'ms';
  }

  /**
   * Long format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtLong$1(ms) {
    return plural$1(ms, d$1, 'day') ||
      plural$1(ms, h$1, 'hour') ||
      plural$1(ms, m$1, 'minute') ||
      plural$1(ms, s$1, 'second') ||
      ms + ' ms';
  }

  /**
   * Pluralization helper.
   */

  function plural$1(ms, n, name) {
    if (ms < n) {
      return;
    }
    if (ms < n * 1.5) {
      return Math.floor(ms / n) + ' ' + name;
    }
    return Math.ceil(ms / n) + ' ' + name + 's';
  }

  var debug$2 = createCommonjsModule(function (module, exports) {
  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
  exports.coerce = coerce;
  exports.disable = disable;
  exports.enable = enable;
  exports.enabled = enabled;
  exports.humanize = ms$1;

  /**
   * Active `debug` instances.
   */
  exports.instances = [];

  /**
   * The currently active debug mode names, and names to skip.
   */

  exports.names = [];
  exports.skips = [];

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */

  exports.formatters = {};

  /**
   * Select a color.
   * @param {String} namespace
   * @return {Number}
   * @api private
   */

  function selectColor(namespace) {
    var hash = 0, i;

    for (i in namespace) {
      hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return exports.colors[Math.abs(hash) % exports.colors.length];
  }

  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */

  function createDebug(namespace) {

    var prevTime;

    function debug() {
      // disabled?
      if (!debug.enabled) return;

      var self = debug;

      // set `diff` timestamp
      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      // turn the `arguments` into a proper Array
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

      args[0] = exports.coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %O
        args.unshift('%O');
      }

      // apply any `formatters` transformations
      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        index++;
        var formatter = exports.formatters[format];
        if ('function' === typeof formatter) {
          var val = args[index];
          match = formatter.call(self, val);

          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // apply env-specific formatting (colors, etc.)
      exports.formatArgs.call(self, args);

      var logFn = debug.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = exports.enabled(namespace);
    debug.useColors = exports.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;

    // env-specific initialization logic for debug instances
    if ('function' === typeof exports.init) {
      exports.init(debug);
    }

    exports.instances.push(debug);

    return debug;
  }

  function destroy () {
    var index = exports.instances.indexOf(this);
    if (index !== -1) {
      exports.instances.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */

  function enable(namespaces) {
    exports.save(namespaces);

    exports.names = [];
    exports.skips = [];

    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) continue; // ignore empty strings
      namespaces = split[i].replace(/\*/g, '.*?');
      if (namespaces[0] === '-') {
        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        exports.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < exports.instances.length; i++) {
      var instance = exports.instances[i];
      instance.enabled = exports.enabled(instance.namespace);
    }
  }

  /**
   * Disable debug output.
   *
   * @api public
   */

  function disable() {
    exports.enable('');
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }
    var i, len;
    for (i = 0, len = exports.skips.length; i < len; i++) {
      if (exports.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = exports.names.length; i < len; i++) {
      if (exports.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */

  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }
  });
  var debug_1$1 = debug$2.coerce;
  var debug_2$1 = debug$2.disable;
  var debug_3$1 = debug$2.enable;
  var debug_4$1 = debug$2.enabled;
  var debug_5$1 = debug$2.humanize;
  var debug_6$1 = debug$2.instances;
  var debug_7$1 = debug$2.names;
  var debug_8$1 = debug$2.skips;
  var debug_9$1 = debug$2.formatters;

  var browser$1 = createCommonjsModule(function (module, exports) {
  /**
   * This is the web browser implementation of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = debug$2;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = 'undefined' != typeof chrome
                 && 'undefined' != typeof chrome.storage
                    ? chrome.storage.local
                    : localstorage();

  /**
   * Colors.
   */

  exports.colors = [
    '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
    '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
    '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
    '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
    '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
    '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
    '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
    '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
    '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
    '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
    '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
  ];

  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
      return true;
    }

    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }

    // is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
      // is firebug? http://stackoverflow.com/a/398120/376773
      (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
      // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
      // double check webkit in userAgent just in case we are in a worker
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
  }

  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  exports.formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return '[UnexpectedJSONParseError]: ' + err.message;
    }
  };


  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  function formatArgs(args) {
    var useColors = this.useColors;

    args[0] = (useColors ? '%c' : '')
      + this.namespace
      + (useColors ? ' %c' : ' ')
      + args[0]
      + (useColors ? '%c ' : ' ')
      + '+' + exports.humanize(this.diff);

    if (!useColors) return;

    var c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');

    // the final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, function(match) {
      if ('%%' === match) return;
      index++;
      if ('%c' === match) {
        // we only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });

    args.splice(lastC, 0, c);
  }

  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */

  function log() {
    // this hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'
    return 'object' === typeof console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */

  function save(namespaces) {
    try {
      if (null == namespaces) {
        exports.storage.removeItem('debug');
      } else {
        exports.storage.debug = namespaces;
      }
    } catch(e) {}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */

  function load() {
    var r;
    try {
      r = exports.storage.debug;
    } catch(e) {}

    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
      r = process.env.DEBUG;
    }

    return r;
  }

  /**
   * Enable namespaces listed in `localStorage.debug` initially.
   */

  exports.enable(load());

  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */

  function localstorage() {
    try {
      return window.localStorage;
    } catch (e) {}
  }
  });
  var browser_1$1 = browser$1.log;
  var browser_2$1 = browser$1.formatArgs;
  var browser_3$1 = browser$1.save;
  var browser_4$1 = browser$1.load;
  var browser_5$1 = browser$1.useColors;
  var browser_6$1 = browser$1.storage;
  var browser_7$1 = browser$1.colors;

  var componentEmitter = createCommonjsModule(function (module) {
  /**
   * Expose `Emitter`.
   */

  {
    module.exports = Emitter;
  }

  /**
   * Initialize a new `Emitter`.
   *
   * @api public
   */

  function Emitter(obj) {
    if (obj) return mixin(obj);
  }
  /**
   * Mixin the emitter properties.
   *
   * @param {Object} obj
   * @return {Object}
   * @api private
   */

  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }
    return obj;
  }

  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */

  Emitter.prototype.on =
  Emitter.prototype.addEventListener = function(event, fn){
    this._callbacks = this._callbacks || {};
    (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
      .push(fn);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */

  Emitter.prototype.once = function(event, fn){
    function on() {
      this.off(event, on);
      fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */

  Emitter.prototype.off =
  Emitter.prototype.removeListener =
  Emitter.prototype.removeAllListeners =
  Emitter.prototype.removeEventListener = function(event, fn){
    this._callbacks = this._callbacks || {};

    // all
    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    }

    // specific event
    var callbacks = this._callbacks['$' + event];
    if (!callbacks) return this;

    // remove all handlers
    if (1 == arguments.length) {
      delete this._callbacks['$' + event];
      return this;
    }

    // remove specific handler
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Emit `event` with the given args.
   *
   * @param {String} event
   * @param {Mixed} ...
   * @return {Emitter}
   */

  Emitter.prototype.emit = function(event){
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1)
      , callbacks = this._callbacks['$' + event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  };

  /**
   * Return array of callbacks for `event`.
   *
   * @param {String} event
   * @return {Array}
   * @api public
   */

  Emitter.prototype.listeners = function(event){
    this._callbacks = this._callbacks || {};
    return this._callbacks['$' + event] || [];
  };

  /**
   * Check if this emitter has `event` handlers.
   *
   * @param {String} event
   * @return {Boolean}
   * @api public
   */

  Emitter.prototype.hasListeners = function(event){
    return !! this.listeners(event).length;
  };
  });

  var toString = {}.toString;

  var isarray = Array.isArray || function (arr) {
    return toString.call(arr) == '[object Array]';
  };

  var isBuffer = isBuf;

  var withNativeBuffer = typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function';
  var withNativeArrayBuffer = typeof ArrayBuffer === 'function';

  var isView = function (obj) {
    return typeof ArrayBuffer.isView === 'function' ? ArrayBuffer.isView(obj) : (obj.buffer instanceof ArrayBuffer);
  };

  /**
   * Returns true if obj is a buffer or an arraybuffer.
   *
   * @api private
   */

  function isBuf(obj) {
    return (withNativeBuffer && Buffer.isBuffer(obj)) ||
            (withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)));
  }

  /*global Blob,File*/

  /**
   * Module requirements
   */



  var toString$1 = Object.prototype.toString;
  var withNativeBlob = typeof Blob === 'function' || (typeof Blob !== 'undefined' && toString$1.call(Blob) === '[object BlobConstructor]');
  var withNativeFile = typeof File === 'function' || (typeof File !== 'undefined' && toString$1.call(File) === '[object FileConstructor]');

  /**
   * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
   * Anything with blobs or files should be fed through removeBlobs before coming
   * here.
   *
   * @param {Object} packet - socket.io event packet
   * @return {Object} with deconstructed packet and list of buffers
   * @api public
   */

  var deconstructPacket = function(packet) {
    var buffers = [];
    var packetData = packet.data;
    var pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length; // number of binary 'attachments'
    return {packet: pack, buffers: buffers};
  };

  function _deconstructPacket(data, buffers) {
    if (!data) return data;

    if (isBuffer(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isarray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i], buffers);
      }
      return newData;
    } else if (typeof data === 'object' && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key], buffers);
      }
      return newData;
    }
    return data;
  }

  /**
   * Reconstructs a binary packet from its placeholder packet and buffers
   *
   * @param {Object} packet - event packet with placeholders
   * @param {Array} buffers - binary buffers to put in placeholder positions
   * @return {Object} reconstructed packet
   * @api public
   */

  var reconstructPacket = function(packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    packet.attachments = undefined; // no longer useful
    return packet;
  };

  function _reconstructPacket(data, buffers) {
    if (!data) return data;

    if (data && data._placeholder) {
      return buffers[data.num]; // appropriate buffer (should be natural order anyway)
    } else if (isarray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i], buffers);
      }
    } else if (typeof data === 'object') {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key], buffers);
      }
    }

    return data;
  }

  /**
   * Asynchronously removes Blobs or Files from data via
   * FileReader's readAsArrayBuffer method. Used before encoding
   * data as msgpack. Calls callback with the blobless data.
   *
   * @param {Object} data
   * @param {Function} callback
   * @api private
   */

  var removeBlobs = function(data, callback) {
    function _removeBlobs(obj, curKey, containingObject) {
      if (!obj) return obj;

      // convert any blob
      if ((withNativeBlob && obj instanceof Blob) ||
          (withNativeFile && obj instanceof File)) {
        pendingBlobs++;

        // async filereader
        var fileReader = new FileReader();
        fileReader.onload = function() { // this.result == arraybuffer
          if (containingObject) {
            containingObject[curKey] = this.result;
          }
          else {
            bloblessData = this.result;
          }

          // if nothing pending its callback time
          if(! --pendingBlobs) {
            callback(bloblessData);
          }
        };

        fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
      } else if (isarray(obj)) { // handle array
        for (var i = 0; i < obj.length; i++) {
          _removeBlobs(obj[i], i, obj);
        }
      } else if (typeof obj === 'object' && !isBuffer(obj)) { // and object
        for (var key in obj) {
          _removeBlobs(obj[key], key, obj);
        }
      }
    }

    var pendingBlobs = 0;
    var bloblessData = data;
    _removeBlobs(bloblessData);
    if (!pendingBlobs) {
      callback(bloblessData);
    }
  };

  var binary = {
  	deconstructPacket: deconstructPacket,
  	reconstructPacket: reconstructPacket,
  	removeBlobs: removeBlobs
  };

  var socket_ioParser = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */

  var debug = browser$1('socket.io-parser');





  /**
   * Protocol version.
   *
   * @api public
   */

  exports.protocol = 4;

  /**
   * Packet types.
   *
   * @api public
   */

  exports.types = [
    'CONNECT',
    'DISCONNECT',
    'EVENT',
    'ACK',
    'ERROR',
    'BINARY_EVENT',
    'BINARY_ACK'
  ];

  /**
   * Packet type `connect`.
   *
   * @api public
   */

  exports.CONNECT = 0;

  /**
   * Packet type `disconnect`.
   *
   * @api public
   */

  exports.DISCONNECT = 1;

  /**
   * Packet type `event`.
   *
   * @api public
   */

  exports.EVENT = 2;

  /**
   * Packet type `ack`.
   *
   * @api public
   */

  exports.ACK = 3;

  /**
   * Packet type `error`.
   *
   * @api public
   */

  exports.ERROR = 4;

  /**
   * Packet type 'binary event'
   *
   * @api public
   */

  exports.BINARY_EVENT = 5;

  /**
   * Packet type `binary ack`. For acks with binary arguments.
   *
   * @api public
   */

  exports.BINARY_ACK = 6;

  /**
   * Encoder constructor.
   *
   * @api public
   */

  exports.Encoder = Encoder;

  /**
   * Decoder constructor.
   *
   * @api public
   */

  exports.Decoder = Decoder;

  /**
   * A socket.io Encoder instance
   *
   * @api public
   */

  function Encoder() {}

  var ERROR_PACKET = exports.ERROR + '"encode error"';

  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   * @param {Function} callback - function to handle encodings (likely engine.write)
   * @return Calls callback with Array of encodings
   * @api public
   */

  Encoder.prototype.encode = function(obj, callback){
    debug('encoding packet %j', obj);

    if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
      encodeAsBinary(obj, callback);
    } else {
      var encoding = encodeAsString(obj);
      callback([encoding]);
    }
  };

  /**
   * Encode packet as string.
   *
   * @param {Object} packet
   * @return {String} encoded
   * @api private
   */

  function encodeAsString(obj) {

    // first is type
    var str = '' + obj.type;

    // attachments if we have them
    if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
      str += obj.attachments + '-';
    }

    // if we have a namespace other than `/`
    // we append it followed by a comma `,`
    if (obj.nsp && '/' !== obj.nsp) {
      str += obj.nsp + ',';
    }

    // immediately followed by the id
    if (null != obj.id) {
      str += obj.id;
    }

    // json data
    if (null != obj.data) {
      var payload = tryStringify(obj.data);
      if (payload !== false) {
        str += payload;
      } else {
        return ERROR_PACKET;
      }
    }

    debug('encoded %j as %s', obj, str);
    return str;
  }

  function tryStringify(str) {
    try {
      return JSON.stringify(str);
    } catch(e){
      return false;
    }
  }

  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   *
   * @param {Object} packet
   * @return {Buffer} encoded
   * @api private
   */

  function encodeAsBinary(obj, callback) {

    function writeEncoding(bloblessData) {
      var deconstruction = binary.deconstructPacket(bloblessData);
      var pack = encodeAsString(deconstruction.packet);
      var buffers = deconstruction.buffers;

      buffers.unshift(pack); // add packet info to beginning of data list
      callback(buffers); // write all the buffers
    }

    binary.removeBlobs(obj, writeEncoding);
  }

  /**
   * A socket.io Decoder instance
   *
   * @return {Object} decoder
   * @api public
   */

  function Decoder() {
    this.reconstructor = null;
  }

  /**
   * Mix in `Emitter` with Decoder.
   */

  componentEmitter(Decoder.prototype);

  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   * @return {Object} packet
   * @api public
   */

  Decoder.prototype.add = function(obj) {
    var packet;
    if (typeof obj === 'string') {
      packet = decodeString(obj);
      if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) { // binary packet's json
        this.reconstructor = new BinaryReconstructor(packet);

        // no attachments, labeled binary but no binary data to follow
        if (this.reconstructor.reconPack.attachments === 0) {
          this.emit('decoded', packet);
        }
      } else { // non-binary full packet
        this.emit('decoded', packet);
      }
    } else if (isBuffer(obj) || obj.base64) { // raw binary data
      if (!this.reconstructor) {
        throw new Error('got binary data when not reconstructing a packet');
      } else {
        packet = this.reconstructor.takeBinaryData(obj);
        if (packet) { // received final buffer
          this.reconstructor = null;
          this.emit('decoded', packet);
        }
      }
    } else {
      throw new Error('Unknown type: ' + obj);
    }
  };

  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   * @api private
   */

  function decodeString(str) {
    var i = 0;
    // look up type
    var p = {
      type: Number(str.charAt(0))
    };

    if (null == exports.types[p.type]) {
      return error('unknown packet type ' + p.type);
    }

    // look up attachments if type binary
    if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
      var buf = '';
      while (str.charAt(++i) !== '-') {
        buf += str.charAt(i);
        if (i == str.length) break;
      }
      if (buf != Number(buf) || str.charAt(i) !== '-') {
        throw new Error('Illegal attachments');
      }
      p.attachments = Number(buf);
    }

    // look up namespace (if any)
    if ('/' === str.charAt(i + 1)) {
      p.nsp = '';
      while (++i) {
        var c = str.charAt(i);
        if (',' === c) break;
        p.nsp += c;
        if (i === str.length) break;
      }
    } else {
      p.nsp = '/';
    }

    // look up id
    var next = str.charAt(i + 1);
    if ('' !== next && Number(next) == next) {
      p.id = '';
      while (++i) {
        var c = str.charAt(i);
        if (null == c || Number(c) != c) {
          --i;
          break;
        }
        p.id += str.charAt(i);
        if (i === str.length) break;
      }
      p.id = Number(p.id);
    }

    // look up json data
    if (str.charAt(++i)) {
      var payload = tryParse(str.substr(i));
      var isPayloadValid = payload !== false && (p.type === exports.ERROR || isarray(payload));
      if (isPayloadValid) {
        p.data = payload;
      } else {
        return error('invalid payload');
      }
    }

    debug('decoded %s as %j', str, p);
    return p;
  }

  function tryParse(str) {
    try {
      return JSON.parse(str);
    } catch(e){
      return false;
    }
  }

  /**
   * Deallocates a parser's resources
   *
   * @api public
   */

  Decoder.prototype.destroy = function() {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
    }
  };

  /**
   * A manager of a binary event's 'buffer sequence'. Should
   * be constructed whenever a packet of type BINARY_EVENT is
   * decoded.
   *
   * @param {Object} packet
   * @return {BinaryReconstructor} initialized reconstructor
   * @api private
   */

  function BinaryReconstructor(packet) {
    this.reconPack = packet;
    this.buffers = [];
  }

  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   * @api private
   */

  BinaryReconstructor.prototype.takeBinaryData = function(binData) {
    this.buffers.push(binData);
    if (this.buffers.length === this.reconPack.attachments) { // done with buffer list
      var packet = binary.reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }
    return null;
  };

  /**
   * Cleans up binary packet reconstruction variables.
   *
   * @api private
   */

  BinaryReconstructor.prototype.finishedReconstruction = function() {
    this.reconPack = null;
    this.buffers = [];
  };

  function error(msg) {
    return {
      type: exports.ERROR,
      data: 'parser error: ' + msg
    };
  }
  });
  var socket_ioParser_1 = socket_ioParser.protocol;
  var socket_ioParser_2 = socket_ioParser.types;
  var socket_ioParser_3 = socket_ioParser.CONNECT;
  var socket_ioParser_4 = socket_ioParser.DISCONNECT;
  var socket_ioParser_5 = socket_ioParser.EVENT;
  var socket_ioParser_6 = socket_ioParser.ACK;
  var socket_ioParser_7 = socket_ioParser.ERROR;
  var socket_ioParser_8 = socket_ioParser.BINARY_EVENT;
  var socket_ioParser_9 = socket_ioParser.BINARY_ACK;
  var socket_ioParser_10 = socket_ioParser.Encoder;
  var socket_ioParser_11 = socket_ioParser.Decoder;

  var hasCors = createCommonjsModule(function (module) {
  /**
   * Module exports.
   *
   * Logic borrowed from Modernizr:
   *
   *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
   */

  try {
    module.exports = typeof XMLHttpRequest !== 'undefined' &&
      'withCredentials' in new XMLHttpRequest();
  } catch (err) {
    // if XMLHttp support is disabled in IE then it will throw
    // when trying to create
    module.exports = false;
  }
  });

  // browser shim for xmlhttprequest module



  var xmlhttprequest = function (opts) {
    var xdomain = opts.xdomain;

    // scheme must be same when usign XDomainRequest
    // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
    var xscheme = opts.xscheme;

    // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
    // https://github.com/Automattic/engine.io-client/pull/217
    var enablesXDR = opts.enablesXDR;

    // XMLHttpRequest can be disabled on IE
    try {
      if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCors)) {
        return new XMLHttpRequest();
      }
    } catch (e) { }

    // Use XDomainRequest for IE8 if enablesXDR is true
    // because loading bar keeps flashing when using jsonp-polling
    // https://github.com/yujiosaka/socke.io-ie8-loading-example
    try {
      if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
        return new XDomainRequest();
      }
    } catch (e) { }

    if (!xdomain) {
      try {
        return new self[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
      } catch (e) { }
    }
  };

  /**
   * Gets the keys for an object.
   *
   * @return {Array} keys
   * @api private
   */

  var keys$2 = Object.keys || function keys (obj){
    var arr = [];
    var has = Object.prototype.hasOwnProperty;

    for (var i in obj) {
      if (has.call(obj, i)) {
        arr.push(i);
      }
    }
    return arr;
  };

  var toString$2 = {}.toString;

  var isarray$1 = Array.isArray || function (arr) {
    return toString$2.call(arr) == '[object Array]';
  };

  /* global Blob File */

  /*
   * Module requirements.
   */



  var toString$3 = Object.prototype.toString;
  var withNativeBlob$1 = typeof Blob === 'function' ||
                          typeof Blob !== 'undefined' && toString$3.call(Blob) === '[object BlobConstructor]';
  var withNativeFile$1 = typeof File === 'function' ||
                          typeof File !== 'undefined' && toString$3.call(File) === '[object FileConstructor]';

  /**
   * Module exports.
   */

  var hasBinary2 = hasBinary;

  /**
   * Checks for binary data.
   *
   * Supports Buffer, ArrayBuffer, Blob and File.
   *
   * @param {Object} anything
   * @api public
   */

  function hasBinary (obj) {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (isarray$1(obj)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (hasBinary(obj[i])) {
          return true;
        }
      }
      return false;
    }

    if ((typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj)) ||
      (typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer) ||
      (withNativeBlob$1 && obj instanceof Blob) ||
      (withNativeFile$1 && obj instanceof File)
    ) {
      return true;
    }

    // see: https://github.com/Automattic/has-binary/pull/4
    if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
      return hasBinary(obj.toJSON(), true);
    }

    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
        return true;
      }
    }

    return false;
  }

  /**
   * An abstraction for slicing an arraybuffer even when
   * ArrayBuffer.prototype.slice is not supported
   *
   * @api public
   */

  var arraybuffer_slice = function(arraybuffer, start, end) {
    var bytes = arraybuffer.byteLength;
    start = start || 0;
    end = end || bytes;

    if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

    if (start < 0) { start += bytes; }
    if (end < 0) { end += bytes; }
    if (end > bytes) { end = bytes; }

    if (start >= bytes || start >= end || bytes === 0) {
      return new ArrayBuffer(0);
    }

    var abv = new Uint8Array(arraybuffer);
    var result = new Uint8Array(end - start);
    for (var i = start, ii = 0; i < end; i++, ii++) {
      result[ii] = abv[i];
    }
    return result.buffer;
  };

  var after_1 = after;

  function after(count, callback, err_cb) {
      var bail = false;
      err_cb = err_cb || noop$1;
      proxy.count = count;

      return (count === 0) ? callback() : proxy

      function proxy(err, result) {
          if (proxy.count <= 0) {
              throw new Error('after called too many times')
          }
          --proxy.count;

          // after first error, rest are passed to err_cb
          if (err) {
              bail = true;
              callback(err);
              // future error callbacks will go to error handler
              callback = err_cb;
          } else if (proxy.count === 0 && !bail) {
              callback(null, result);
          }
      }
  }

  function noop$1() {}

  /*! https://mths.be/utf8js v2.1.2 by @mathias */

  var stringFromCharCode = String.fromCharCode;

  // Taken from https://mths.be/punycode
  function ucs2decode(string) {
  	var output = [];
  	var counter = 0;
  	var length = string.length;
  	var value;
  	var extra;
  	while (counter < length) {
  		value = string.charCodeAt(counter++);
  		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
  			// high surrogate, and there is a next character
  			extra = string.charCodeAt(counter++);
  			if ((extra & 0xFC00) == 0xDC00) { // low surrogate
  				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
  			} else {
  				// unmatched surrogate; only append this code unit, in case the next
  				// code unit is the high surrogate of a surrogate pair
  				output.push(value);
  				counter--;
  			}
  		} else {
  			output.push(value);
  		}
  	}
  	return output;
  }

  // Taken from https://mths.be/punycode
  function ucs2encode(array) {
  	var length = array.length;
  	var index = -1;
  	var value;
  	var output = '';
  	while (++index < length) {
  		value = array[index];
  		if (value > 0xFFFF) {
  			value -= 0x10000;
  			output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
  			value = 0xDC00 | value & 0x3FF;
  		}
  		output += stringFromCharCode(value);
  	}
  	return output;
  }

  function checkScalarValue(codePoint, strict) {
  	if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
  		if (strict) {
  			throw Error(
  				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
  				' is not a scalar value'
  			);
  		}
  		return false;
  	}
  	return true;
  }
  /*--------------------------------------------------------------------------*/

  function createByte(codePoint, shift) {
  	return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
  }

  function encodeCodePoint(codePoint, strict) {
  	if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
  		return stringFromCharCode(codePoint);
  	}
  	var symbol = '';
  	if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
  		symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
  	}
  	else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
  		if (!checkScalarValue(codePoint, strict)) {
  			codePoint = 0xFFFD;
  		}
  		symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
  		symbol += createByte(codePoint, 6);
  	}
  	else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
  		symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
  		symbol += createByte(codePoint, 12);
  		symbol += createByte(codePoint, 6);
  	}
  	symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
  	return symbol;
  }

  function utf8encode(string, opts) {
  	opts = opts || {};
  	var strict = false !== opts.strict;

  	var codePoints = ucs2decode(string);
  	var length = codePoints.length;
  	var index = -1;
  	var codePoint;
  	var byteString = '';
  	while (++index < length) {
  		codePoint = codePoints[index];
  		byteString += encodeCodePoint(codePoint, strict);
  	}
  	return byteString;
  }

  /*--------------------------------------------------------------------------*/

  function readContinuationByte() {
  	if (byteIndex >= byteCount) {
  		throw Error('Invalid byte index');
  	}

  	var continuationByte = byteArray[byteIndex] & 0xFF;
  	byteIndex++;

  	if ((continuationByte & 0xC0) == 0x80) {
  		return continuationByte & 0x3F;
  	}

  	// If we end up here, it’s not a continuation byte
  	throw Error('Invalid continuation byte');
  }

  function decodeSymbol(strict) {
  	var byte1;
  	var byte2;
  	var byte3;
  	var byte4;
  	var codePoint;

  	if (byteIndex > byteCount) {
  		throw Error('Invalid byte index');
  	}

  	if (byteIndex == byteCount) {
  		return false;
  	}

  	// Read first byte
  	byte1 = byteArray[byteIndex] & 0xFF;
  	byteIndex++;

  	// 1-byte sequence (no continuation bytes)
  	if ((byte1 & 0x80) == 0) {
  		return byte1;
  	}

  	// 2-byte sequence
  	if ((byte1 & 0xE0) == 0xC0) {
  		byte2 = readContinuationByte();
  		codePoint = ((byte1 & 0x1F) << 6) | byte2;
  		if (codePoint >= 0x80) {
  			return codePoint;
  		} else {
  			throw Error('Invalid continuation byte');
  		}
  	}

  	// 3-byte sequence (may include unpaired surrogates)
  	if ((byte1 & 0xF0) == 0xE0) {
  		byte2 = readContinuationByte();
  		byte3 = readContinuationByte();
  		codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
  		if (codePoint >= 0x0800) {
  			return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
  		} else {
  			throw Error('Invalid continuation byte');
  		}
  	}

  	// 4-byte sequence
  	if ((byte1 & 0xF8) == 0xF0) {
  		byte2 = readContinuationByte();
  		byte3 = readContinuationByte();
  		byte4 = readContinuationByte();
  		codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
  			(byte3 << 0x06) | byte4;
  		if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
  			return codePoint;
  		}
  	}

  	throw Error('Invalid UTF-8 detected');
  }

  var byteArray;
  var byteCount;
  var byteIndex;
  function utf8decode(byteString, opts) {
  	opts = opts || {};
  	var strict = false !== opts.strict;

  	byteArray = ucs2decode(byteString);
  	byteCount = byteArray.length;
  	byteIndex = 0;
  	var codePoints = [];
  	var tmp;
  	while ((tmp = decodeSymbol(strict)) !== false) {
  		codePoints.push(tmp);
  	}
  	return ucs2encode(codePoints);
  }

  var utf8 = {
  	version: '2.1.2',
  	encode: utf8encode,
  	decode: utf8decode
  };

  var base64Arraybuffer = createCommonjsModule(function (module, exports) {
  /*
   * base64-arraybuffer
   * https://github.com/niklasvh/base64-arraybuffer
   *
   * Copyright (c) 2012 Niklas von Hertzen
   * Licensed under the MIT license.
   */
  (function(){

    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // Use a lookup table to find the index.
    var lookup = new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }

    exports.encode = function(arraybuffer) {
      var bytes = new Uint8Array(arraybuffer),
      i, len = bytes.length, base64 = "";

      for (i = 0; i < len; i+=3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
      }

      if ((len % 3) === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
      } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
      }

      return base64;
    };

    exports.decode =  function(base64) {
      var bufferLength = base64.length * 0.75,
      len = base64.length, i, p = 0,
      encoded1, encoded2, encoded3, encoded4;

      if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
          bufferLength--;
        }
      }

      var arraybuffer = new ArrayBuffer(bufferLength),
      bytes = new Uint8Array(arraybuffer);

      for (i = 0; i < len; i+=4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i+1)];
        encoded3 = lookup[base64.charCodeAt(i+2)];
        encoded4 = lookup[base64.charCodeAt(i+3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
      }

      return arraybuffer;
    };
  })();
  });
  var base64Arraybuffer_1 = base64Arraybuffer.encode;
  var base64Arraybuffer_2 = base64Arraybuffer.decode;

  /**
   * Create a blob builder even when vendor prefixes exist
   */

  var BlobBuilder = typeof BlobBuilder !== 'undefined' ? BlobBuilder :
    typeof WebKitBlobBuilder !== 'undefined' ? WebKitBlobBuilder :
    typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder :
    typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : 
    false;

  /**
   * Check if Blob constructor is supported
   */

  var blobSupported = (function() {
    try {
      var a = new Blob(['hi']);
      return a.size === 2;
    } catch(e) {
      return false;
    }
  })();

  /**
   * Check if Blob constructor supports ArrayBufferViews
   * Fails in Safari 6, so we need to map to ArrayBuffers there.
   */

  var blobSupportsArrayBufferView = blobSupported && (function() {
    try {
      var b = new Blob([new Uint8Array([1,2])]);
      return b.size === 2;
    } catch(e) {
      return false;
    }
  })();

  /**
   * Check if BlobBuilder is supported
   */

  var blobBuilderSupported = BlobBuilder
    && BlobBuilder.prototype.append
    && BlobBuilder.prototype.getBlob;

  /**
   * Helper function that maps ArrayBufferViews to ArrayBuffers
   * Used by BlobBuilder constructor and old browsers that didn't
   * support it in the Blob constructor.
   */

  function mapArrayBufferViews(ary) {
    return ary.map(function(chunk) {
      if (chunk.buffer instanceof ArrayBuffer) {
        var buf = chunk.buffer;

        // if this is a subarray, make a copy so we only
        // include the subarray region from the underlying buffer
        if (chunk.byteLength !== buf.byteLength) {
          var copy = new Uint8Array(chunk.byteLength);
          copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
          buf = copy.buffer;
        }

        return buf;
      }

      return chunk;
    });
  }

  function BlobBuilderConstructor(ary, options) {
    options = options || {};

    var bb = new BlobBuilder();
    mapArrayBufferViews(ary).forEach(function(part) {
      bb.append(part);
    });

    return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
  }
  function BlobConstructor(ary, options) {
    return new Blob(mapArrayBufferViews(ary), options || {});
  }
  if (typeof Blob !== 'undefined') {
    BlobBuilderConstructor.prototype = Blob.prototype;
    BlobConstructor.prototype = Blob.prototype;
  }

  var blob = (function() {
    if (blobSupported) {
      return blobSupportsArrayBufferView ? Blob : BlobConstructor;
    } else if (blobBuilderSupported) {
      return BlobBuilderConstructor;
    } else {
      return undefined;
    }
  })();

  var browser$2 = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */







  var base64encoder;
  if (typeof ArrayBuffer !== 'undefined') {
    base64encoder = base64Arraybuffer;
  }

  /**
   * Check if we are running an android browser. That requires us to use
   * ArrayBuffer with polling transports...
   *
   * http://ghinda.net/jpeg-blob-ajax-android/
   */

  var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  /**
   * Check if we are running in PhantomJS.
   * Uploading a Blob with PhantomJS does not work correctly, as reported here:
   * https://github.com/ariya/phantomjs/issues/11395
   * @type boolean
   */
  var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

  /**
   * When true, avoids using Blobs to encode payloads.
   * @type boolean
   */
  var dontSendBlobs = isAndroid || isPhantomJS;

  /**
   * Current protocol version.
   */

  exports.protocol = 3;

  /**
   * Packet types.
   */

  var packets = exports.packets = {
      open:     0    // non-ws
    , close:    1    // non-ws
    , ping:     2
    , pong:     3
    , message:  4
    , upgrade:  5
    , noop:     6
  };

  var packetslist = keys$2(packets);

  /**
   * Premade error packet.
   */

  var err = { type: 'error', data: 'parser error' };

  /**
   * Create a blob api even for blob builder when vendor prefixes exist
   */



  /**
   * Encodes a packet.
   *
   *     <packet type id> [ <data> ]
   *
   * Example:
   *
   *     5hello world
   *     3
   *     4
   *
   * Binary is encoded in an identical principle
   *
   * @api private
   */

  exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
    if (typeof supportsBinary === 'function') {
      callback = supportsBinary;
      supportsBinary = false;
    }

    if (typeof utf8encode === 'function') {
      callback = utf8encode;
      utf8encode = null;
    }

    var data = (packet.data === undefined)
      ? undefined
      : packet.data.buffer || packet.data;

    if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
      return encodeArrayBuffer(packet, supportsBinary, callback);
    } else if (typeof blob !== 'undefined' && data instanceof blob) {
      return encodeBlob(packet, supportsBinary, callback);
    }

    // might be an object with { base64: true, data: dataAsBase64String }
    if (data && data.base64) {
      return encodeBase64Object(packet, callback);
    }

    // Sending data as a utf-8 string
    var encoded = packets[packet.type];

    // data fragment is optional
    if (undefined !== packet.data) {
      encoded += utf8encode ? utf8.encode(String(packet.data), { strict: false }) : String(packet.data);
    }

    return callback('' + encoded);

  };

  function encodeBase64Object(packet, callback) {
    // packet data is an object { base64: true, data: dataAsBase64String }
    var message = 'b' + exports.packets[packet.type] + packet.data.data;
    return callback(message);
  }

  /**
   * Encode packet helpers for binary types
   */

  function encodeArrayBuffer(packet, supportsBinary, callback) {
    if (!supportsBinary) {
      return exports.encodeBase64Packet(packet, callback);
    }

    var data = packet.data;
    var contentArray = new Uint8Array(data);
    var resultBuffer = new Uint8Array(1 + data.byteLength);

    resultBuffer[0] = packets[packet.type];
    for (var i = 0; i < contentArray.length; i++) {
      resultBuffer[i+1] = contentArray[i];
    }

    return callback(resultBuffer.buffer);
  }

  function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
    if (!supportsBinary) {
      return exports.encodeBase64Packet(packet, callback);
    }

    var fr = new FileReader();
    fr.onload = function() {
      exports.encodePacket({ type: packet.type, data: fr.result }, supportsBinary, true, callback);
    };
    return fr.readAsArrayBuffer(packet.data);
  }

  function encodeBlob(packet, supportsBinary, callback) {
    if (!supportsBinary) {
      return exports.encodeBase64Packet(packet, callback);
    }

    if (dontSendBlobs) {
      return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
    }

    var length = new Uint8Array(1);
    length[0] = packets[packet.type];
    var blob$1 = new blob([length.buffer, packet.data]);

    return callback(blob$1);
  }

  /**
   * Encodes a packet with binary data in a base64 string
   *
   * @param {Object} packet, has `type` and `data`
   * @return {String} base64 encoded message
   */

  exports.encodeBase64Packet = function(packet, callback) {
    var message = 'b' + exports.packets[packet.type];
    if (typeof blob !== 'undefined' && packet.data instanceof blob) {
      var fr = new FileReader();
      fr.onload = function() {
        var b64 = fr.result.split(',')[1];
        callback(message + b64);
      };
      return fr.readAsDataURL(packet.data);
    }

    var b64data;
    try {
      b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
    } catch (e) {
      // iPhone Safari doesn't let you apply with typed arrays
      var typed = new Uint8Array(packet.data);
      var basic = new Array(typed.length);
      for (var i = 0; i < typed.length; i++) {
        basic[i] = typed[i];
      }
      b64data = String.fromCharCode.apply(null, basic);
    }
    message += btoa(b64data);
    return callback(message);
  };

  /**
   * Decodes a packet. Changes format to Blob if requested.
   *
   * @return {Object} with `type` and `data` (if any)
   * @api private
   */

  exports.decodePacket = function (data, binaryType, utf8decode) {
    if (data === undefined) {
      return err;
    }
    // String data
    if (typeof data === 'string') {
      if (data.charAt(0) === 'b') {
        return exports.decodeBase64Packet(data.substr(1), binaryType);
      }

      if (utf8decode) {
        data = tryDecode(data);
        if (data === false) {
          return err;
        }
      }
      var type = data.charAt(0);

      if (Number(type) != type || !packetslist[type]) {
        return err;
      }

      if (data.length > 1) {
        return { type: packetslist[type], data: data.substring(1) };
      } else {
        return { type: packetslist[type] };
      }
    }

    var asArray = new Uint8Array(data);
    var type = asArray[0];
    var rest = arraybuffer_slice(data, 1);
    if (blob && binaryType === 'blob') {
      rest = new blob([rest]);
    }
    return { type: packetslist[type], data: rest };
  };

  function tryDecode(data) {
    try {
      data = utf8.decode(data, { strict: false });
    } catch (e) {
      return false;
    }
    return data;
  }

  /**
   * Decodes a packet encoded in a base64 string
   *
   * @param {String} base64 encoded message
   * @return {Object} with `type` and `data` (if any)
   */

  exports.decodeBase64Packet = function(msg, binaryType) {
    var type = packetslist[msg.charAt(0)];
    if (!base64encoder) {
      return { type: type, data: { base64: true, data: msg.substr(1) } };
    }

    var data = base64encoder.decode(msg.substr(1));

    if (binaryType === 'blob' && blob) {
      data = new blob([data]);
    }

    return { type: type, data: data };
  };

  /**
   * Encodes multiple messages (payload).
   *
   *     <length>:data
   *
   * Example:
   *
   *     11:hello world2:hi
   *
   * If any contents are binary, they will be encoded as base64 strings. Base64
   * encoded strings are marked with a b before the length specifier
   *
   * @param {Array} packets
   * @api private
   */

  exports.encodePayload = function (packets, supportsBinary, callback) {
    if (typeof supportsBinary === 'function') {
      callback = supportsBinary;
      supportsBinary = null;
    }

    var isBinary = hasBinary2(packets);

    if (supportsBinary && isBinary) {
      if (blob && !dontSendBlobs) {
        return exports.encodePayloadAsBlob(packets, callback);
      }

      return exports.encodePayloadAsArrayBuffer(packets, callback);
    }

    if (!packets.length) {
      return callback('0:');
    }

    function setLengthHeader(message) {
      return message.length + ':' + message;
    }

    function encodeOne(packet, doneCallback) {
      exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function(message) {
        doneCallback(null, setLengthHeader(message));
      });
    }

    map(packets, encodeOne, function(err, results) {
      return callback(results.join(''));
    });
  };

  /**
   * Async array map using after
   */

  function map(ary, each, done) {
    var result = new Array(ary.length);
    var next = after_1(ary.length, done);

    var eachWithIndex = function(i, el, cb) {
      each(el, function(error, msg) {
        result[i] = msg;
        cb(error, result);
      });
    };

    for (var i = 0; i < ary.length; i++) {
      eachWithIndex(i, ary[i], next);
    }
  }

  /*
   * Decodes data when a payload is maybe expected. Possible binary contents are
   * decoded from their base64 representation
   *
   * @param {String} data, callback method
   * @api public
   */

  exports.decodePayload = function (data, binaryType, callback) {
    if (typeof data !== 'string') {
      return exports.decodePayloadAsBinary(data, binaryType, callback);
    }

    if (typeof binaryType === 'function') {
      callback = binaryType;
      binaryType = null;
    }

    var packet;
    if (data === '') {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }

    var length = '', n, msg;

    for (var i = 0, l = data.length; i < l; i++) {
      var chr = data.charAt(i);

      if (chr !== ':') {
        length += chr;
        continue;
      }

      if (length === '' || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, false);

        if (err.type === packet.type && err.data === packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }

    if (length !== '') {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }

  };

  /**
   * Encodes multiple messages (payload) as binary.
   *
   * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
   * 255><data>
   *
   * Example:
   * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
   *
   * @param {Array} packets
   * @return {ArrayBuffer} encoded payload
   * @api private
   */

  exports.encodePayloadAsArrayBuffer = function(packets, callback) {
    if (!packets.length) {
      return callback(new ArrayBuffer(0));
    }

    function encodeOne(packet, doneCallback) {
      exports.encodePacket(packet, true, true, function(data) {
        return doneCallback(null, data);
      });
    }

    map(packets, encodeOne, function(err, encodedPackets) {
      var totalLength = encodedPackets.reduce(function(acc, p) {
        var len;
        if (typeof p === 'string'){
          len = p.length;
        } else {
          len = p.byteLength;
        }
        return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
      }, 0);

      var resultArray = new Uint8Array(totalLength);

      var bufferIndex = 0;
      encodedPackets.forEach(function(p) {
        var isString = typeof p === 'string';
        var ab = p;
        if (isString) {
          var view = new Uint8Array(p.length);
          for (var i = 0; i < p.length; i++) {
            view[i] = p.charCodeAt(i);
          }
          ab = view.buffer;
        }

        if (isString) { // not true binary
          resultArray[bufferIndex++] = 0;
        } else { // true binary
          resultArray[bufferIndex++] = 1;
        }

        var lenStr = ab.byteLength.toString();
        for (var i = 0; i < lenStr.length; i++) {
          resultArray[bufferIndex++] = parseInt(lenStr[i]);
        }
        resultArray[bufferIndex++] = 255;

        var view = new Uint8Array(ab);
        for (var i = 0; i < view.length; i++) {
          resultArray[bufferIndex++] = view[i];
        }
      });

      return callback(resultArray.buffer);
    });
  };

  /**
   * Encode as Blob
   */

  exports.encodePayloadAsBlob = function(packets, callback) {
    function encodeOne(packet, doneCallback) {
      exports.encodePacket(packet, true, true, function(encoded) {
        var binaryIdentifier = new Uint8Array(1);
        binaryIdentifier[0] = 1;
        if (typeof encoded === 'string') {
          var view = new Uint8Array(encoded.length);
          for (var i = 0; i < encoded.length; i++) {
            view[i] = encoded.charCodeAt(i);
          }
          encoded = view.buffer;
          binaryIdentifier[0] = 0;
        }

        var len = (encoded instanceof ArrayBuffer)
          ? encoded.byteLength
          : encoded.size;

        var lenStr = len.toString();
        var lengthAry = new Uint8Array(lenStr.length + 1);
        for (var i = 0; i < lenStr.length; i++) {
          lengthAry[i] = parseInt(lenStr[i]);
        }
        lengthAry[lenStr.length] = 255;

        if (blob) {
          var blob$1 = new blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
          doneCallback(null, blob$1);
        }
      });
    }

    map(packets, encodeOne, function(err, results) {
      return callback(new blob(results));
    });
  };

  /*
   * Decodes data when a payload is maybe expected. Strings are decoded by
   * interpreting each byte as a key code for entries marked to start with 0. See
   * description of encodePayloadAsBinary
   *
   * @param {ArrayBuffer} data, callback method
   * @api public
   */

  exports.decodePayloadAsBinary = function (data, binaryType, callback) {
    if (typeof binaryType === 'function') {
      callback = binaryType;
      binaryType = null;
    }

    var bufferTail = data;
    var buffers = [];

    while (bufferTail.byteLength > 0) {
      var tailArray = new Uint8Array(bufferTail);
      var isString = tailArray[0] === 0;
      var msgLength = '';

      for (var i = 1; ; i++) {
        if (tailArray[i] === 255) break;

        // 310 = char length of Number.MAX_VALUE
        if (msgLength.length > 310) {
          return callback(err, 0, 1);
        }

        msgLength += tailArray[i];
      }

      bufferTail = arraybuffer_slice(bufferTail, 2 + msgLength.length);
      msgLength = parseInt(msgLength);

      var msg = arraybuffer_slice(bufferTail, 0, msgLength);
      if (isString) {
        try {
          msg = String.fromCharCode.apply(null, new Uint8Array(msg));
        } catch (e) {
          // iPhone Safari doesn't let you apply to typed arrays
          var typed = new Uint8Array(msg);
          msg = '';
          for (var i = 0; i < typed.length; i++) {
            msg += String.fromCharCode(typed[i]);
          }
        }
      }

      buffers.push(msg);
      bufferTail = arraybuffer_slice(bufferTail, msgLength);
    }

    var total = buffers.length;
    buffers.forEach(function(buffer, i) {
      callback(exports.decodePacket(buffer, binaryType, true), i, total);
    });
  };
  });
  var browser_1$2 = browser$2.protocol;
  var browser_2$2 = browser$2.packets;
  var browser_3$2 = browser$2.encodePacket;
  var browser_4$2 = browser$2.encodeBase64Packet;
  var browser_5$2 = browser$2.decodePacket;
  var browser_6$2 = browser$2.decodeBase64Packet;
  var browser_7$2 = browser$2.encodePayload;
  var browser_8 = browser$2.decodePayload;
  var browser_9 = browser$2.encodePayloadAsArrayBuffer;
  var browser_10 = browser$2.encodePayloadAsBlob;
  var browser_11 = browser$2.decodePayloadAsBinary;

  /**
   * Module dependencies.
   */




  /**
   * Module exports.
   */

  var transport = Transport;

  /**
   * Transport abstract constructor.
   *
   * @param {Object} options.
   * @api private
   */

  function Transport (opts) {
    this.path = opts.path;
    this.hostname = opts.hostname;
    this.port = opts.port;
    this.secure = opts.secure;
    this.query = opts.query;
    this.timestampParam = opts.timestampParam;
    this.timestampRequests = opts.timestampRequests;
    this.readyState = '';
    this.agent = opts.agent || false;
    this.socket = opts.socket;
    this.enablesXDR = opts.enablesXDR;

    // SSL options for Node.js client
    this.pfx = opts.pfx;
    this.key = opts.key;
    this.passphrase = opts.passphrase;
    this.cert = opts.cert;
    this.ca = opts.ca;
    this.ciphers = opts.ciphers;
    this.rejectUnauthorized = opts.rejectUnauthorized;
    this.forceNode = opts.forceNode;

    // results of ReactNative environment detection
    this.isReactNative = opts.isReactNative;

    // other options for Node.js client
    this.extraHeaders = opts.extraHeaders;
    this.localAddress = opts.localAddress;
  }

  /**
   * Mix in `Emitter`.
   */

  componentEmitter(Transport.prototype);

  /**
   * Emits an error.
   *
   * @param {String} str
   * @return {Transport} for chaining
   * @api public
   */

  Transport.prototype.onError = function (msg, desc) {
    var err = new Error(msg);
    err.type = 'TransportError';
    err.description = desc;
    this.emit('error', err);
    return this;
  };

  /**
   * Opens the transport.
   *
   * @api public
   */

  Transport.prototype.open = function () {
    if ('closed' === this.readyState || '' === this.readyState) {
      this.readyState = 'opening';
      this.doOpen();
    }

    return this;
  };

  /**
   * Closes the transport.
   *
   * @api private
   */

  Transport.prototype.close = function () {
    if ('opening' === this.readyState || 'open' === this.readyState) {
      this.doClose();
      this.onClose();
    }

    return this;
  };

  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   * @api private
   */

  Transport.prototype.send = function (packets) {
    if ('open' === this.readyState) {
      this.write(packets);
    } else {
      throw new Error('Transport not open');
    }
  };

  /**
   * Called upon open
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.readyState = 'open';
    this.writable = true;
    this.emit('open');
  };

  /**
   * Called with data.
   *
   * @param {String} data
   * @api private
   */

  Transport.prototype.onData = function (data) {
    var packet = browser$2.decodePacket(data, this.socket.binaryType);
    this.onPacket(packet);
  };

  /**
   * Called with a decoded packet.
   */

  Transport.prototype.onPacket = function (packet) {
    this.emit('packet', packet);
  };

  /**
   * Called upon close.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    this.readyState = 'closed';
    this.emit('close');
  };

  /**
   * Compiles a querystring
   * Returns string representation of the object
   *
   * @param {Object}
   * @api private
   */

  var encode = function (obj) {
    var str = '';

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (str.length) str += '&';
        str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
      }
    }

    return str;
  };

  /**
   * Parses a simple querystring into an object
   *
   * @param {String} qs
   * @api private
   */

  var decode = function(qs){
    var qry = {};
    var pairs = qs.split('&');
    for (var i = 0, l = pairs.length; i < l; i++) {
      var pair = pairs[i].split('=');
      qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
  };

  var parseqs = {
  	encode: encode,
  	decode: decode
  };

  var componentInherit = function(a, b){
    var fn = function(){};
    fn.prototype = b.prototype;
    a.prototype = new fn;
    a.prototype.constructor = a;
  };

  var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
    , length = 64
    , map = {}
    , seed = 0
    , i$1 = 0
    , prev;

  /**
   * Return a string representing the specified number.
   *
   * @param {Number} num The number to convert.
   * @returns {String} The string representation of the number.
   * @api public
   */
  function encode$1(num) {
    var encoded = '';

    do {
      encoded = alphabet[num % length] + encoded;
      num = Math.floor(num / length);
    } while (num > 0);

    return encoded;
  }

  /**
   * Return the integer value specified by the given string.
   *
   * @param {String} str The string to convert.
   * @returns {Number} The integer value represented by the string.
   * @api public
   */
  function decode$1(str) {
    var decoded = 0;

    for (i$1 = 0; i$1 < str.length; i$1++) {
      decoded = decoded * length + map[str.charAt(i$1)];
    }

    return decoded;
  }

  /**
   * Yeast: A tiny growing id generator.
   *
   * @returns {String} A unique id.
   * @api public
   */
  function yeast() {
    var now = encode$1(+new Date());

    if (now !== prev) return seed = 0, prev = now;
    return now +'.'+ encode$1(seed++);
  }

  //
  // Map each character to its index.
  //
  for (; i$1 < length; i$1++) map[alphabet[i$1]] = i$1;

  //
  // Expose the `yeast`, `encode` and `decode` functions.
  //
  yeast.encode = encode$1;
  yeast.decode = decode$1;
  var yeast_1 = yeast;

  /**
   * Helpers.
   */

  var s$2 = 1000;
  var m$2 = s$2 * 60;
  var h$2 = m$2 * 60;
  var d$2 = h$2 * 24;
  var y$2 = d$2 * 365.25;

  /**
   * Parse or format the given `val`.
   *
   * Options:
   *
   *  - `long` verbose formatting [false]
   *
   * @param {String|Number} val
   * @param {Object} [options]
   * @throws {Error} throw an error if val is not a non-empty string or a number
   * @return {String|Number}
   * @api public
   */

  var ms$2 = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
      return parse$2(val);
    } else if (type === 'number' && isNaN(val) === false) {
      return options.long ? fmtLong$2(val) : fmtShort$2(val);
    }
    throw new Error(
      'val is not a non-empty string or a valid number. val=' +
        JSON.stringify(val)
    );
  };

  /**
   * Parse the given `str` and return milliseconds.
   *
   * @param {String} str
   * @return {Number}
   * @api private
   */

  function parse$2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
      case 'years':
      case 'year':
      case 'yrs':
      case 'yr':
      case 'y':
        return n * y$2;
      case 'days':
      case 'day':
      case 'd':
        return n * d$2;
      case 'hours':
      case 'hour':
      case 'hrs':
      case 'hr':
      case 'h':
        return n * h$2;
      case 'minutes':
      case 'minute':
      case 'mins':
      case 'min':
      case 'm':
        return n * m$2;
      case 'seconds':
      case 'second':
      case 'secs':
      case 'sec':
      case 's':
        return n * s$2;
      case 'milliseconds':
      case 'millisecond':
      case 'msecs':
      case 'msec':
      case 'ms':
        return n;
      default:
        return undefined;
    }
  }

  /**
   * Short format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtShort$2(ms) {
    if (ms >= d$2) {
      return Math.round(ms / d$2) + 'd';
    }
    if (ms >= h$2) {
      return Math.round(ms / h$2) + 'h';
    }
    if (ms >= m$2) {
      return Math.round(ms / m$2) + 'm';
    }
    if (ms >= s$2) {
      return Math.round(ms / s$2) + 's';
    }
    return ms + 'ms';
  }

  /**
   * Long format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtLong$2(ms) {
    return plural$2(ms, d$2, 'day') ||
      plural$2(ms, h$2, 'hour') ||
      plural$2(ms, m$2, 'minute') ||
      plural$2(ms, s$2, 'second') ||
      ms + ' ms';
  }

  /**
   * Pluralization helper.
   */

  function plural$2(ms, n, name) {
    if (ms < n) {
      return;
    }
    if (ms < n * 1.5) {
      return Math.floor(ms / n) + ' ' + name;
    }
    return Math.ceil(ms / n) + ' ' + name + 's';
  }

  var debug$3 = createCommonjsModule(function (module, exports) {
  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
  exports.coerce = coerce;
  exports.disable = disable;
  exports.enable = enable;
  exports.enabled = enabled;
  exports.humanize = ms$2;

  /**
   * Active `debug` instances.
   */
  exports.instances = [];

  /**
   * The currently active debug mode names, and names to skip.
   */

  exports.names = [];
  exports.skips = [];

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */

  exports.formatters = {};

  /**
   * Select a color.
   * @param {String} namespace
   * @return {Number}
   * @api private
   */

  function selectColor(namespace) {
    var hash = 0, i;

    for (i in namespace) {
      hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return exports.colors[Math.abs(hash) % exports.colors.length];
  }

  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */

  function createDebug(namespace) {

    var prevTime;

    function debug() {
      // disabled?
      if (!debug.enabled) return;

      var self = debug;

      // set `diff` timestamp
      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      // turn the `arguments` into a proper Array
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

      args[0] = exports.coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %O
        args.unshift('%O');
      }

      // apply any `formatters` transformations
      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        index++;
        var formatter = exports.formatters[format];
        if ('function' === typeof formatter) {
          var val = args[index];
          match = formatter.call(self, val);

          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // apply env-specific formatting (colors, etc.)
      exports.formatArgs.call(self, args);

      var logFn = debug.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = exports.enabled(namespace);
    debug.useColors = exports.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;

    // env-specific initialization logic for debug instances
    if ('function' === typeof exports.init) {
      exports.init(debug);
    }

    exports.instances.push(debug);

    return debug;
  }

  function destroy () {
    var index = exports.instances.indexOf(this);
    if (index !== -1) {
      exports.instances.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */

  function enable(namespaces) {
    exports.save(namespaces);

    exports.names = [];
    exports.skips = [];

    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) continue; // ignore empty strings
      namespaces = split[i].replace(/\*/g, '.*?');
      if (namespaces[0] === '-') {
        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        exports.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < exports.instances.length; i++) {
      var instance = exports.instances[i];
      instance.enabled = exports.enabled(instance.namespace);
    }
  }

  /**
   * Disable debug output.
   *
   * @api public
   */

  function disable() {
    exports.enable('');
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }
    var i, len;
    for (i = 0, len = exports.skips.length; i < len; i++) {
      if (exports.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = exports.names.length; i < len; i++) {
      if (exports.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */

  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }
  });
  var debug_1$2 = debug$3.coerce;
  var debug_2$2 = debug$3.disable;
  var debug_3$2 = debug$3.enable;
  var debug_4$2 = debug$3.enabled;
  var debug_5$2 = debug$3.humanize;
  var debug_6$2 = debug$3.instances;
  var debug_7$2 = debug$3.names;
  var debug_8$2 = debug$3.skips;
  var debug_9$2 = debug$3.formatters;

  var browser$3 = createCommonjsModule(function (module, exports) {
  /**
   * This is the web browser implementation of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = debug$3;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = 'undefined' != typeof chrome
                 && 'undefined' != typeof chrome.storage
                    ? chrome.storage.local
                    : localstorage();

  /**
   * Colors.
   */

  exports.colors = [
    '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
    '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
    '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
    '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
    '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
    '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
    '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
    '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
    '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
    '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
    '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
  ];

  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
      return true;
    }

    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }

    // is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
      // is firebug? http://stackoverflow.com/a/398120/376773
      (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
      // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
      // double check webkit in userAgent just in case we are in a worker
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
  }

  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  exports.formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return '[UnexpectedJSONParseError]: ' + err.message;
    }
  };


  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  function formatArgs(args) {
    var useColors = this.useColors;

    args[0] = (useColors ? '%c' : '')
      + this.namespace
      + (useColors ? ' %c' : ' ')
      + args[0]
      + (useColors ? '%c ' : ' ')
      + '+' + exports.humanize(this.diff);

    if (!useColors) return;

    var c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');

    // the final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, function(match) {
      if ('%%' === match) return;
      index++;
      if ('%c' === match) {
        // we only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });

    args.splice(lastC, 0, c);
  }

  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */

  function log() {
    // this hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'
    return 'object' === typeof console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */

  function save(namespaces) {
    try {
      if (null == namespaces) {
        exports.storage.removeItem('debug');
      } else {
        exports.storage.debug = namespaces;
      }
    } catch(e) {}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */

  function load() {
    var r;
    try {
      r = exports.storage.debug;
    } catch(e) {}

    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
      r = process.env.DEBUG;
    }

    return r;
  }

  /**
   * Enable namespaces listed in `localStorage.debug` initially.
   */

  exports.enable(load());

  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */

  function localstorage() {
    try {
      return window.localStorage;
    } catch (e) {}
  }
  });
  var browser_1$3 = browser$3.log;
  var browser_2$3 = browser$3.formatArgs;
  var browser_3$3 = browser$3.save;
  var browser_4$3 = browser$3.load;
  var browser_5$3 = browser$3.useColors;
  var browser_6$3 = browser$3.storage;
  var browser_7$3 = browser$3.colors;

  /**
   * Module dependencies.
   */






  var debug$4 = browser$3('engine.io-client:polling');

  /**
   * Module exports.
   */

  var polling = Polling;

  /**
   * Is XHR2 supported?
   */

  var hasXHR2 = (function () {
    var XMLHttpRequest = xmlhttprequest;
    var xhr = new XMLHttpRequest({ xdomain: false });
    return null != xhr.responseType;
  })();

  /**
   * Polling interface.
   *
   * @param {Object} opts
   * @api private
   */

  function Polling (opts) {
    var forceBase64 = (opts && opts.forceBase64);
    if (!hasXHR2 || forceBase64) {
      this.supportsBinary = false;
    }
    transport.call(this, opts);
  }

  /**
   * Inherits from Transport.
   */

  componentInherit(Polling, transport);

  /**
   * Transport name.
   */

  Polling.prototype.name = 'polling';

  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @api private
   */

  Polling.prototype.doOpen = function () {
    this.poll();
  };

  /**
   * Pauses polling.
   *
   * @param {Function} callback upon buffers are flushed and transport is paused
   * @api private
   */

  Polling.prototype.pause = function (onPause) {
    var self = this;

    this.readyState = 'pausing';

    function pause () {
      debug$4('paused');
      self.readyState = 'paused';
      onPause();
    }

    if (this.polling || !this.writable) {
      var total = 0;

      if (this.polling) {
        debug$4('we are currently polling - waiting to pause');
        total++;
        this.once('pollComplete', function () {
          debug$4('pre-pause polling complete');
          --total || pause();
        });
      }

      if (!this.writable) {
        debug$4('we are currently writing - waiting to pause');
        total++;
        this.once('drain', function () {
          debug$4('pre-pause writing complete');
          --total || pause();
        });
      }
    } else {
      pause();
    }
  };

  /**
   * Starts polling cycle.
   *
   * @api public
   */

  Polling.prototype.poll = function () {
    debug$4('polling');
    this.polling = true;
    this.doPoll();
    this.emit('poll');
  };

  /**
   * Overloads onData to detect payloads.
   *
   * @api private
   */

  Polling.prototype.onData = function (data) {
    var self = this;
    debug$4('polling got data %s', data);
    var callback = function (packet, index, total) {
      // if its the first message we consider the transport open
      if ('opening' === self.readyState) {
        self.onOpen();
      }

      // if its a close packet, we close the ongoing requests
      if ('close' === packet.type) {
        self.onClose();
        return false;
      }

      // otherwise bypass onData and handle the message
      self.onPacket(packet);
    };

    // decode payload
    browser$2.decodePayload(data, this.socket.binaryType, callback);

    // if an event did not trigger closing
    if ('closed' !== this.readyState) {
      // if we got data we're not polling
      this.polling = false;
      this.emit('pollComplete');

      if ('open' === this.readyState) {
        this.poll();
      } else {
        debug$4('ignoring poll - transport state "%s"', this.readyState);
      }
    }
  };

  /**
   * For polling, send a close packet.
   *
   * @api private
   */

  Polling.prototype.doClose = function () {
    var self = this;

    function close () {
      debug$4('writing close packet');
      self.write([{ type: 'close' }]);
    }

    if ('open' === this.readyState) {
      debug$4('transport open - closing');
      close();
    } else {
      // in case we're trying to close while
      // handshaking is in progress (GH-164)
      debug$4('transport not open - deferring close');
      this.once('open', close);
    }
  };

  /**
   * Writes a packets payload.
   *
   * @param {Array} data packets
   * @param {Function} drain callback
   * @api private
   */

  Polling.prototype.write = function (packets) {
    var self = this;
    this.writable = false;
    var callbackfn = function () {
      self.writable = true;
      self.emit('drain');
    };

    browser$2.encodePayload(packets, this.supportsBinary, function (data) {
      self.doWrite(data, callbackfn);
    });
  };

  /**
   * Generates uri for connection.
   *
   * @api private
   */

  Polling.prototype.uri = function () {
    var query = this.query || {};
    var schema = this.secure ? 'https' : 'http';
    var port = '';

    // cache busting is forced
    if (false !== this.timestampRequests) {
      query[this.timestampParam] = yeast_1();
    }

    if (!this.supportsBinary && !query.sid) {
      query.b64 = 1;
    }

    query = parseqs.encode(query);

    // avoid port if default for schema
    if (this.port && (('https' === schema && Number(this.port) !== 443) ||
       ('http' === schema && Number(this.port) !== 80))) {
      port = ':' + this.port;
    }

    // prepend ? to query
    if (query.length) {
      query = '?' + query;
    }

    var ipv6 = this.hostname.indexOf(':') !== -1;
    return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
  };

  /* global attachEvent */

  /**
   * Module requirements.
   */





  var debug$5 = browser$3('engine.io-client:polling-xhr');

  /**
   * Module exports.
   */

  var pollingXhr = XHR;
  var Request_1 = Request;

  /**
   * Empty function
   */

  function empty () {}

  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @api public
   */

  function XHR (opts) {
    polling.call(this, opts);
    this.requestTimeout = opts.requestTimeout;
    this.extraHeaders = opts.extraHeaders;

    if (typeof location !== 'undefined') {
      var isSSL = 'https:' === location.protocol;
      var port = location.port;

      // some user agents have empty `location.port`
      if (!port) {
        port = isSSL ? 443 : 80;
      }

      this.xd = (typeof location !== 'undefined' && opts.hostname !== location.hostname) ||
        port !== opts.port;
      this.xs = opts.secure !== isSSL;
    }
  }

  /**
   * Inherits from Polling.
   */

  componentInherit(XHR, polling);

  /**
   * XHR supports binary
   */

  XHR.prototype.supportsBinary = true;

  /**
   * Creates a request.
   *
   * @param {String} method
   * @api private
   */

  XHR.prototype.request = function (opts) {
    opts = opts || {};
    opts.uri = this.uri();
    opts.xd = this.xd;
    opts.xs = this.xs;
    opts.agent = this.agent || false;
    opts.supportsBinary = this.supportsBinary;
    opts.enablesXDR = this.enablesXDR;

    // SSL options for Node.js client
    opts.pfx = this.pfx;
    opts.key = this.key;
    opts.passphrase = this.passphrase;
    opts.cert = this.cert;
    opts.ca = this.ca;
    opts.ciphers = this.ciphers;
    opts.rejectUnauthorized = this.rejectUnauthorized;
    opts.requestTimeout = this.requestTimeout;

    // other options for Node.js client
    opts.extraHeaders = this.extraHeaders;

    return new Request(opts);
  };

  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @api private
   */

  XHR.prototype.doWrite = function (data, fn) {
    var isBinary = typeof data !== 'string' && data !== undefined;
    var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
    var self = this;
    req.on('success', fn);
    req.on('error', function (err) {
      self.onError('xhr post error', err);
    });
    this.sendXhr = req;
  };

  /**
   * Starts a poll cycle.
   *
   * @api private
   */

  XHR.prototype.doPoll = function () {
    debug$5('xhr poll');
    var req = this.request();
    var self = this;
    req.on('data', function (data) {
      self.onData(data);
    });
    req.on('error', function (err) {
      self.onError('xhr poll error', err);
    });
    this.pollXhr = req;
  };

  /**
   * Request constructor
   *
   * @param {Object} options
   * @api public
   */

  function Request (opts) {
    this.method = opts.method || 'GET';
    this.uri = opts.uri;
    this.xd = !!opts.xd;
    this.xs = !!opts.xs;
    this.async = false !== opts.async;
    this.data = undefined !== opts.data ? opts.data : null;
    this.agent = opts.agent;
    this.isBinary = opts.isBinary;
    this.supportsBinary = opts.supportsBinary;
    this.enablesXDR = opts.enablesXDR;
    this.requestTimeout = opts.requestTimeout;

    // SSL options for Node.js client
    this.pfx = opts.pfx;
    this.key = opts.key;
    this.passphrase = opts.passphrase;
    this.cert = opts.cert;
    this.ca = opts.ca;
    this.ciphers = opts.ciphers;
    this.rejectUnauthorized = opts.rejectUnauthorized;

    // other options for Node.js client
    this.extraHeaders = opts.extraHeaders;

    this.create();
  }

  /**
   * Mix in `Emitter`.
   */

  componentEmitter(Request.prototype);

  /**
   * Creates the XHR object and sends the request.
   *
   * @api private
   */

  Request.prototype.create = function () {
    var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

    // SSL options for Node.js client
    opts.pfx = this.pfx;
    opts.key = this.key;
    opts.passphrase = this.passphrase;
    opts.cert = this.cert;
    opts.ca = this.ca;
    opts.ciphers = this.ciphers;
    opts.rejectUnauthorized = this.rejectUnauthorized;

    var xhr = this.xhr = new xmlhttprequest(opts);
    var self = this;

    try {
      debug$5('xhr open %s: %s', this.method, this.uri);
      xhr.open(this.method, this.uri, this.async);
      try {
        if (this.extraHeaders) {
          xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
          for (var i in this.extraHeaders) {
            if (this.extraHeaders.hasOwnProperty(i)) {
              xhr.setRequestHeader(i, this.extraHeaders[i]);
            }
          }
        }
      } catch (e) {}

      if ('POST' === this.method) {
        try {
          if (this.isBinary) {
            xhr.setRequestHeader('Content-type', 'application/octet-stream');
          } else {
            xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
          }
        } catch (e) {}
      }

      try {
        xhr.setRequestHeader('Accept', '*/*');
      } catch (e) {}

      // ie6 check
      if ('withCredentials' in xhr) {
        xhr.withCredentials = true;
      }

      if (this.requestTimeout) {
        xhr.timeout = this.requestTimeout;
      }

      if (this.hasXDR()) {
        xhr.onload = function () {
          self.onLoad();
        };
        xhr.onerror = function () {
          self.onError(xhr.responseText);
        };
      } else {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 2) {
            try {
              var contentType = xhr.getResponseHeader('Content-Type');
              if (self.supportsBinary && contentType === 'application/octet-stream') {
                xhr.responseType = 'arraybuffer';
              }
            } catch (e) {}
          }
          if (4 !== xhr.readyState) return;
          if (200 === xhr.status || 1223 === xhr.status) {
            self.onLoad();
          } else {
            // make sure the `error` event handler that's user-set
            // does not throw in the same tick and gets caught here
            setTimeout(function () {
              self.onError(xhr.status);
            }, 0);
          }
        };
      }

      debug$5('xhr data %s', this.data);
      xhr.send(this.data);
    } catch (e) {
      // Need to defer since .create() is called directly fhrom the constructor
      // and thus the 'error' event can only be only bound *after* this exception
      // occurs.  Therefore, also, we cannot throw here at all.
      setTimeout(function () {
        self.onError(e);
      }, 0);
      return;
    }

    if (typeof document !== 'undefined') {
      this.index = Request.requestsCount++;
      Request.requests[this.index] = this;
    }
  };

  /**
   * Called upon successful response.
   *
   * @api private
   */

  Request.prototype.onSuccess = function () {
    this.emit('success');
    this.cleanup();
  };

  /**
   * Called if we have data.
   *
   * @api private
   */

  Request.prototype.onData = function (data) {
    this.emit('data', data);
    this.onSuccess();
  };

  /**
   * Called upon error.
   *
   * @api private
   */

  Request.prototype.onError = function (err) {
    this.emit('error', err);
    this.cleanup(true);
  };

  /**
   * Cleans up house.
   *
   * @api private
   */

  Request.prototype.cleanup = function (fromError) {
    if ('undefined' === typeof this.xhr || null === this.xhr) {
      return;
    }
    // xmlhttprequest
    if (this.hasXDR()) {
      this.xhr.onload = this.xhr.onerror = empty;
    } else {
      this.xhr.onreadystatechange = empty;
    }

    if (fromError) {
      try {
        this.xhr.abort();
      } catch (e) {}
    }

    if (typeof document !== 'undefined') {
      delete Request.requests[this.index];
    }

    this.xhr = null;
  };

  /**
   * Called upon load.
   *
   * @api private
   */

  Request.prototype.onLoad = function () {
    var data;
    try {
      var contentType;
      try {
        contentType = this.xhr.getResponseHeader('Content-Type');
      } catch (e) {}
      if (contentType === 'application/octet-stream') {
        data = this.xhr.response || this.xhr.responseText;
      } else {
        data = this.xhr.responseText;
      }
    } catch (e) {
      this.onError(e);
    }
    if (null != data) {
      this.onData(data);
    }
  };

  /**
   * Check if it has XDomainRequest.
   *
   * @api private
   */

  Request.prototype.hasXDR = function () {
    return typeof XDomainRequest !== 'undefined' && !this.xs && this.enablesXDR;
  };

  /**
   * Aborts the request.
   *
   * @api public
   */

  Request.prototype.abort = function () {
    this.cleanup();
  };

  /**
   * Aborts pending requests when unloading the window. This is needed to prevent
   * memory leaks (e.g. when using IE) and to ensure that no spurious error is
   * emitted.
   */

  Request.requestsCount = 0;
  Request.requests = {};

  if (typeof document !== 'undefined') {
    if (typeof attachEvent === 'function') {
      attachEvent('onunload', unloadHandler);
    } else if (typeof addEventListener === 'function') {
      var terminationEvent = 'onpagehide' in self ? 'pagehide' : 'unload';
      addEventListener(terminationEvent, unloadHandler, false);
    }
  }

  function unloadHandler () {
    for (var i in Request.requests) {
      if (Request.requests.hasOwnProperty(i)) {
        Request.requests[i].abort();
      }
    }
  }
  pollingXhr.Request = Request_1;

  /**
   * Module requirements.
   */




  /**
   * Module exports.
   */

  var pollingJsonp = JSONPPolling;

  /**
   * Cached regular expressions.
   */

  var rNewline = /\n/g;
  var rEscapedNewline = /\\n/g;

  /**
   * Global JSONP callbacks.
   */

  var callbacks;

  /**
   * Noop.
   */

  function empty$1 () { }

  /**
   * Until https://github.com/tc39/proposal-global is shipped.
   */
  function glob () {
    return typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : {};
  }

  /**
   * JSONP Polling constructor.
   *
   * @param {Object} opts.
   * @api public
   */

  function JSONPPolling (opts) {
    polling.call(this, opts);

    this.query = this.query || {};

    // define global callbacks array if not present
    // we do this here (lazily) to avoid unneeded global pollution
    if (!callbacks) {
      // we need to consider multiple engines in the same page
      var global = glob();
      callbacks = global.___eio = (global.___eio || []);
    }

    // callback identifier
    this.index = callbacks.length;

    // add callback to jsonp global
    var self = this;
    callbacks.push(function (msg) {
      self.onData(msg);
    });

    // append to query string
    this.query.j = this.index;

    // prevent spurious errors from being emitted when the window is unloaded
    if (typeof addEventListener === 'function') {
      addEventListener('beforeunload', function () {
        if (self.script) self.script.onerror = empty$1;
      }, false);
    }
  }

  /**
   * Inherits from Polling.
   */

  componentInherit(JSONPPolling, polling);

  /*
   * JSONP only supports binary as base64 encoded strings
   */

  JSONPPolling.prototype.supportsBinary = false;

  /**
   * Closes the socket.
   *
   * @api private
   */

  JSONPPolling.prototype.doClose = function () {
    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    if (this.form) {
      this.form.parentNode.removeChild(this.form);
      this.form = null;
      this.iframe = null;
    }

    polling.prototype.doClose.call(this);
  };

  /**
   * Starts a poll cycle.
   *
   * @api private
   */

  JSONPPolling.prototype.doPoll = function () {
    var self = this;
    var script = document.createElement('script');

    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    script.async = true;
    script.src = this.uri();
    script.onerror = function (e) {
      self.onError('jsonp poll error', e);
    };

    var insertAt = document.getElementsByTagName('script')[0];
    if (insertAt) {
      insertAt.parentNode.insertBefore(script, insertAt);
    } else {
      (document.head || document.body).appendChild(script);
    }
    this.script = script;

    var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

    if (isUAgecko) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
      }, 100);
    }
  };

  /**
   * Writes with a hidden iframe.
   *
   * @param {String} data to send
   * @param {Function} called upon flush.
   * @api private
   */

  JSONPPolling.prototype.doWrite = function (data, fn) {
    var self = this;

    if (!this.form) {
      var form = document.createElement('form');
      var area = document.createElement('textarea');
      var id = this.iframeId = 'eio_iframe_' + this.index;
      var iframe;

      form.className = 'socketio';
      form.style.position = 'absolute';
      form.style.top = '-1000px';
      form.style.left = '-1000px';
      form.target = id;
      form.method = 'POST';
      form.setAttribute('accept-charset', 'utf-8');
      area.name = 'd';
      form.appendChild(area);
      document.body.appendChild(form);

      this.form = form;
      this.area = area;
    }

    this.form.action = this.uri();

    function complete () {
      initIframe();
      fn();
    }

    function initIframe () {
      if (self.iframe) {
        try {
          self.form.removeChild(self.iframe);
        } catch (e) {
          self.onError('jsonp polling iframe removal error', e);
        }
      }

      try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
        iframe = document.createElement(html);
      } catch (e) {
        iframe = document.createElement('iframe');
        iframe.name = self.iframeId;
        iframe.src = 'javascript:0';
      }

      iframe.id = self.iframeId;

      self.form.appendChild(iframe);
      self.iframe = iframe;
    }

    initIframe();

    // escape \n to prevent it from being converted into \r\n by some UAs
    // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
    data = data.replace(rEscapedNewline, '\\\n');
    this.area.value = data.replace(rNewline, '\\n');

    try {
      this.form.submit();
    } catch (e) {}

    if (this.iframe.attachEvent) {
      this.iframe.onreadystatechange = function () {
        if (self.iframe.readyState === 'complete') {
          complete();
        }
      };
    } else {
      this.iframe.onload = complete;
    }
  };

  var require$$1 = {};

  /**
   * Module dependencies.
   */






  var debug$6 = browser$3('engine.io-client:websocket');

  var BrowserWebSocket, NodeWebSocket;

  if (typeof WebSocket !== 'undefined') {
    BrowserWebSocket = WebSocket;
  } else if (typeof self !== 'undefined') {
    BrowserWebSocket = self.WebSocket || self.MozWebSocket;
  } else {
    try {
      NodeWebSocket = require$$1;
    } catch (e) { }
  }

  /**
   * Get either the `WebSocket` or `MozWebSocket` globals
   * in the browser or try to resolve WebSocket-compatible
   * interface exposed by `ws` for Node-like environment.
   */

  var WebSocketImpl = BrowserWebSocket || NodeWebSocket;

  /**
   * Module exports.
   */

  var websocket = WS;

  /**
   * WebSocket transport constructor.
   *
   * @api {Object} connection options
   * @api public
   */

  function WS (opts) {
    var forceBase64 = (opts && opts.forceBase64);
    if (forceBase64) {
      this.supportsBinary = false;
    }
    this.perMessageDeflate = opts.perMessageDeflate;
    this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
    this.protocols = opts.protocols;
    if (!this.usingBrowserWebSocket) {
      WebSocketImpl = NodeWebSocket;
    }
    transport.call(this, opts);
  }

  /**
   * Inherits from Transport.
   */

  componentInherit(WS, transport);

  /**
   * Transport name.
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /*
   * WebSockets support binary
   */

  WS.prototype.supportsBinary = true;

  /**
   * Opens socket.
   *
   * @api private
   */

  WS.prototype.doOpen = function () {
    if (!this.check()) {
      // let probe timeout
      return;
    }

    var uri = this.uri();
    var protocols = this.protocols;
    var opts = {
      agent: this.agent,
      perMessageDeflate: this.perMessageDeflate
    };

    // SSL options for Node.js client
    opts.pfx = this.pfx;
    opts.key = this.key;
    opts.passphrase = this.passphrase;
    opts.cert = this.cert;
    opts.ca = this.ca;
    opts.ciphers = this.ciphers;
    opts.rejectUnauthorized = this.rejectUnauthorized;
    if (this.extraHeaders) {
      opts.headers = this.extraHeaders;
    }
    if (this.localAddress) {
      opts.localAddress = this.localAddress;
    }

    try {
      this.ws =
        this.usingBrowserWebSocket && !this.isReactNative
          ? protocols
            ? new WebSocketImpl(uri, protocols)
            : new WebSocketImpl(uri)
          : new WebSocketImpl(uri, protocols, opts);
    } catch (err) {
      return this.emit('error', err);
    }

    if (this.ws.binaryType === undefined) {
      this.supportsBinary = false;
    }

    if (this.ws.supports && this.ws.supports.binary) {
      this.supportsBinary = true;
      this.ws.binaryType = 'nodebuffer';
    } else {
      this.ws.binaryType = 'arraybuffer';
    }

    this.addEventListeners();
  };

  /**
   * Adds event listeners to the socket
   *
   * @api private
   */

  WS.prototype.addEventListeners = function () {
    var self = this;

    this.ws.onopen = function () {
      self.onOpen();
    };
    this.ws.onclose = function () {
      self.onClose();
    };
    this.ws.onmessage = function (ev) {
      self.onData(ev.data);
    };
    this.ws.onerror = function (e) {
      self.onError('websocket error', e);
    };
  };

  /**
   * Writes data to socket.
   *
   * @param {Array} array of packets.
   * @api private
   */

  WS.prototype.write = function (packets) {
    var self = this;
    this.writable = false;

    // encodePacket efficient as it uses WS framing
    // no need for encodePayload
    var total = packets.length;
    for (var i = 0, l = total; i < l; i++) {
      (function (packet) {
        browser$2.encodePacket(packet, self.supportsBinary, function (data) {
          if (!self.usingBrowserWebSocket) {
            // always create a new object (GH-437)
            var opts = {};
            if (packet.options) {
              opts.compress = packet.options.compress;
            }

            if (self.perMessageDeflate) {
              var len = 'string' === typeof data ? Buffer.byteLength(data) : data.length;
              if (len < self.perMessageDeflate.threshold) {
                opts.compress = false;
              }
            }
          }

          // Sometimes the websocket has already been closed but the browser didn't
          // have a chance of informing us about it yet, in that case send will
          // throw an error
          try {
            if (self.usingBrowserWebSocket) {
              // TypeError is thrown when passing the second argument on Safari
              self.ws.send(data);
            } else {
              self.ws.send(data, opts);
            }
          } catch (e) {
            debug$6('websocket closed before onclose event');
          }

          --total || done();
        });
      })(packets[i]);
    }

    function done () {
      self.emit('flush');

      // fake drain
      // defer to next tick to allow Socket to clear writeBuffer
      setTimeout(function () {
        self.writable = true;
        self.emit('drain');
      }, 0);
    }
  };

  /**
   * Called upon close
   *
   * @api private
   */

  WS.prototype.onClose = function () {
    transport.prototype.onClose.call(this);
  };

  /**
   * Closes socket.
   *
   * @api private
   */

  WS.prototype.doClose = function () {
    if (typeof this.ws !== 'undefined') {
      this.ws.close();
    }
  };

  /**
   * Generates uri for connection.
   *
   * @api private
   */

  WS.prototype.uri = function () {
    var query = this.query || {};
    var schema = this.secure ? 'wss' : 'ws';
    var port = '';

    // avoid port if default for schema
    if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
      ('ws' === schema && Number(this.port) !== 80))) {
      port = ':' + this.port;
    }

    // append timestamp to URI
    if (this.timestampRequests) {
      query[this.timestampParam] = yeast_1();
    }

    // communicate binary support capabilities
    if (!this.supportsBinary) {
      query.b64 = 1;
    }

    query = parseqs.encode(query);

    // prepend ? to query
    if (query.length) {
      query = '?' + query;
    }

    var ipv6 = this.hostname.indexOf(':') !== -1;
    return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
  };

  /**
   * Feature detection for WebSocket.
   *
   * @return {Boolean} whether this transport is available.
   * @api public
   */

  WS.prototype.check = function () {
    return !!WebSocketImpl && !('__initialize' in WebSocketImpl && this.name === WS.prototype.name);
  };

  /**
   * Module dependencies
   */






  /**
   * Export transports.
   */

  var polling_1 = polling$1;
  var websocket_1 = websocket;

  /**
   * Polling transport polymorphic constructor.
   * Decides on xhr vs jsonp based on feature detection.
   *
   * @api private
   */

  function polling$1 (opts) {
    var xhr;
    var xd = false;
    var xs = false;
    var jsonp = false !== opts.jsonp;

    if (typeof location !== 'undefined') {
      var isSSL = 'https:' === location.protocol;
      var port = location.port;

      // some user agents have empty `location.port`
      if (!port) {
        port = isSSL ? 443 : 80;
      }

      xd = opts.hostname !== location.hostname || port !== opts.port;
      xs = opts.secure !== isSSL;
    }

    opts.xdomain = xd;
    opts.xscheme = xs;
    xhr = new xmlhttprequest(opts);

    if ('open' in xhr && !opts.forceJSONP) {
      return new pollingXhr(opts);
    } else {
      if (!jsonp) throw new Error('JSONP disabled');
      return new pollingJsonp(opts);
    }
  }

  var transports = {
  	polling: polling_1,
  	websocket: websocket_1
  };

  var indexOf$1 = [].indexOf;

  var indexof = function(arr, obj){
    if (indexOf$1) return arr.indexOf(obj);
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === obj) return i;
    }
    return -1;
  };

  /**
   * Module dependencies.
   */



  var debug$7 = browser$3('engine.io-client:socket');





  /**
   * Module exports.
   */

  var socket = Socket;

  /**
   * Socket constructor.
   *
   * @param {String|Object} uri or options
   * @param {Object} options
   * @api public
   */

  function Socket (uri, opts) {
    if (!(this instanceof Socket)) return new Socket(uri, opts);

    opts = opts || {};

    if (uri && 'object' === typeof uri) {
      opts = uri;
      uri = null;
    }

    if (uri) {
      uri = parseuri(uri);
      opts.hostname = uri.host;
      opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
      opts.port = uri.port;
      if (uri.query) opts.query = uri.query;
    } else if (opts.host) {
      opts.hostname = parseuri(opts.host).host;
    }

    this.secure = null != opts.secure ? opts.secure
      : (typeof location !== 'undefined' && 'https:' === location.protocol);

    if (opts.hostname && !opts.port) {
      // if no port is specified manually, use the protocol default
      opts.port = this.secure ? '443' : '80';
    }

    this.agent = opts.agent || false;
    this.hostname = opts.hostname ||
      (typeof location !== 'undefined' ? location.hostname : 'localhost');
    this.port = opts.port || (typeof location !== 'undefined' && location.port
        ? location.port
        : (this.secure ? 443 : 80));
    this.query = opts.query || {};
    if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
    this.upgrade = false !== opts.upgrade;
    this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
    this.forceJSONP = !!opts.forceJSONP;
    this.jsonp = false !== opts.jsonp;
    this.forceBase64 = !!opts.forceBase64;
    this.enablesXDR = !!opts.enablesXDR;
    this.timestampParam = opts.timestampParam || 't';
    this.timestampRequests = opts.timestampRequests;
    this.transports = opts.transports || ['polling', 'websocket'];
    this.transportOptions = opts.transportOptions || {};
    this.readyState = '';
    this.writeBuffer = [];
    this.prevBufferLen = 0;
    this.policyPort = opts.policyPort || 843;
    this.rememberUpgrade = opts.rememberUpgrade || false;
    this.binaryType = null;
    this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
    this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

    if (true === this.perMessageDeflate) this.perMessageDeflate = {};
    if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
      this.perMessageDeflate.threshold = 1024;
    }

    // SSL options for Node.js client
    this.pfx = opts.pfx || null;
    this.key = opts.key || null;
    this.passphrase = opts.passphrase || null;
    this.cert = opts.cert || null;
    this.ca = opts.ca || null;
    this.ciphers = opts.ciphers || null;
    this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
    this.forceNode = !!opts.forceNode;

    // detect ReactNative environment
    this.isReactNative = (typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative');

    // other options for Node.js or ReactNative client
    if (typeof self === 'undefined' || this.isReactNative) {
      if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
        this.extraHeaders = opts.extraHeaders;
      }

      if (opts.localAddress) {
        this.localAddress = opts.localAddress;
      }
    }

    // set on handshake
    this.id = null;
    this.upgrades = null;
    this.pingInterval = null;
    this.pingTimeout = null;

    // set on heartbeat
    this.pingIntervalTimer = null;
    this.pingTimeoutTimer = null;

    this.open();
  }

  Socket.priorWebsocketSuccess = false;

  /**
   * Mix in `Emitter`.
   */

  componentEmitter(Socket.prototype);

  /**
   * Protocol version.
   *
   * @api public
   */

  Socket.protocol = browser$2.protocol; // this is an int

  /**
   * Expose deps for legacy compatibility
   * and standalone browser access.
   */

  Socket.Socket = Socket;
  Socket.Transport = transport;
  Socket.transports = transports;
  Socket.parser = browser$2;

  /**
   * Creates transport of the given type.
   *
   * @param {String} transport name
   * @return {Transport}
   * @api private
   */

  Socket.prototype.createTransport = function (name) {
    debug$7('creating transport "%s"', name);
    var query = clone(this.query);

    // append engine.io protocol identifier
    query.EIO = browser$2.protocol;

    // transport name
    query.transport = name;

    // per-transport options
    var options = this.transportOptions[name] || {};

    // session id if we already have one
    if (this.id) query.sid = this.id;

    var transport = new transports[name]({
      query: query,
      socket: this,
      agent: options.agent || this.agent,
      hostname: options.hostname || this.hostname,
      port: options.port || this.port,
      secure: options.secure || this.secure,
      path: options.path || this.path,
      forceJSONP: options.forceJSONP || this.forceJSONP,
      jsonp: options.jsonp || this.jsonp,
      forceBase64: options.forceBase64 || this.forceBase64,
      enablesXDR: options.enablesXDR || this.enablesXDR,
      timestampRequests: options.timestampRequests || this.timestampRequests,
      timestampParam: options.timestampParam || this.timestampParam,
      policyPort: options.policyPort || this.policyPort,
      pfx: options.pfx || this.pfx,
      key: options.key || this.key,
      passphrase: options.passphrase || this.passphrase,
      cert: options.cert || this.cert,
      ca: options.ca || this.ca,
      ciphers: options.ciphers || this.ciphers,
      rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
      perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
      extraHeaders: options.extraHeaders || this.extraHeaders,
      forceNode: options.forceNode || this.forceNode,
      localAddress: options.localAddress || this.localAddress,
      requestTimeout: options.requestTimeout || this.requestTimeout,
      protocols: options.protocols || void (0),
      isReactNative: this.isReactNative
    });

    return transport;
  };

  function clone (obj) {
    var o = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        o[i] = obj[i];
      }
    }
    return o;
  }

  /**
   * Initializes transport to use and starts probe.
   *
   * @api private
   */
  Socket.prototype.open = function () {
    var transport;
    if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
      transport = 'websocket';
    } else if (0 === this.transports.length) {
      // Emit error on next tick so it can be listened to
      var self = this;
      setTimeout(function () {
        self.emit('error', 'No transports available');
      }, 0);
      return;
    } else {
      transport = this.transports[0];
    }
    this.readyState = 'opening';

    // Retry with the next transport if the transport is disabled (jsonp: false)
    try {
      transport = this.createTransport(transport);
    } catch (e) {
      this.transports.shift();
      this.open();
      return;
    }

    transport.open();
    this.setTransport(transport);
  };

  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @api private
   */

  Socket.prototype.setTransport = function (transport) {
    debug$7('setting transport %s', transport.name);
    var self = this;

    if (this.transport) {
      debug$7('clearing existing transport %s', this.transport.name);
      this.transport.removeAllListeners();
    }

    // set up transport
    this.transport = transport;

    // set up transport listeners
    transport
    .on('drain', function () {
      self.onDrain();
    })
    .on('packet', function (packet) {
      self.onPacket(packet);
    })
    .on('error', function (e) {
      self.onError(e);
    })
    .on('close', function () {
      self.onClose('transport close');
    });
  };

  /**
   * Probes a transport.
   *
   * @param {String} transport name
   * @api private
   */

  Socket.prototype.probe = function (name) {
    debug$7('probing transport "%s"', name);
    var transport = this.createTransport(name, { probe: 1 });
    var failed = false;
    var self = this;

    Socket.priorWebsocketSuccess = false;

    function onTransportOpen () {
      if (self.onlyBinaryUpgrades) {
        var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
        failed = failed || upgradeLosesBinary;
      }
      if (failed) return;

      debug$7('probe transport "%s" opened', name);
      transport.send([{ type: 'ping', data: 'probe' }]);
      transport.once('packet', function (msg) {
        if (failed) return;
        if ('pong' === msg.type && 'probe' === msg.data) {
          debug$7('probe transport "%s" pong', name);
          self.upgrading = true;
          self.emit('upgrading', transport);
          if (!transport) return;
          Socket.priorWebsocketSuccess = 'websocket' === transport.name;

          debug$7('pausing current transport "%s"', self.transport.name);
          self.transport.pause(function () {
            if (failed) return;
            if ('closed' === self.readyState) return;
            debug$7('changing transport and sending upgrade packet');

            cleanup();

            self.setTransport(transport);
            transport.send([{ type: 'upgrade' }]);
            self.emit('upgrade', transport);
            transport = null;
            self.upgrading = false;
            self.flush();
          });
        } else {
          debug$7('probe transport "%s" failed', name);
          var err = new Error('probe error');
          err.transport = transport.name;
          self.emit('upgradeError', err);
        }
      });
    }

    function freezeTransport () {
      if (failed) return;

      // Any callback called by transport should be ignored since now
      failed = true;

      cleanup();

      transport.close();
      transport = null;
    }

    // Handle any error that happens while probing
    function onerror (err) {
      var error = new Error('probe error: ' + err);
      error.transport = transport.name;

      freezeTransport();

      debug$7('probe transport "%s" failed because of error: %s', name, err);

      self.emit('upgradeError', error);
    }

    function onTransportClose () {
      onerror('transport closed');
    }

    // When the socket is closed while we're probing
    function onclose () {
      onerror('socket closed');
    }

    // When the socket is upgraded while we're probing
    function onupgrade (to) {
      if (transport && to.name !== transport.name) {
        debug$7('"%s" works - aborting "%s"', to.name, transport.name);
        freezeTransport();
      }
    }

    // Remove all listeners on the transport and on self
    function cleanup () {
      transport.removeListener('open', onTransportOpen);
      transport.removeListener('error', onerror);
      transport.removeListener('close', onTransportClose);
      self.removeListener('close', onclose);
      self.removeListener('upgrading', onupgrade);
    }

    transport.once('open', onTransportOpen);
    transport.once('error', onerror);
    transport.once('close', onTransportClose);

    this.once('close', onclose);
    this.once('upgrading', onupgrade);

    transport.open();
  };

  /**
   * Called when connection is deemed open.
   *
   * @api public
   */

  Socket.prototype.onOpen = function () {
    debug$7('socket open');
    this.readyState = 'open';
    Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
    this.emit('open');
    this.flush();

    // we check for `readyState` in case an `open`
    // listener already closed the socket
    if ('open' === this.readyState && this.upgrade && this.transport.pause) {
      debug$7('starting upgrade probes');
      for (var i = 0, l = this.upgrades.length; i < l; i++) {
        this.probe(this.upgrades[i]);
      }
    }
  };

  /**
   * Handles a packet.
   *
   * @api private
   */

  Socket.prototype.onPacket = function (packet) {
    if ('opening' === this.readyState || 'open' === this.readyState ||
        'closing' === this.readyState) {
      debug$7('socket receive: type "%s", data "%s"', packet.type, packet.data);

      this.emit('packet', packet);

      // Socket is live - any packet counts
      this.emit('heartbeat');

      switch (packet.type) {
        case 'open':
          this.onHandshake(JSON.parse(packet.data));
          break;

        case 'pong':
          this.setPing();
          this.emit('pong');
          break;

        case 'error':
          var err = new Error('server error');
          err.code = packet.data;
          this.onError(err);
          break;

        case 'message':
          this.emit('data', packet.data);
          this.emit('message', packet.data);
          break;
      }
    } else {
      debug$7('packet received with socket readyState "%s"', this.readyState);
    }
  };

  /**
   * Called upon handshake completion.
   *
   * @param {Object} handshake obj
   * @api private
   */

  Socket.prototype.onHandshake = function (data) {
    this.emit('handshake', data);
    this.id = data.sid;
    this.transport.query.sid = data.sid;
    this.upgrades = this.filterUpgrades(data.upgrades);
    this.pingInterval = data.pingInterval;
    this.pingTimeout = data.pingTimeout;
    this.onOpen();
    // In case open handler closes socket
    if ('closed' === this.readyState) return;
    this.setPing();

    // Prolong liveness of socket on heartbeat
    this.removeListener('heartbeat', this.onHeartbeat);
    this.on('heartbeat', this.onHeartbeat);
  };

  /**
   * Resets ping timeout.
   *
   * @api private
   */

  Socket.prototype.onHeartbeat = function (timeout) {
    clearTimeout(this.pingTimeoutTimer);
    var self = this;
    self.pingTimeoutTimer = setTimeout(function () {
      if ('closed' === self.readyState) return;
      self.onClose('ping timeout');
    }, timeout || (self.pingInterval + self.pingTimeout));
  };

  /**
   * Pings server every `this.pingInterval` and expects response
   * within `this.pingTimeout` or closes connection.
   *
   * @api private
   */

  Socket.prototype.setPing = function () {
    var self = this;
    clearTimeout(self.pingIntervalTimer);
    self.pingIntervalTimer = setTimeout(function () {
      debug$7('writing ping packet - expecting pong within %sms', self.pingTimeout);
      self.ping();
      self.onHeartbeat(self.pingTimeout);
    }, self.pingInterval);
  };

  /**
  * Sends a ping packet.
  *
  * @api private
  */

  Socket.prototype.ping = function () {
    var self = this;
    this.sendPacket('ping', function () {
      self.emit('ping');
    });
  };

  /**
   * Called on `drain` event
   *
   * @api private
   */

  Socket.prototype.onDrain = function () {
    this.writeBuffer.splice(0, this.prevBufferLen);

    // setting prevBufferLen = 0 is very important
    // for example, when upgrading, upgrade packet is sent over,
    // and a nonzero prevBufferLen could cause problems on `drain`
    this.prevBufferLen = 0;

    if (0 === this.writeBuffer.length) {
      this.emit('drain');
    } else {
      this.flush();
    }
  };

  /**
   * Flush write buffers.
   *
   * @api private
   */

  Socket.prototype.flush = function () {
    if ('closed' !== this.readyState && this.transport.writable &&
      !this.upgrading && this.writeBuffer.length) {
      debug$7('flushing %d packets in socket', this.writeBuffer.length);
      this.transport.send(this.writeBuffer);
      // keep track of current length of writeBuffer
      // splice writeBuffer and callbackBuffer on `drain`
      this.prevBufferLen = this.writeBuffer.length;
      this.emit('flush');
    }
  };

  /**
   * Sends a message.
   *
   * @param {String} message.
   * @param {Function} callback function.
   * @param {Object} options.
   * @return {Socket} for chaining.
   * @api public
   */

  Socket.prototype.write =
  Socket.prototype.send = function (msg, options, fn) {
    this.sendPacket('message', msg, options, fn);
    return this;
  };

  /**
   * Sends a packet.
   *
   * @param {String} packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} callback function.
   * @api private
   */

  Socket.prototype.sendPacket = function (type, data, options, fn) {
    if ('function' === typeof data) {
      fn = data;
      data = undefined;
    }

    if ('function' === typeof options) {
      fn = options;
      options = null;
    }

    if ('closing' === this.readyState || 'closed' === this.readyState) {
      return;
    }

    options = options || {};
    options.compress = false !== options.compress;

    var packet = {
      type: type,
      data: data,
      options: options
    };
    this.emit('packetCreate', packet);
    this.writeBuffer.push(packet);
    if (fn) this.once('flush', fn);
    this.flush();
  };

  /**
   * Closes the connection.
   *
   * @api private
   */

  Socket.prototype.close = function () {
    if ('opening' === this.readyState || 'open' === this.readyState) {
      this.readyState = 'closing';

      var self = this;

      if (this.writeBuffer.length) {
        this.once('drain', function () {
          if (this.upgrading) {
            waitForUpgrade();
          } else {
            close();
          }
        });
      } else if (this.upgrading) {
        waitForUpgrade();
      } else {
        close();
      }
    }

    function close () {
      self.onClose('forced close');
      debug$7('socket closing - telling transport to close');
      self.transport.close();
    }

    function cleanupAndClose () {
      self.removeListener('upgrade', cleanupAndClose);
      self.removeListener('upgradeError', cleanupAndClose);
      close();
    }

    function waitForUpgrade () {
      // wait for upgrade to finish since we can't send packets while pausing a transport
      self.once('upgrade', cleanupAndClose);
      self.once('upgradeError', cleanupAndClose);
    }

    return this;
  };

  /**
   * Called upon transport error
   *
   * @api private
   */

  Socket.prototype.onError = function (err) {
    debug$7('socket error %j', err);
    Socket.priorWebsocketSuccess = false;
    this.emit('error', err);
    this.onClose('transport error', err);
  };

  /**
   * Called upon transport close.
   *
   * @api private
   */

  Socket.prototype.onClose = function (reason, desc) {
    if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
      debug$7('socket close with reason: "%s"', reason);
      var self = this;

      // clear timers
      clearTimeout(this.pingIntervalTimer);
      clearTimeout(this.pingTimeoutTimer);

      // stop event from firing again for transport
      this.transport.removeAllListeners('close');

      // ensure transport won't stay open
      this.transport.close();

      // ignore further transport communication
      this.transport.removeAllListeners();

      // set ready state
      this.readyState = 'closed';

      // clear session id
      this.id = null;

      // emit close event
      this.emit('close', reason, desc);

      // clean buffers after, so users can still
      // grab the buffers on `close` event
      self.writeBuffer = [];
      self.prevBufferLen = 0;
    }
  };

  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} server upgrades
   * @api private
   *
   */

  Socket.prototype.filterUpgrades = function (upgrades) {
    var filteredUpgrades = [];
    for (var i = 0, j = upgrades.length; i < j; i++) {
      if (~indexof(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
    }
    return filteredUpgrades;
  };

  var lib$1 = socket;

  /**
   * Exports parser
   *
   * @api public
   *
   */
  var parser = browser$2;
  lib$1.parser = parser;

  var toArray_1 = toArray;

  function toArray(list, index) {
      var array = [];

      index = index || 0;

      for (var i = index || 0; i < list.length; i++) {
          array[i - index] = list[i];
      }

      return array
  }

  /**
   * Module exports.
   */

  var on_1 = on;

  /**
   * Helper for subscriptions.
   *
   * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
   * @param {String} event name
   * @param {Function} callback
   * @api public
   */

  function on (obj, ev, fn) {
    obj.on(ev, fn);
    return {
      destroy: function () {
        obj.removeListener(ev, fn);
      }
    };
  }

  /**
   * Slice reference.
   */

  var slice = [].slice;

  /**
   * Bind `obj` to `fn`.
   *
   * @param {Object} obj
   * @param {Function|String} fn or string
   * @return {Function}
   * @api public
   */

  var componentBind = function(obj, fn){
    if ('string' == typeof fn) fn = obj[fn];
    if ('function' != typeof fn) throw new Error('bind() requires a function');
    var args = slice.call(arguments, 2);
    return function(){
      return fn.apply(obj, args.concat(slice.call(arguments)));
    }
  };

  var socket$1 = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */






  var debug = browser('socket.io-client:socket');



  /**
   * Module exports.
   */

  module.exports = exports = Socket;

  /**
   * Internal events (blacklisted).
   * These events can't be emitted by the user.
   *
   * @api private
   */

  var events = {
    connect: 1,
    connect_error: 1,
    connect_timeout: 1,
    connecting: 1,
    disconnect: 1,
    error: 1,
    reconnect: 1,
    reconnect_attempt: 1,
    reconnect_failed: 1,
    reconnect_error: 1,
    reconnecting: 1,
    ping: 1,
    pong: 1
  };

  /**
   * Shortcut to `Emitter#emit`.
   */

  var emit = componentEmitter.prototype.emit;

  /**
   * `Socket` constructor.
   *
   * @api public
   */

  function Socket (io, nsp, opts) {
    this.io = io;
    this.nsp = nsp;
    this.json = this; // compat
    this.ids = 0;
    this.acks = {};
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this.connected = false;
    this.disconnected = true;
    this.flags = {};
    if (opts && opts.query) {
      this.query = opts.query;
    }
    if (this.io.autoConnect) this.open();
  }

  /**
   * Mix in `Emitter`.
   */

  componentEmitter(Socket.prototype);

  /**
   * Subscribe to open, close and packet events
   *
   * @api private
   */

  Socket.prototype.subEvents = function () {
    if (this.subs) return;

    var io = this.io;
    this.subs = [
      on_1(io, 'open', componentBind(this, 'onopen')),
      on_1(io, 'packet', componentBind(this, 'onpacket')),
      on_1(io, 'close', componentBind(this, 'onclose'))
    ];
  };

  /**
   * "Opens" the socket.
   *
   * @api public
   */

  Socket.prototype.open =
  Socket.prototype.connect = function () {
    if (this.connected) return this;

    this.subEvents();
    this.io.open(); // ensure open
    if ('open' === this.io.readyState) this.onopen();
    this.emit('connecting');
    return this;
  };

  /**
   * Sends a `message` event.
   *
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.send = function () {
    var args = toArray_1(arguments);
    args.unshift('message');
    this.emit.apply(this, args);
    return this;
  };

  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @param {String} event name
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.emit = function (ev) {
    if (events.hasOwnProperty(ev)) {
      emit.apply(this, arguments);
      return this;
    }

    var args = toArray_1(arguments);
    var packet = {
      type: (this.flags.binary !== undefined ? this.flags.binary : hasBinary2(args)) ? socket_ioParser.BINARY_EVENT : socket_ioParser.EVENT,
      data: args
    };

    packet.options = {};
    packet.options.compress = !this.flags || false !== this.flags.compress;

    // event ack callback
    if ('function' === typeof args[args.length - 1]) {
      debug('emitting packet with ack id %d', this.ids);
      this.acks[this.ids] = args.pop();
      packet.id = this.ids++;
    }

    if (this.connected) {
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }

    this.flags = {};

    return this;
  };

  /**
   * Sends a packet.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.packet = function (packet) {
    packet.nsp = this.nsp;
    this.io.packet(packet);
  };

  /**
   * Called upon engine `open`.
   *
   * @api private
   */

  Socket.prototype.onopen = function () {
    debug('transport is open - connecting');

    // write connect packet if necessary
    if ('/' !== this.nsp) {
      if (this.query) {
        var query = typeof this.query === 'object' ? parseqs.encode(this.query) : this.query;
        debug('sending connect packet with query %s', query);
        this.packet({type: socket_ioParser.CONNECT, query: query});
      } else {
        this.packet({type: socket_ioParser.CONNECT});
      }
    }
  };

  /**
   * Called upon engine `close`.
   *
   * @param {String} reason
   * @api private
   */

  Socket.prototype.onclose = function (reason) {
    debug('close (%s)', reason);
    this.connected = false;
    this.disconnected = true;
    delete this.id;
    this.emit('disconnect', reason);
  };

  /**
   * Called with socket packet.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.onpacket = function (packet) {
    var sameNamespace = packet.nsp === this.nsp;
    var rootNamespaceError = packet.type === socket_ioParser.ERROR && packet.nsp === '/';

    if (!sameNamespace && !rootNamespaceError) return;

    switch (packet.type) {
      case socket_ioParser.CONNECT:
        this.onconnect();
        break;

      case socket_ioParser.EVENT:
        this.onevent(packet);
        break;

      case socket_ioParser.BINARY_EVENT:
        this.onevent(packet);
        break;

      case socket_ioParser.ACK:
        this.onack(packet);
        break;

      case socket_ioParser.BINARY_ACK:
        this.onack(packet);
        break;

      case socket_ioParser.DISCONNECT:
        this.ondisconnect();
        break;

      case socket_ioParser.ERROR:
        this.emit('error', packet.data);
        break;
    }
  };

  /**
   * Called upon a server event.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.onevent = function (packet) {
    var args = packet.data || [];
    debug('emitting event %j', args);

    if (null != packet.id) {
      debug('attaching ack callback to event');
      args.push(this.ack(packet.id));
    }

    if (this.connected) {
      emit.apply(this, args);
    } else {
      this.receiveBuffer.push(args);
    }
  };

  /**
   * Produces an ack callback to emit with an event.
   *
   * @api private
   */

  Socket.prototype.ack = function (id) {
    var self = this;
    var sent = false;
    return function () {
      // prevent double callbacks
      if (sent) return;
      sent = true;
      var args = toArray_1(arguments);
      debug('sending ack %j', args);

      self.packet({
        type: hasBinary2(args) ? socket_ioParser.BINARY_ACK : socket_ioParser.ACK,
        id: id,
        data: args
      });
    };
  };

  /**
   * Called upon a server acknowlegement.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.onack = function (packet) {
    var ack = this.acks[packet.id];
    if ('function' === typeof ack) {
      debug('calling ack %s with %j', packet.id, packet.data);
      ack.apply(this, packet.data);
      delete this.acks[packet.id];
    } else {
      debug('bad ack %s', packet.id);
    }
  };

  /**
   * Called upon server connect.
   *
   * @api private
   */

  Socket.prototype.onconnect = function () {
    this.connected = true;
    this.disconnected = false;
    this.emit('connect');
    this.emitBuffered();
  };

  /**
   * Emit buffered events (received and emitted).
   *
   * @api private
   */

  Socket.prototype.emitBuffered = function () {
    var i;
    for (i = 0; i < this.receiveBuffer.length; i++) {
      emit.apply(this, this.receiveBuffer[i]);
    }
    this.receiveBuffer = [];

    for (i = 0; i < this.sendBuffer.length; i++) {
      this.packet(this.sendBuffer[i]);
    }
    this.sendBuffer = [];
  };

  /**
   * Called upon server disconnect.
   *
   * @api private
   */

  Socket.prototype.ondisconnect = function () {
    debug('server disconnect (%s)', this.nsp);
    this.destroy();
    this.onclose('io server disconnect');
  };

  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @api private.
   */

  Socket.prototype.destroy = function () {
    if (this.subs) {
      // clean subscriptions to avoid reconnections
      for (var i = 0; i < this.subs.length; i++) {
        this.subs[i].destroy();
      }
      this.subs = null;
    }

    this.io.destroy(this);
  };

  /**
   * Disconnects the socket manually.
   *
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.close =
  Socket.prototype.disconnect = function () {
    if (this.connected) {
      debug('performing disconnect (%s)', this.nsp);
      this.packet({ type: socket_ioParser.DISCONNECT });
    }

    // remove socket from pool
    this.destroy();

    if (this.connected) {
      // fire events
      this.onclose('io client disconnect');
    }
    return this;
  };

  /**
   * Sets the compress flag.
   *
   * @param {Boolean} if `true`, compresses the sending data
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.compress = function (compress) {
    this.flags.compress = compress;
    return this;
  };

  /**
   * Sets the binary flag
   *
   * @param {Boolean} whether the emitted data contains binary
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.binary = function (binary) {
    this.flags.binary = binary;
    return this;
  };
  });

  /**
   * Expose `Backoff`.
   */

  var backo2 = Backoff;

  /**
   * Initialize backoff timer with `opts`.
   *
   * - `min` initial timeout in milliseconds [100]
   * - `max` max timeout [10000]
   * - `jitter` [0]
   * - `factor` [2]
   *
   * @param {Object} opts
   * @api public
   */

  function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 10000;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
  }

  /**
   * Return the backoff duration.
   *
   * @return {Number}
   * @api public
   */

  Backoff.prototype.duration = function(){
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
      var rand =  Math.random();
      var deviation = Math.floor(rand * this.jitter * ms);
      ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
  };

  /**
   * Reset the number of attempts.
   *
   * @api public
   */

  Backoff.prototype.reset = function(){
    this.attempts = 0;
  };

  /**
   * Set the minimum duration
   *
   * @api public
   */

  Backoff.prototype.setMin = function(min){
    this.ms = min;
  };

  /**
   * Set the maximum duration
   *
   * @api public
   */

  Backoff.prototype.setMax = function(max){
    this.max = max;
  };

  /**
   * Set the jitter
   *
   * @api public
   */

  Backoff.prototype.setJitter = function(jitter){
    this.jitter = jitter;
  };

  /**
   * Module dependencies.
   */







  var debug$8 = browser('socket.io-client:manager');



  /**
   * IE6+ hasOwnProperty
   */

  var has = Object.prototype.hasOwnProperty;

  /**
   * Module exports
   */

  var manager = Manager;

  /**
   * `Manager` constructor.
   *
   * @param {String} engine instance or engine uri/opts
   * @param {Object} options
   * @api public
   */

  function Manager (uri, opts) {
    if (!(this instanceof Manager)) return new Manager(uri, opts);
    if (uri && ('object' === typeof uri)) {
      opts = uri;
      uri = undefined;
    }
    opts = opts || {};

    opts.path = opts.path || '/socket.io';
    this.nsps = {};
    this.subs = [];
    this.opts = opts;
    this.reconnection(opts.reconnection !== false);
    this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
    this.reconnectionDelay(opts.reconnectionDelay || 1000);
    this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
    this.randomizationFactor(opts.randomizationFactor || 0.5);
    this.backoff = new backo2({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    });
    this.timeout(null == opts.timeout ? 20000 : opts.timeout);
    this.readyState = 'closed';
    this.uri = uri;
    this.connecting = [];
    this.lastPing = null;
    this.encoding = false;
    this.packetBuffer = [];
    var _parser = opts.parser || socket_ioParser;
    this.encoder = new _parser.Encoder();
    this.decoder = new _parser.Decoder();
    this.autoConnect = opts.autoConnect !== false;
    if (this.autoConnect) this.open();
  }

  /**
   * Propagate given event to sockets and emit on `this`
   *
   * @api private
   */

  Manager.prototype.emitAll = function () {
    this.emit.apply(this, arguments);
    for (var nsp in this.nsps) {
      if (has.call(this.nsps, nsp)) {
        this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
      }
    }
  };

  /**
   * Update `socket.id` of all sockets
   *
   * @api private
   */

  Manager.prototype.updateSocketIds = function () {
    for (var nsp in this.nsps) {
      if (has.call(this.nsps, nsp)) {
        this.nsps[nsp].id = this.generateId(nsp);
      }
    }
  };

  /**
   * generate `socket.id` for the given `nsp`
   *
   * @param {String} nsp
   * @return {String}
   * @api private
   */

  Manager.prototype.generateId = function (nsp) {
    return (nsp === '/' ? '' : (nsp + '#')) + this.engine.id;
  };

  /**
   * Mix in `Emitter`.
   */

  componentEmitter(Manager.prototype);

  /**
   * Sets the `reconnection` config.
   *
   * @param {Boolean} true/false if it should automatically reconnect
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnection = function (v) {
    if (!arguments.length) return this._reconnection;
    this._reconnection = !!v;
    return this;
  };

  /**
   * Sets the reconnection attempts config.
   *
   * @param {Number} max reconnection attempts before giving up
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnectionAttempts = function (v) {
    if (!arguments.length) return this._reconnectionAttempts;
    this._reconnectionAttempts = v;
    return this;
  };

  /**
   * Sets the delay between reconnections.
   *
   * @param {Number} delay
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnectionDelay = function (v) {
    if (!arguments.length) return this._reconnectionDelay;
    this._reconnectionDelay = v;
    this.backoff && this.backoff.setMin(v);
    return this;
  };

  Manager.prototype.randomizationFactor = function (v) {
    if (!arguments.length) return this._randomizationFactor;
    this._randomizationFactor = v;
    this.backoff && this.backoff.setJitter(v);
    return this;
  };

  /**
   * Sets the maximum delay between reconnections.
   *
   * @param {Number} delay
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnectionDelayMax = function (v) {
    if (!arguments.length) return this._reconnectionDelayMax;
    this._reconnectionDelayMax = v;
    this.backoff && this.backoff.setMax(v);
    return this;
  };

  /**
   * Sets the connection timeout. `false` to disable
   *
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.timeout = function (v) {
    if (!arguments.length) return this._timeout;
    this._timeout = v;
    return this;
  };

  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @api private
   */

  Manager.prototype.maybeReconnectOnOpen = function () {
    // Only try to reconnect if it's the first time we're connecting
    if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
      // keeps reconnection from firing twice for the same reconnection loop
      this.reconnect();
    }
  };

  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} optional, callback
   * @return {Manager} self
   * @api public
   */

  Manager.prototype.open =
  Manager.prototype.connect = function (fn, opts) {
    debug$8('readyState %s', this.readyState);
    if (~this.readyState.indexOf('open')) return this;

    debug$8('opening %s', this.uri);
    this.engine = lib$1(this.uri, this.opts);
    var socket = this.engine;
    var self = this;
    this.readyState = 'opening';
    this.skipReconnect = false;

    // emit `open`
    var openSub = on_1(socket, 'open', function () {
      self.onopen();
      fn && fn();
    });

    // emit `connect_error`
    var errorSub = on_1(socket, 'error', function (data) {
      debug$8('connect_error');
      self.cleanup();
      self.readyState = 'closed';
      self.emitAll('connect_error', data);
      if (fn) {
        var err = new Error('Connection error');
        err.data = data;
        fn(err);
      } else {
        // Only do this if there is no fn to handle the error
        self.maybeReconnectOnOpen();
      }
    });

    // emit `connect_timeout`
    if (false !== this._timeout) {
      var timeout = this._timeout;
      debug$8('connect attempt will timeout after %d', timeout);

      // set timer
      var timer = setTimeout(function () {
        debug$8('connect attempt timed out after %d', timeout);
        openSub.destroy();
        socket.close();
        socket.emit('error', 'timeout');
        self.emitAll('connect_timeout', timeout);
      }, timeout);

      this.subs.push({
        destroy: function () {
          clearTimeout(timer);
        }
      });
    }

    this.subs.push(openSub);
    this.subs.push(errorSub);

    return this;
  };

  /**
   * Called upon transport open.
   *
   * @api private
   */

  Manager.prototype.onopen = function () {
    debug$8('open');

    // clear old subs
    this.cleanup();

    // mark as open
    this.readyState = 'open';
    this.emit('open');

    // add new subs
    var socket = this.engine;
    this.subs.push(on_1(socket, 'data', componentBind(this, 'ondata')));
    this.subs.push(on_1(socket, 'ping', componentBind(this, 'onping')));
    this.subs.push(on_1(socket, 'pong', componentBind(this, 'onpong')));
    this.subs.push(on_1(socket, 'error', componentBind(this, 'onerror')));
    this.subs.push(on_1(socket, 'close', componentBind(this, 'onclose')));
    this.subs.push(on_1(this.decoder, 'decoded', componentBind(this, 'ondecoded')));
  };

  /**
   * Called upon a ping.
   *
   * @api private
   */

  Manager.prototype.onping = function () {
    this.lastPing = new Date();
    this.emitAll('ping');
  };

  /**
   * Called upon a packet.
   *
   * @api private
   */

  Manager.prototype.onpong = function () {
    this.emitAll('pong', new Date() - this.lastPing);
  };

  /**
   * Called with data.
   *
   * @api private
   */

  Manager.prototype.ondata = function (data) {
    this.decoder.add(data);
  };

  /**
   * Called when parser fully decodes a packet.
   *
   * @api private
   */

  Manager.prototype.ondecoded = function (packet) {
    this.emit('packet', packet);
  };

  /**
   * Called upon socket error.
   *
   * @api private
   */

  Manager.prototype.onerror = function (err) {
    debug$8('error', err);
    this.emitAll('error', err);
  };

  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @api public
   */

  Manager.prototype.socket = function (nsp, opts) {
    var socket = this.nsps[nsp];
    if (!socket) {
      socket = new socket$1(this, nsp, opts);
      this.nsps[nsp] = socket;
      var self = this;
      socket.on('connecting', onConnecting);
      socket.on('connect', function () {
        socket.id = self.generateId(nsp);
      });

      if (this.autoConnect) {
        // manually call here since connecting event is fired before listening
        onConnecting();
      }
    }

    function onConnecting () {
      if (!~indexof(self.connecting, socket)) {
        self.connecting.push(socket);
      }
    }

    return socket;
  };

  /**
   * Called upon a socket close.
   *
   * @param {Socket} socket
   */

  Manager.prototype.destroy = function (socket) {
    var index = indexof(this.connecting, socket);
    if (~index) this.connecting.splice(index, 1);
    if (this.connecting.length) return;

    this.close();
  };

  /**
   * Writes a packet.
   *
   * @param {Object} packet
   * @api private
   */

  Manager.prototype.packet = function (packet) {
    debug$8('writing packet %j', packet);
    var self = this;
    if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

    if (!self.encoding) {
      // encode, then write to engine with result
      self.encoding = true;
      this.encoder.encode(packet, function (encodedPackets) {
        for (var i = 0; i < encodedPackets.length; i++) {
          self.engine.write(encodedPackets[i], packet.options);
        }
        self.encoding = false;
        self.processPacketQueue();
      });
    } else { // add packet to the queue
      self.packetBuffer.push(packet);
    }
  };

  /**
   * If packet buffer is non-empty, begins encoding the
   * next packet in line.
   *
   * @api private
   */

  Manager.prototype.processPacketQueue = function () {
    if (this.packetBuffer.length > 0 && !this.encoding) {
      var pack = this.packetBuffer.shift();
      this.packet(pack);
    }
  };

  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @api private
   */

  Manager.prototype.cleanup = function () {
    debug$8('cleanup');

    var subsLength = this.subs.length;
    for (var i = 0; i < subsLength; i++) {
      var sub = this.subs.shift();
      sub.destroy();
    }

    this.packetBuffer = [];
    this.encoding = false;
    this.lastPing = null;

    this.decoder.destroy();
  };

  /**
   * Close the current socket.
   *
   * @api private
   */

  Manager.prototype.close =
  Manager.prototype.disconnect = function () {
    debug$8('disconnect');
    this.skipReconnect = true;
    this.reconnecting = false;
    if ('opening' === this.readyState) {
      // `onclose` will not fire because
      // an open event never happened
      this.cleanup();
    }
    this.backoff.reset();
    this.readyState = 'closed';
    if (this.engine) this.engine.close();
  };

  /**
   * Called upon engine close.
   *
   * @api private
   */

  Manager.prototype.onclose = function (reason) {
    debug$8('onclose');

    this.cleanup();
    this.backoff.reset();
    this.readyState = 'closed';
    this.emit('close', reason);

    if (this._reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  };

  /**
   * Attempt a reconnection.
   *
   * @api private
   */

  Manager.prototype.reconnect = function () {
    if (this.reconnecting || this.skipReconnect) return this;

    var self = this;

    if (this.backoff.attempts >= this._reconnectionAttempts) {
      debug$8('reconnect failed');
      this.backoff.reset();
      this.emitAll('reconnect_failed');
      this.reconnecting = false;
    } else {
      var delay = this.backoff.duration();
      debug$8('will wait %dms before reconnect attempt', delay);

      this.reconnecting = true;
      var timer = setTimeout(function () {
        if (self.skipReconnect) return;

        debug$8('attempting reconnect');
        self.emitAll('reconnect_attempt', self.backoff.attempts);
        self.emitAll('reconnecting', self.backoff.attempts);

        // check again for the case socket closed in above events
        if (self.skipReconnect) return;

        self.open(function (err) {
          if (err) {
            debug$8('reconnect attempt error');
            self.reconnecting = false;
            self.reconnect();
            self.emitAll('reconnect_error', err.data);
          } else {
            debug$8('reconnect success');
            self.onreconnect();
          }
        });
      }, delay);

      this.subs.push({
        destroy: function () {
          clearTimeout(timer);
        }
      });
    }
  };

  /**
   * Called upon successful reconnect.
   *
   * @api private
   */

  Manager.prototype.onreconnect = function () {
    var attempt = this.backoff.attempts;
    this.reconnecting = false;
    this.backoff.reset();
    this.updateSocketIds();
    this.emitAll('reconnect', attempt);
  };

  var lib$2 = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */




  var debug = browser('socket.io-client');

  /**
   * Module exports.
   */

  module.exports = exports = lookup;

  /**
   * Managers cache.
   */

  var cache = exports.managers = {};

  /**
   * Looks up an existing `Manager` for multiplexing.
   * If the user summons:
   *
   *   `io('http://localhost/a');`
   *   `io('http://localhost/b');`
   *
   * We reuse the existing instance based on same scheme/port/host,
   * and we initialize sockets for each namespace.
   *
   * @api public
   */

  function lookup (uri, opts) {
    if (typeof uri === 'object') {
      opts = uri;
      uri = undefined;
    }

    opts = opts || {};

    var parsed = url_1(uri);
    var source = parsed.source;
    var id = parsed.id;
    var path = parsed.path;
    var sameNamespace = cache[id] && path in cache[id].nsps;
    var newConnection = opts.forceNew || opts['force new connection'] ||
                        false === opts.multiplex || sameNamespace;

    var io;

    if (newConnection) {
      debug('ignoring socket cache for %s', source);
      io = manager(source, opts);
    } else {
      if (!cache[id]) {
        debug('new io instance for %s', source);
        cache[id] = manager(source, opts);
      }
      io = cache[id];
    }
    if (parsed.query && !opts.query) {
      opts.query = parsed.query;
    }
    return io.socket(parsed.path, opts);
  }

  /**
   * Protocol version.
   *
   * @api public
   */

  exports.protocol = socket_ioParser.protocol;

  /**
   * `connect`.
   *
   * @param {String} uri
   * @api public
   */

  exports.connect = lookup;

  /**
   * Expose constructors for standalone build.
   *
   * @api public
   */

  exports.Manager = manager;
  exports.Socket = socket$1;
  });
  var lib_1 = lib$2.managers;
  var lib_2 = lib$2.protocol;
  var lib_3 = lib$2.connect;
  var lib_4 = lib$2.Manager;
  var lib_5 = lib$2.Socket;

  const SIXTY_PER_SEC = 1000 / 60;
  const LOOP_SLOW_THRESH = 0.3;
  const LOOP_SLOW_COUNT = 10;

  /**
   * Scheduler class
   *
   */
  class Scheduler {

      /**
       * schedule a function to be called
       *
       * @param {Object} options the options
       * @param {Function} options.tick the function to be called
       * @param {Number} options.period number of milliseconds between each invocation, not including the function's execution time
       * @param {Number} options.delay number of milliseconds to add when delaying or hurrying the execution
       */
      constructor(options) {
          this.options = Object.assign({
              tick: null,
              period: SIXTY_PER_SEC,
              delay: SIXTY_PER_SEC / 3
          }, options);
          this.nextExecTime = null;
          this.requestedDelay = 0;
          this.delayCounter = 0;

          // mixin for EventEmitter
          let eventEmitter$1 = new eventEmitter();
          this.on = eventEmitter$1.on;
          this.once = eventEmitter$1.once;
          this.removeListener = eventEmitter$1.removeListener;
          this.emit = eventEmitter$1.emit;

      }

      // in same cases, setTimeout is ignored by the browser,
      // this is known to happen during the first 100ms of a touch event
      // on android chrome.  Double-check the game loop using requestAnimationFrame
      nextTickChecker() {
          let currentTime = (new Date()).getTime();
          if (currentTime > this.nextExecTime) {
              this.delayCounter++;
              this.callTick();
              this.nextExecTime = currentTime + this.options.stepPeriod;
          }
          window.requestAnimationFrame(this.nextTickChecker.bind(this));
      }

      nextTick() {
          let stepStartTime = (new Date()).getTime();
          if (stepStartTime > this.nextExecTime + this.options.period * LOOP_SLOW_THRESH) {
              this.delayCounter++;
          } else
              this.delayCounter = 0;

          this.callTick();
          this.nextExecTime = stepStartTime + this.options.period + this.requestedDelay;
          this.requestedDelay = 0;
          setTimeout(this.nextTick.bind(this), this.nextExecTime - (new Date()).getTime());
      }

      callTick() {
          if (this.delayCounter >= LOOP_SLOW_COUNT) {
              this.emit('loopRunningSlow');
              this.delayCounter = 0;
          }
          this.options.tick();
      }

      /**
       * start the schedule
       * @return {Scheduler} returns this scheduler instance
       */
      start() {
          setTimeout(this.nextTick.bind(this));
          if (typeof window === 'object' && typeof window.requestAnimationFrame === 'function')
              window.requestAnimationFrame(this.nextTickChecker.bind(this));
          return this;
      }

      /**
       * delay next execution
       */
      delayTick() {
          this.requestedDelay += this.options.delay;
      }

      /**
       * hurry the next execution
       */
      hurryTick() {
          this.requestedDelay -= this.options.delay;
      }
  }

  class SyncStrategy {

      constructor(clientEngine, inputOptions) {
          this.clientEngine = clientEngine;
          this.gameEngine = clientEngine.gameEngine;
          this.needFirstSync = true;
          this.options = Object.assign({}, inputOptions);
          this.gameEngine.on('client__postStep', this.syncStep.bind(this));
          this.gameEngine.on('client__syncReceived', this.collectSync.bind(this));
          this.requiredSyncs = [];
          this.SYNC_APPLIED = 'SYNC_APPLIED';
          this.STEP_DRIFT_THRESHOLDS = {
              onServerSync: { MAX_LEAD: 1, MAX_LAG: 3 }, // max step lead/lag allowed after every server sync
              onEveryStep: { MAX_LEAD: 7, MAX_LAG: 8 }, // max step lead/lag allowed at every step
              clientReset: 20 // if we are behind this many steps, just reset the step counter
          };
      }

      // collect a sync and its events
      // maintain a "lastSync" member which describes the last sync we received from
      // the server.  the lastSync object contains:
      //  - syncObjects: all events in the sync indexed by the id of the object involved
      //  - syncSteps: all events in the sync indexed by the step on which they occurred
      //  - objCount
      //  - eventCount
      //  - stepCount
      collectSync(e) {

          // on first connect we need to wait for a full world update
          if (this.needFirstSync) {
              if (!e.fullUpdate)
                  return;
          } else {

              // TODO: there is a problem below in the case where the client is 10 steps behind the server,
              // and the syncs that arrive are always in the future and never get processed.  To address this
              // we may need to store more than one sync.

              // ignore syncs which are older than the latest
              if (this.lastSync && this.lastSync.stepCount && this.lastSync.stepCount > e.stepCount)
                  return;
          }

          // before we overwrite the last sync, check if it was a required sync
          // syncs that create or delete objects are saved because they must be applied.
          if (this.lastSync && this.lastSync.required) {
              this.requiredSyncs.push(this.lastSync);
          }

          // build new sync object
          let lastSync = this.lastSync = {
              stepCount: e.stepCount,
              fullUpdate: e.fullUpdate,
              syncObjects: {},
              syncSteps: {}
          };

          e.syncEvents.forEach(sEvent => {
              // keep a reference of events by object id
              if (sEvent.objectInstance) {
                  let objectId = sEvent.objectInstance.id;
                  if (!lastSync.syncObjects[objectId]) lastSync.syncObjects[objectId] = [];
                  lastSync.syncObjects[objectId].push(sEvent);
              }

              // keep a reference of events by step
              let stepCount = sEvent.stepCount;
              let eventName = sEvent.eventName;
              if (eventName === 'objectDestroy' || eventName === 'objectCreate') {
                  lastSync.required = true;
              }
              if (!lastSync.syncSteps[stepCount]) lastSync.syncSteps[stepCount] = {};
              if (!lastSync.syncSteps[stepCount][eventName]) lastSync.syncSteps[stepCount][eventName] = [];
              lastSync.syncSteps[stepCount][eventName].push(sEvent);
          });

          let eventCount = e.syncEvents.length;
          let objCount = (Object.keys(lastSync.syncObjects)).length;
          let stepCount = (Object.keys(lastSync.syncSteps)).length;
          this.gameEngine.trace.debug(() => `sync contains ${objCount} objects ${eventCount} events ${stepCount} steps`);
      }

      // add an object to our world
      addNewObject(objId, newObj, options) {

          let curObj = new newObj.constructor(this.gameEngine, {
              id: objId
          });

          // enforce object implementations of syncTo
          if (!curObj.__proto__.hasOwnProperty('syncTo')) {
              throw `GameObject of type ${curObj.class} does not implement the syncTo() method, which must copy the netscheme`;
          }

          curObj.syncTo(newObj);
          this.gameEngine.addObjectToWorld(curObj);
          if (this.clientEngine.options.verbose)
              console.log(`adding new object ${curObj}`);

          return curObj;
      }

      // sync to step, by applying bending, and applying the latest sync
      syncStep(stepDesc) {

          // apply incremental bending
          this.gameEngine.world.forEachObject((id, o) => {
              if (typeof o.applyIncrementalBending === 'function') {
                  o.applyIncrementalBending(stepDesc);
                  o.refreshToPhysics();
              }
          });

          // apply all pending required syncs
          while (this.requiredSyncs.length) {

              let requiredStep = this.requiredSyncs[0].stepCount; 

              // if we haven't reached the corresponding step, it's too soon to apply syncs
              if (requiredStep > this.gameEngine.world.stepCount)
                  return;

              this.gameEngine.trace.trace(() => `applying a required sync ${requiredStep}`);
              this.applySync(this.requiredSyncs.shift(), true);
          }

          // apply the sync and delete it on success
          if (this.lastSync) {
              let rc = this.applySync(this.lastSync, false);
              if (rc === this.SYNC_APPLIED)
                  this.lastSync = null;
          }
      }
  }

  const defaults = {
      clientStepHold: 6,
      localObjBending: 1.0,  // amount of bending towards position of sync object
      remoteObjBending: 1.0, // amount of bending towards position of sync object
      bendingIncrements: 6, // the bending should be applied increments (how many steps for entire bend)
      reflect: false
  };

  class InterpolateStrategy extends SyncStrategy {

      constructor(clientEngine, inputOptions) {

          const options = Object.assign({}, defaults, inputOptions);
          super(clientEngine, options);

          this.gameEngine.ignoreInputs = true; // client side engine ignores inputs
          this.gameEngine.ignorePhysics = true; // client side engine ignores physics
          this.STEP_DRIFT_THRESHOLDS = {
              onServerSync: { MAX_LEAD: -8, MAX_LAG: 16 }, // max step lead/lag allowed after every server sync
              onEveryStep: { MAX_LEAD: -4, MAX_LAG: 24 }, // max step lead/lag allowed at every step
              clientReset: 40 // if we are behind this many steps, just reset the step counter
          };
      }

      // apply a new sync
      applySync(sync, required) {

          // if sync is in the past we cannot interpolate to it
          if (!required && sync.stepCount <= this.gameEngine.world.stepCount) {
              return this.SYNC_APPLIED;
          }

          this.gameEngine.trace.debug(() => 'interpolate applying sync');
          //
          //    scan all the objects in the sync
          //
          // 1. if the object exists locally, sync to the server object
          // 2. if the object is new, just create it
          //
          this.needFirstSync = false;
          let world = this.gameEngine.world;
          for (let ids of Object.keys(sync.syncObjects)) {

              // TODO: we are currently taking only the first event out of
              // the events that may have arrived for this object
              let ev = sync.syncObjects[ids][0];
              let curObj = world.objects[ev.objectInstance.id];

              if (curObj) {

                  // case 1: this object already exists locally
                  this.gameEngine.trace.trace(() => `object before syncTo: ${curObj.toString()}`);
                  curObj.saveState();
                  curObj.syncTo(ev.objectInstance);
                  this.gameEngine.trace.trace(() => `object after syncTo: ${curObj.toString()} synced to step[${ev.stepCount}]`);

              } else {

                  // case 2: object does not exist.  create it now
                  this.addNewObject(ev.objectInstance.id, ev.objectInstance);
              }
          }

          //
          // bend back to original state
          //
          for (let objId of Object.keys(world.objects)) {

              let obj = world.objects[objId];
              let isLocal = (obj.playerId == this.gameEngine.playerId); // eslint-disable-line eqeqeq
              let bending = isLocal ? this.options.localObjBending : this.options.remoteObjBending;
              obj.bendToCurrentState(bending, this.gameEngine.worldSettings, isLocal, this.options.bendingIncrements);
              if (typeof obj.refreshRenderObject === 'function')
                  obj.refreshRenderObject();
              this.gameEngine.trace.trace(() => `object[${objId}] ${obj.bendingToString()}`);
          }

          // destroy objects
          // TODO: use world.forEachObject((id, ob) => {});
          // TODO: identical code is in InterpolateStrategy
          for (let objId of Object.keys(world.objects)) {

              let objEvents = sync.syncObjects[objId];

              // if this was a full sync, and we did not get a corresponding object,
              // remove the local object
              if (sync.fullUpdate && !objEvents && objId < this.gameEngine.options.clientIDSpace) {
                  this.gameEngine.removeObjectFromWorld(objId);
                  continue;
              }

              if (!objEvents || objId >= this.gameEngine.options.clientIDSpace)
                  continue;

              // if we got an objectDestroy event, destroy the object
              objEvents.forEach((e) => {
                  if (e.eventName === 'objectDestroy') this.gameEngine.removeObjectFromWorld(objId);
              });
          }

          return this.SYNC_APPLIED;
      }
  }

  const defaults$1 = {
      syncsBufferLength: 5,
      maxReEnactSteps: 60,   // maximum number of steps to re-enact
      RTTEstimate: 2,        // estimate the RTT as two steps (for updateRate=6, that's 200ms)
      extrapolate: 2,        // player performs method "X" which means extrapolate to match server time. that 100 + (0..100)
      localObjBending: 0.1,  // amount of bending towards position of sync object
      remoteObjBending: 0.6, // amount of bending towards position of sync object
      bendingIncrements: 10   // the bending should be applied increments (how many steps for entire bend)
  };

  class ExtrapolateStrategy extends SyncStrategy {

      constructor(clientEngine, inputOptions) {

          const options = Object.assign({}, defaults$1, inputOptions);
          super(clientEngine, options);

          this.lastSync = null;
          this.recentInputs = {};
          this.gameEngine.on('client__processInput', this.clientInputSave.bind(this));
          this.STEP_DRIFT_THRESHOLDS = {
              onServerSync: { MAX_LEAD: 2, MAX_LAG: 3 }, // max step lead/lag allowed after every server sync
              onEveryStep: { MAX_LEAD: 7, MAX_LAG: 4 }, // max step lead/lag allowed at every step
              clientReset: 40 // if we are behind this many steps, just reset the step counter
          };
      }

      // keep a buffer of inputs so that we can replay them on extrapolation
      clientInputSave(inputEvent) {

          // if no inputs have been stored for this step, create an array
          if (!this.recentInputs[inputEvent.input.step]) {
              this.recentInputs[inputEvent.input.step] = [];
          }
          this.recentInputs[inputEvent.input.step].push(inputEvent.input);
      }

      // clean up the input buffer
      cleanRecentInputs(lastServerStep) {
          for (let input of Object.keys(this.recentInputs)) {
              if (this.recentInputs[input][0].step <= lastServerStep) {
                  delete this.recentInputs[input];
              }
          }
      }

      // apply a new sync
      applySync(sync, required) {

          // if sync is in the future, we are not ready to apply yet.
          if (!required && sync.stepCount > this.gameEngine.world.stepCount) {
              return null;
          }

          this.gameEngine.trace.debug(() => 'extrapolate applying sync');

          //
          //    scan all the objects in the sync
          //
          // 1. if the object has a local shadow, adopt the server object,
          //    and destroy the shadow
          //
          // 2. if the object exists locally, sync to the server object,
          //    later we will re-enact the missing steps and then bend to
          //    the current position
          //
          // 3. if the object is new, just create it
          //
          this.needFirstSync = false;
          let world = this.gameEngine.world;
          let serverStep = sync.stepCount;
          for (let ids of Object.keys(sync.syncObjects)) {

              // TODO: we are currently taking only the first event out of
              // the events that may have arrived for this object
              let ev = sync.syncObjects[ids][0];
              let curObj = world.objects[ev.objectInstance.id];

              let localShadowObj = this.gameEngine.findLocalShadow(ev.objectInstance);
              if (localShadowObj) {
                  // case 1: this object has a local shadow object on the client
                  this.gameEngine.trace.debug(() => `object ${ev.objectInstance.id} replacing local shadow ${localShadowObj.id}`);

                  if (!world.objects.hasOwnProperty(ev.objectInstance.id)) {
                      let newObj = this.addNewObject(ev.objectInstance.id, ev.objectInstance, { visible: false });
                      newObj.saveState(localShadowObj);
                  }
                  this.gameEngine.removeObjectFromWorld(localShadowObj.id);

              } else if (curObj) {

                  // case 2: this object already exists locally
                  this.gameEngine.trace.trace(() => `object before syncTo: ${curObj.toString()}`);
                  curObj.saveState();
                  curObj.syncTo(ev.objectInstance);
                  this.gameEngine.trace.trace(() => `object after syncTo: ${curObj.toString()} synced to step[${ev.stepCount}]`);

              } else {

                  // case 3: object does not exist.  create it now
                  this.addNewObject(ev.objectInstance.id, ev.objectInstance);
              }
          }

          //
          // reenact the steps that we want to extrapolate forwards
          //
          this.gameEngine.trace.debug(() => `extrapolate re-enacting steps from [${serverStep}] to [${world.stepCount}]`);
          if (serverStep < world.stepCount - this.options.maxReEnactSteps) {
              serverStep = world.stepCount - this.options.maxReEnactSteps;
              this.gameEngine.trace.info(() => `too many steps to re-enact.  Starting from [${serverStep}] to [${world.stepCount}]`);
          }

          let clientStep = world.stepCount;
          for (world.stepCount = serverStep; world.stepCount < clientStep;) {

              if (this.recentInputs[world.stepCount]) {
                  this.recentInputs[world.stepCount].forEach(inputDesc => {

                      // only movement inputs are re-enacted
                      if (!inputDesc.options || !inputDesc.options.movement) return;

                      this.gameEngine.trace.trace(() => `extrapolate re-enacting movement input[${inputDesc.messageIndex}]: ${inputDesc.input}`);
                      this.gameEngine.processInput(inputDesc, this.gameEngine.playerId);
                  });
              }

              // run the game engine step in "reenact" mode
              this.gameEngine.step(true);
          }
          this.cleanRecentInputs(serverStep);

          //
          // bend back to original state
          //
          for (let objId of Object.keys(world.objects)) {

              // shadow objects are not bent
              if (objId >= this.gameEngine.options.clientIDSpace)
                  continue;

              // TODO: using == instead of === because of string/number mismatch
              //       These values should always be strings (which contain a number)
              //       Reminder: the reason we use a string is that these
              //       values are sometimes used as object keys
              let obj = world.objects[objId];
              let isLocal = (obj.playerId == this.gameEngine.playerId); // eslint-disable-line eqeqeq
              let bending = isLocal ? this.options.localObjBending : this.options.remoteObjBending;
              obj.bendToCurrentState(bending, this.gameEngine.worldSettings, isLocal, this.options.bendingIncrements);
              if (typeof obj.refreshRenderObject === 'function')
                  obj.refreshRenderObject();
              this.gameEngine.trace.trace(() => `object[${objId}] ${obj.bendingToString()}`);
          }

          // trace object state after sync
          for (let objId of Object.keys(world.objects)) {
              this.gameEngine.trace.trace(() => `object after extrapolate replay: ${world.objects[objId].toString()}`);
          }

          // destroy objects
          // TODO: use world.forEachObject((id, ob) => {});
          // TODO: identical code is in InterpolateStrategy
          for (let objId of Object.keys(world.objects)) {

              let objEvents = sync.syncObjects[objId];

              // if this was a full sync, and we did not get a corresponding object,
              // remove the local object
              if (sync.fullUpdate && !objEvents && objId < this.gameEngine.options.clientIDSpace) {
                  this.gameEngine.removeObjectFromWorld(objId);
                  continue;
              }

              if (!objEvents || objId >= this.gameEngine.options.clientIDSpace)
                  continue;

              // if we got an objectDestroy event, destroy the object
              objEvents.forEach((e) => {
                  if (e.eventName === 'objectDestroy') this.gameEngine.removeObjectFromWorld(objId);
              });
          }

          return this.SYNC_APPLIED;
      }

  }

  const defaults$2 = {
      worldBufferLength: 60,
      clientStepLag: 0
  };

  class FrameSyncStrategy extends SyncStrategy {

      constructor(clientEngine, inputOptions) {

          const options = Object.assign({}, defaults$2, inputOptions);
          super(clientEngine, options);

          this.gameEngine = this.clientEngine.gameEngine;
      }

      // apply a new sync
      applySync(sync, required) {

          this.needFirstSync = false;
          this.gameEngine.trace.debug(() => 'framySync applying sync');
          let world = this.gameEngine.world;

          for (let ids of Object.keys(sync.syncObjects)) {
              let ev = sync.syncObjects[ids][0];
              let curObj = world.objects[ev.objectInstance.id];
              if (curObj) {
                  curObj.syncTo(ev.objectInstance);
              } else {
                  this.addNewObject(ev.objectInstance.id, ev.objectInstance);
              }
          }

          // destroy objects
          for (let objId of Object.keys(world.objects)) {

              let objEvents = sync.syncObjects[objId];

              // if this was a full sync, and we did not get a corresponding object,
              // remove the local object
              if (sync.fullUpdate && !objEvents && objId < this.gameEngine.options.clientIDSpace) {
                  this.gameEngine.removeObjectFromWorld(objId);
                  continue;
              }

              if (!objEvents || objId >= this.gameEngine.options.clientIDSpace)
                  continue;

              // if we got an objectDestroy event, destroy the object
              objEvents.forEach((e) => {
                  if (e.eventName === 'objectDestroy') this.gameEngine.removeObjectFromWorld(objId);
              });
          }

          return this.SYNC_APPLIED;
      }

  }

  const strategies = {
      extrapolate: ExtrapolateStrategy,
      interpolate: InterpolateStrategy,
      frameSync: FrameSyncStrategy
  };

  class Synchronizer {
      // create a synchronizer instance
      constructor(clientEngine, options) {
          this.clientEngine = clientEngine;
          this.options = options || {};
          if (!strategies.hasOwnProperty(this.options.sync)) {
              throw new Error(`ERROR: unknown synchronzation strategy ${this.options.sync}`);
          }
          this.syncStrategy = new strategies[this.options.sync](this.clientEngine, this.options);
      }
  }

  const MAX_UINT_16 = 0xFFFF;

  /**
   * The Serializer is responsible for serializing the game world and its
   * objects on the server, before they are sent to each client.  On the client side the
   * Serializer deserializes these objects.
   *
   */
  class Serializer {

      constructor() {
          this.registeredClasses = {};
          this.customTypes = {};
          this.registerClass(TwoVector);
          this.registerClass(ThreeVector);
          this.registerClass(Quaternion);
      }

      /**
       * Adds a custom primitive to the serializer instance.
       * This will enable you to use it in an object's netScheme
       * @param customType
       */
      // TODO: the function below is not used, and it is not clear what that
      // first argument is supposed to be
      addCustomType(customType) {
          this.customTypes[customType.type] = customType;
      }

      /**
       * Checks if type can be assigned by value.
       * @param {String} type Type to Checks
       * @return {Boolean} True if type can be assigned
       */
      static typeCanAssign(type) {
          return type !== BaseTypes.TYPES.CLASSINSTANCE && type !== BaseTypes.TYPES.LIST;
      }

      /**
       * Registers a new class with the serializer, so it may be deserialized later
       * @param {Function} classObj reference to the class (not an instance!)
       * @param {String} classId Unit specifying a class ID
       */
      registerClass(classObj, classId) {
          // if no classId is specified, hash one from the class name
          classId = classId ? classId : Utils.hashStr(classObj.name);
          if (this.registeredClasses[classId]) {
              console.error(`Serializer: accidental override of classId ${classId} when registering class`, classObj);
          }

          this.registeredClasses[classId] = classObj;
      }

      deserialize(dataBuffer, byteOffset) {
          byteOffset = byteOffset ? byteOffset : 0;
          let localByteOffset = 0;

          let dataView = new DataView(dataBuffer);

          let objectClassId = dataView.getUint8(byteOffset + localByteOffset);

          // todo if classId is 0 - take care of dynamic serialization.
          let objectClass = this.registeredClasses[objectClassId];
          if (objectClass == null) {
              console.error('Serializer: Found a class which was not registered.  Please use serializer.registerClass() to register all serialized classes.');
          }

          localByteOffset += Uint8Array.BYTES_PER_ELEMENT; // advance the byteOffset after the classId

          // create de-referenced instance of the class. gameEngine and id will be 'tacked on' later at the sync strategies
          let obj = new objectClass(null, { id: null });
          for (let property of Object.keys(objectClass.netScheme).sort()) {
              let read = this.readDataView(dataView, byteOffset + localByteOffset, objectClass.netScheme[property]);
              obj[property] = read.data;
              localByteOffset += read.bufferSize;
          }

          return { obj, byteOffset: localByteOffset };
      }

      writeDataView(dataView, value, bufferOffset, netSchemProp) {
          if (netSchemProp.type === BaseTypes.TYPES.FLOAT32) {
              dataView.setFloat32(bufferOffset, value);
          } else if (netSchemProp.type === BaseTypes.TYPES.INT32) {
              dataView.setInt32(bufferOffset, value);
          } else if (netSchemProp.type === BaseTypes.TYPES.INT16) {
              dataView.setInt16(bufferOffset, value);
          } else if (netSchemProp.type === BaseTypes.TYPES.INT8) {
              dataView.setInt8(bufferOffset, value);
          } else if (netSchemProp.type === BaseTypes.TYPES.UINT8) {
              dataView.setUint8(bufferOffset, value);
          } else if (netSchemProp.type === BaseTypes.TYPES.STRING) {

              //   MAX_UINT_16 is a reserved (length) value which indicates string hasn't changed
              if (value === null) {
                  dataView.setUint16(bufferOffset, MAX_UINT_16);
              } else {
                  let strLen = value.length;
                  dataView.setUint16(bufferOffset, strLen);
                  let localBufferOffset = 2;
                  for (let i = 0; i < strLen; i++)
                      dataView.setUint16(bufferOffset + localBufferOffset + i * 2, value.charCodeAt(i));
              }
          } else if (netSchemProp.type === BaseTypes.TYPES.CLASSINSTANCE) {
              value.serialize(this, {
                  dataBuffer: dataView.buffer,
                  bufferOffset: bufferOffset
              });
          } else if (netSchemProp.type === BaseTypes.TYPES.LIST) {
              let localBufferOffset = 0;

              // a list is comprised of the number of items followed by the items
              dataView.setUint16(bufferOffset + localBufferOffset, value.length);
              localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;

              for (let item of value) {
                  // TODO: inelegant, currently doesn't support list of lists
                  if (netSchemProp.itemType === BaseTypes.TYPES.CLASSINSTANCE) {
                      let serializedObj = item.serialize(this, {
                          dataBuffer: dataView.buffer,
                          bufferOffset: bufferOffset + localBufferOffset
                      });
                      localBufferOffset += serializedObj.bufferOffset;
                  } else if (netSchemProp.itemType === BaseTypes.TYPES.STRING) {
                      //   MAX_UINT_16 is a reserved (length) value which indicates string hasn't changed
                      if (item === null) {
                          dataView.setUint16(bufferOffset + localBufferOffset, MAX_UINT_16);
                          localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
                      } else {
                          let strLen = item.length;
                          dataView.setUint16(bufferOffset + localBufferOffset, strLen);
                          localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
                          for (let i = 0; i < strLen; i++)
                              dataView.setUint16(bufferOffset + localBufferOffset + i * 2, item.charCodeAt(i));
                          localBufferOffset += Uint16Array.BYTES_PER_ELEMENT * strLen;
                      }
                  } else {
                      this.writeDataView(dataView, item, bufferOffset + localBufferOffset, { type: netSchemProp.itemType });
                      localBufferOffset += this.getTypeByteSize(netSchemProp.itemType);
                  }
              }
          } else if (this.customTypes[netSchemProp.type]) {
              // this is a custom data property which needs to define its own write method
              this.customTypes[netSchemProp.type].writeDataView(dataView, value, bufferOffset);
          } else {
              console.error(`No custom property ${netSchemProp.type} found!`);
          }

      }

      readDataView(dataView, bufferOffset, netSchemProp) {
          let data, bufferSize;

          if (netSchemProp.type === BaseTypes.TYPES.FLOAT32) {
              data = dataView.getFloat32(bufferOffset);
              bufferSize = this.getTypeByteSize(netSchemProp.type);
          } else if (netSchemProp.type === BaseTypes.TYPES.INT32) {
              data = dataView.getInt32(bufferOffset);
              bufferSize = this.getTypeByteSize(netSchemProp.type);
          } else if (netSchemProp.type === BaseTypes.TYPES.INT16) {
              data = dataView.getInt16(bufferOffset);
              bufferSize = this.getTypeByteSize(netSchemProp.type);
          } else if (netSchemProp.type === BaseTypes.TYPES.INT8) {
              data = dataView.getInt8(bufferOffset);
              bufferSize = this.getTypeByteSize(netSchemProp.type);
          } else if (netSchemProp.type === BaseTypes.TYPES.UINT8) {
              data = dataView.getUint8(bufferOffset);
              bufferSize = this.getTypeByteSize(netSchemProp.type);
          } else if (netSchemProp.type === BaseTypes.TYPES.STRING) {
              let length = dataView.getUint16(bufferOffset);
              let localBufferOffset = Uint16Array.BYTES_PER_ELEMENT;
              bufferSize = localBufferOffset;
              if (length === MAX_UINT_16) {
                  data = null;
              } else {
                  let a = [];
                  for (let i = 0; i < length; i++)
                      a[i] = dataView.getUint16(bufferOffset + localBufferOffset + i * 2);
                  data = String.fromCharCode.apply(null, a);
                  bufferSize += length * Uint16Array.BYTES_PER_ELEMENT;
              }
          } else if (netSchemProp.type === BaseTypes.TYPES.CLASSINSTANCE) {
              var deserializeData = this.deserialize(dataView.buffer, bufferOffset);
              data = deserializeData.obj;
              bufferSize = deserializeData.byteOffset;
          } else if (netSchemProp.type === BaseTypes.TYPES.LIST) {
              let localBufferOffset = 0;

              let items = [];
              let itemCount = dataView.getUint16(bufferOffset + localBufferOffset);
              localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;

              for (let x = 0; x < itemCount; x++) {
                  let read = this.readDataView(dataView, bufferOffset + localBufferOffset, { type: netSchemProp.itemType });
                  items.push(read.data);
                  localBufferOffset += read.bufferSize;
              }

              data = items;
              bufferSize = localBufferOffset;
          } else if (this.customTypes[netSchemProp.type] != null) {
              // this is a custom data property which needs to define its own read method
              data = this.customTypes[netSchemProp.type].readDataView(dataView, bufferOffset);
          } else {
              console.error(`No custom property ${netSchemProp.type} found!`);
          }

          return { data: data, bufferSize: bufferSize };
      }

      getTypeByteSize(type) {

          switch (type) {
          case BaseTypes.TYPES.FLOAT32: {
              return Float32Array.BYTES_PER_ELEMENT;
          }
          case BaseTypes.TYPES.INT32: {
              return Int32Array.BYTES_PER_ELEMENT;
          }
          case BaseTypes.TYPES.INT16: {
              return Int16Array.BYTES_PER_ELEMENT;
          }
          case BaseTypes.TYPES.INT8: {
              return Int8Array.BYTES_PER_ELEMENT;
          }
          case BaseTypes.TYPES.UINT8: {
              return Uint8Array.BYTES_PER_ELEMENT;
          }

          // not one of the basic properties
          default: {
              if (type === undefined) {
                  throw 'netScheme property declared without type attribute!';
              } else if (this.customTypes[type] === null) {
                  throw `netScheme property ${type} undefined! Did you forget to add it to the serializer?`;
              } else {
                  return this.customTypes[type].BYTES_PER_ELEMENT;
              }
          }

          }

      }
  }

  /**
   * Measures network performance between the client and the server
   * Represents both the client and server portions of NetworkMonitor
   */
  class NetworkMonitor {

      constructor(server) {

          // server-side keep game name
          if (server) {
              this.server = server;
              this.gameName = Object.getPrototypeOf(server.gameEngine).constructor.name;
          }

          // mixin for EventEmitter
          let eventEmitter$1 = new eventEmitter();
          this.on = eventEmitter$1.on;
          this.once = eventEmitter$1.once;
          this.removeListener = eventEmitter$1.removeListener;
          this.emit = eventEmitter$1.emit;
      }

      // client
      registerClient(clientEngine) {
          this.queryIdCounter = 0;
          this.RTTQueries = {};

          this.movingRTTAverage = 0;
          this.movingRTTAverageFrame = [];
          this.movingFPSAverageSize = clientEngine.options.healthCheckRTTSample;
          this.clientEngine = clientEngine;
          clientEngine.socket.on('RTTResponse', this.onReceivedRTTQuery.bind(this));
          setInterval(this.sendRTTQuery.bind(this), clientEngine.options.healthCheckInterval);
      }

      sendRTTQuery() {
          // todo implement cleanup of older timestamp
          this.RTTQueries[this.queryIdCounter] = new Date().getTime();
          this.clientEngine.socket.emit('RTTQuery', this.queryIdCounter);
          this.queryIdCounter++;
      }

      onReceivedRTTQuery(queryId) {
          let RTT = (new Date().getTime()) - this.RTTQueries[queryId];

          this.movingRTTAverageFrame.push(RTT);
          if (this.movingRTTAverageFrame.length > this.movingFPSAverageSize) {
              this.movingRTTAverageFrame.shift();
          }
          this.movingRTTAverage = this.movingRTTAverageFrame.reduce((a, b) => a + b) / this.movingRTTAverageFrame.length;
          this.emit('RTTUpdate', {
              RTT: RTT,
              RTTAverage: this.movingRTTAverage
          });
      }

      // server
      registerPlayerOnServer(socket) {
          socket.on('RTTQuery', this.respondToRTTQuery.bind(this, socket));
          if (this.server && this.server.options.countConnections) {
              http.get(`http://ping.games-eu.lance.gg:2000/${this.gameName}`).on('error', () => {});
          }
      }

      respondToRTTQuery(socket, queryId) {
          socket.emit('RTTResponse', queryId);
      }

  }

  class NetworkedEventFactory {

      constructor(serializer, eventName, options) {
          options = Object.assign({}, options);

          this.seriazlier = serializer;
          this.options = options;

          this.eventName = eventName;
          this.netScheme = options.netScheme;

      }

      /**
       * Creates a new networkedEvent
       * @param {Object} payload an object representing the payload to be transferred over the wire
       * @return {Serializable} the new networkedEvent object
       */
      create(payload) {
          let networkedEvent = new Serializable();
          networkedEvent.classId = Utils.hashStr(this.eventName);
          networkedEvent.eventName = this.eventName;

          if (this.netScheme) {
              networkedEvent.netScheme = Object.assign({}, this.netScheme);

              // copy properties from the networkedEvent instance to its ad-hoc netsScheme
              for (let property of Object.keys(this.netScheme)) {
                  networkedEvent[property] = payload[property];
              }

          }

          return networkedEvent;
      }

  }

  /**
   * Defines a collection of NetworkEvents to be transmitted over the wire
   */
  class NetworkedEventCollection extends Serializable {

      static get netScheme() {
          return {
              events: {
                  type: BaseTypes.TYPES.LIST,
                  itemType: BaseTypes.TYPES.CLASSINSTANCE
              },
          };
      }

      constructor(events) {
          super();
          this.events = events || [];
      }

  }

  class NetworkTransmitter {

      constructor(serializer, world) {
          this.serializer = serializer;
          this.world = world;

          this.registeredEvents = [];
          this.networkedEventCollection = {};

          this.serializer.registerClass(NetworkedEventCollection);

          this.registerNetworkedEventFactory('objectUpdate', {
              netScheme: {
                  stepCount: { type: BaseTypes.TYPES.INT32 },
                  objectInstance: { type: BaseTypes.TYPES.CLASSINSTANCE }
              }
          });

          this.registerNetworkedEventFactory('objectCreate', {
              netScheme: {
                  stepCount: { type: BaseTypes.TYPES.INT32 },
                  objectInstance: { type: BaseTypes.TYPES.CLASSINSTANCE }
              }
          });

          this.registerNetworkedEventFactory('objectDestroy', {
              netScheme: {
                  stepCount: { type: BaseTypes.TYPES.INT32 },
                  objectInstance: { type: BaseTypes.TYPES.CLASSINSTANCE }
              }
          });

          this.registerNetworkedEventFactory('syncHeader', {
              netScheme: {
                  stepCount: { type: BaseTypes.TYPES.INT32 },
                  fullUpdate: { type: BaseTypes.TYPES.UINT8 }
              }
          });

          world.onAddGroup = (name) => {
              this.networkedEventCollection[name] = new NetworkedEventCollection();
          };

          world.onRemoveGroup = (name) => {
              delete this.networkedEventCollection[name];
          };
      }

      registerNetworkedEventFactory(eventName, options) {
          options = Object.assign({}, options);

          let classHash = Utils.hashStr(eventName);

          let networkedEventPrototype = function() {};
          networkedEventPrototype.prototype.classId = classHash;
          networkedEventPrototype.prototype.eventName = eventName;
          networkedEventPrototype.netScheme = options.netScheme;

          this.serializer.registerClass(networkedEventPrototype, classHash);

          this.registeredEvents[eventName] = new NetworkedEventFactory(this.serializer, eventName, options);
      }

      addNetworkedEvent(roomName, eventName, payload) {
          if (!this.registeredEvents[eventName]) {
              console.error(`NetworkTransmitter: no such event ${eventName}`);
              return null;
          }
          if (!this.networkedEventCollection[roomName]) {
              return null
          }

          let stagedNetworkedEvent = this.registeredEvents[eventName].create(payload);
          this.networkedEventCollection[roomName].events.push(stagedNetworkedEvent);
          return stagedNetworkedEvent;
      }

      serializePayload(roomName) {
          if (!this.networkedEventCollection[roomName]) {
              return null
          }
          if (this.networkedEventCollection[roomName].events.length === 0)
              return null;

          let dataBuffer = this.networkedEventCollection[roomName].serialize(this.serializer);

          return dataBuffer;
      }

      deserializePayload(payload) {
          return this.serializer.deserialize(payload.dataBuffer).obj;
      }

      clearPayload(roomName) {
          this.networkedEventCollection[roomName].events = [];
      }

  }

  // TODO: the GAME_UPS below should be common to the value implemented in the server engine,
  // or better yet, it should be configurable in the GameEngine instead of ServerEngine+ClientEngine
  const GAME_UPS = 60; // default number of game steps per second
  const STEP_DELAY_MSEC = 12; // if forward drift detected, delay next execution by this amount
  const STEP_HURRY_MSEC = 8; // if backward drift detected, hurry next execution by this amount

  /**
   * The client engine is the singleton which manages the client-side
   * process, starting the game engine, listening to network messages,
   * starting client steps, and handling world updates which arrive from
   * the server.
   * Normally, a game will implement its own sub-class of ClientEngine, and may
   * override the constructor {@link ClientEngine#constructor} and the methods
   * {@link ClientEngine#start} and {@link ClientEngine#connect}
   */
  class ClientEngine {

      /**
        * Create a client engine instance.
        *
        * @param {GameEngine} gameEngine - a game engine
        * @param {Object} inputOptions - options object
        * @param {Boolean} inputOptions.verbose - print logs to console
        * @param {Boolean} inputOptions.autoConnect - if true, the client will automatically attempt connect to server.
        * @param {Boolean} inputOptions.standaloneMode - if true, the client will never try to connect to a server
        * @param {Number} inputOptions.delayInputCount - if set, inputs will be delayed by this many steps before they are actually applied on the client.
        * @param {Number} inputOptions.healthCheckInterval - health check message interval (millisec). Default is 1000.
        * @param {Number} inputOptions.healthCheckRTTSample - health check RTT calculation sample size. Default is 10.
        * @param {String} inputOptions.scheduler - When set to "render-schedule" the game step scheduling is controlled by the renderer and step time is variable.  When set to "fixed" the game step is run independently with a fixed step time. Default is "render-schedule".
        * @param {Object} inputOptions.syncOptions - an object describing the synchronization method. If not set, will be set to extrapolate, with local object bending set to 0.0 and remote object bending set to 0.6. If the query-string parameter "sync" is defined, then that value is passed to this object's sync attribute.
        * @param {String} inputOptions.syncOptions.sync - chosen sync option, can be "interpolate", "extrapolate", or "frameSync"
        * @param {Number} inputOptions.syncOptions.localObjBending - amount (0 to 1.0) of bending towards original client position, after each sync, for local objects
        * @param {Number} inputOptions.syncOptions.remoteObjBending - amount (0 to 1.0) of bending towards original client position, after each sync, for remote objects
        * @param {String} inputOptions.serverURL - Socket server url
        * @param {Renderer} Renderer - the Renderer class constructor
        */
      constructor(gameEngine, io, inputOptions, Renderer) {

          this.options = Object.assign({
              autoConnect: true,
              healthCheckInterval: 1000,
              healthCheckRTTSample: 10,
              stepPeriod: 1000 / GAME_UPS,
              scheduler: 'render-schedule',
              serverURL: null,
              showLatency: false
          }, inputOptions);

          this.io = io || lib$2;

          /**
           * reference to serializer
           * @member {Serializer}
           */
          this.serializer = new Serializer();

          /**
           * reference to game engine
           * @member {GameEngine}
           */
          this.gameEngine = gameEngine;
          this.gameEngine.registerClasses(this.serializer);
          this.networkMonitor = new NetworkMonitor();

          this.inboundMessages = [];
          this.outboundMessages = [];

          // create the renderer
          this.renderer = this.gameEngine.renderer = new Renderer(gameEngine, this);

          // step scheduler
          this.scheduler = null;
          this.lastStepTime = 0;
          this.correction = 0;

          if (this.options.standaloneMode !== true) {
              this.configureSynchronization();
          }

          // create a buffer of delayed inputs (fifo)
          if (inputOptions && inputOptions.delayInputCount) {
              this.delayedInputs = [];
              for (let i = 0; i < inputOptions.delayInputCount; i++)
                  this.delayedInputs[i] = [];
          }

          this.gameEngine.emit('client__init');
      }

      // configure the Synchronizer singleton
      configureSynchronization() {

          // the reflect syncronizer is just interpolate strategy,
          // configured to show server syncs
          let syncOptions = this.options.syncOptions;
          if (syncOptions.sync === 'reflect') {
              syncOptions.sync = 'interpolate';
              syncOptions.reflect = true;
          }

          this.synchronizer = new Synchronizer(this, syncOptions);
      }

      /**
       * Makes a connection to the game server.  Extend this method if you want to add additional
       * logic on every connection. Call the super-class connect first, and return a promise which
       * executes when the super-class promise completes.
       *
       * @param {Object} [options] additional socket.io options
       * @return {Promise} Resolved when the connection is made to the server
       */
      connect(options = {}) {

          let connectSocket = matchMakerAnswer => {
              return new Promise((resolve, reject) => {

                  const standaloneMode = typeof this.io != 'function';

                  if (matchMakerAnswer.status !== 'ok')
                      reject('matchMaker failed status: ' + matchMakerAnswer.status);

                  if (this.options.verbose)
                      console.log(`connecting to game server ${matchMakerAnswer.serverURL}`);

                  if (!standaloneMode) {
                      this.socket = this.io(matchMakerAnswer.serverURL, options);
                  }
                  else {
                      this.socket = this.io.connection();
                  }
   
                  this.networkMonitor.registerClient(this);

                  this.socket.once('connect', () => {
                      if (this.options.verbose)
                          console.log('connection made');
                      resolve();
                  });

                  this.socket.once('error', (error) => {
                      reject(error);
                  });

                  this.socket.on('playerJoined', (playerData) => {
                      this.gameEngine.playerId = playerData.playerId;
                      this.messageIndex = this.gameEngine.playerId;
                  });

                  this.socket.on('worldUpdate', (worldData) => {
                      this.inboundMessages.push(worldData);
                  });

                  this.socket.on('roomUpdate', (roomData) => {
                      this.gameEngine.emit('client__roomUpdate', roomData);
                  });

                  let startTime;

                  if (this.options.showLatency) {
                      setInterval(() => {
                          startTime = Date.now();
                          this.socket.emit('_ping');
                      }, 2000);
                  }
              
                  this.socket.on('_pong', () => {
                      const latency = Date.now() - startTime;
                      if (this.onLatency) this.onLatency(latency);
                  });

                  if (standaloneMode) {
                      resolve();
                  }
              });
          };

          let matchmaker = Promise.resolve({ serverURL: this.options.serverURL, status: 'ok' });
          if (this.options.matchmaker)
              matchmaker = Utils.httpGetPromise(this.options.matchmaker);

          return matchmaker.then(connectSocket);
      }

      /**
       * Start the client engine, setting up the game loop, rendering loop and renderer.
       *
       * @return {Promise} Resolves once the Renderer has been initialized, and the game is
       * ready to connect
       */
      start() {
          this.stopped = false;
          this.resolved = false;
          // initialize the renderer
          // the render loop waits for next animation frame
          if (!this.renderer) alert('ERROR: game has not defined a renderer');
          let renderLoop = (timestamp) => {
              if (this.stopped) {
                  this.renderer.stop();
                  return;
              }
              this.lastTimestamp = this.lastTimestamp || timestamp;
              this.renderer.draw(timestamp, timestamp - this.lastTimestamp);
              this.lastTimestamp = timestamp;
              window.requestAnimationFrame(renderLoop);
          };

          return this.renderer.init().then(() => {
              this.gameEngine.start();
              this.networkTransmitter = new NetworkTransmitter(this.serializer, this.gameEngine.world);
              if (this.options.scheduler === 'fixed') {
                  // schedule and start the game loop
                  this.scheduler = new Scheduler({
                      period: this.options.stepPeriod,
                      tick: this.step.bind(this),
                      delay: STEP_DELAY_MSEC
                  });
                  this.scheduler.start();
              }

              if (typeof window !== 'undefined')
                  window.requestAnimationFrame(renderLoop);
              if (this.options.autoConnect && this.options.standaloneMode !== true) {
                  return this.connect()
                      .catch((error) => {
                          this.stopped = true;
                          throw error;
                      });
              }
          }).then(() => {
              return new Promise((resolve, reject) => {
                  this.resolveGame = resolve;
                  if (this.socket) {
                      this.socket.on('disconnect', () => {
                          if (!this.resolved && !this.stopped) {
                              if (this.options.verbose)
                                  console.log('disconnected by server...');
                              this.stopped = true;
                              reject();
                          }
                      });
                  }
              });
          });
      }

      /**
       * Disconnect from game server
       */
      disconnect() {
          if (!this.stopped) {
              this.socket.disconnect();
              this.stopped = true;
          }
      }

      // check if client step is too far ahead (leading) or too far
      // behing (lagging) the server step
      checkDrift(checkType) {

          if (!this.gameEngine.highestServerStep)
              return;

          let thresholds = this.synchronizer.syncStrategy.STEP_DRIFT_THRESHOLDS;
          let maxLead = thresholds[checkType].MAX_LEAD;
          let maxLag = thresholds[checkType].MAX_LAG;
          let clientStep = this.gameEngine.world.stepCount;
          let serverStep = this.gameEngine.highestServerStep;
          if (clientStep > serverStep + maxLead) {
              this.gameEngine.trace.warn(() => `step drift ${checkType}. [${clientStep} > ${serverStep} + ${maxLead}] Client is ahead of server.  Delaying next step.`);
              if (this.scheduler) this.scheduler.delayTick();
              this.lastStepTime += STEP_DELAY_MSEC;
              this.correction += STEP_DELAY_MSEC;
          } else if (serverStep > clientStep + maxLag) {
              this.gameEngine.trace.warn(() => `step drift ${checkType}. [${serverStep} > ${clientStep} + ${maxLag}] Client is behind server.  Hurrying next step.`);
              if (this.scheduler) this.scheduler.hurryTick();
              this.lastStepTime -= STEP_HURRY_MSEC;
              this.correction -= STEP_HURRY_MSEC;
          }
      }

      // execute a single game step.  This is normally called by the Renderer
      // at each draw event.
      step(t, dt, physicsOnly) {

          if (!this.resolved) {
              const result = this.gameEngine.getPlayerGameOverResult();
              if (result) {
                  this.resolved = true;
                  this.resolveGame(result);
                  // simulation can continue...
                  // call disconnect to quit
              }
          }

          // physics only case
          if (physicsOnly) {
              this.gameEngine.step(false, t, dt, physicsOnly);
              return;
          }

          // first update the trace state
          this.gameEngine.trace.setStep(this.gameEngine.world.stepCount + 1);

          // skip one step if requested
          if (this.skipOneStep === true) {
              this.skipOneStep = false;
              return;
          }

          this.gameEngine.emit('client__preStep');
          while (this.inboundMessages.length > 0) {
              this.handleInboundMessage(this.inboundMessages.pop());
              this.checkDrift('onServerSync');
          }

          // check for server/client step drift without update
          this.checkDrift('onEveryStep');

          // perform game engine step
          if (this.options.standaloneMode !== true) {
              this.handleOutboundInput();
          }
          this.applyDelayedInputs();
          this.gameEngine.step(false, t, dt);
          this.gameEngine.emit('client__postStep', { dt });

          if (this.options.standaloneMode !== true && this.gameEngine.trace.length && this.socket) {
              // socket might not have been initialized at this point
              this.socket.emit('trace', JSON.stringify(this.gameEngine.trace.rotate()));
          }
      }

      // apply a user input on the client side
      doInputLocal(message) {

          // some synchronization strategies (interpolate) ignore inputs on client side
          if (this.gameEngine.ignoreInputs) {
              return;
          }

          const inputEvent = { input: message.data, playerId: this.gameEngine.playerId };
          this.gameEngine.emit('client__processInput', inputEvent);
          this.gameEngine.emit('processInput', inputEvent);
          this.gameEngine.processInput(message.data, this.gameEngine.playerId, false);
      }

      // apply user inputs which have been queued in order to create
      // an artificial delay
      applyDelayedInputs() {
          if (!this.delayedInputs) {
              return;
          }
          let that = this;
          let delayed = this.delayedInputs.shift();
          if (delayed && delayed.length) {
              delayed.forEach(that.doInputLocal.bind(that));
          }
          this.delayedInputs.push([]);
      }

      /**
       * This function should be called by the client whenever a user input
       * occurs.  This function will emit the input event,
       * forward the input to the client's game engine (with a delay if
       * so configured) and will transmit the input to the server as well.
       *
       * This function can be called by the extended client engine class,
       * typically at the beginning of client-side step processing {@see GameEngine#client__preStep}.
       *
       * @param {String} input - string representing the input
       * @param {Object} inputOptions - options for the input
       */
      sendInput(input, inputOptions) {
          let inputEvent = {
              command: 'move',
              data: {
                  messageIndex: this.messageIndex,
                  step: this.gameEngine.world.stepCount,
                  input: input,
                  options: inputOptions
              }
          };

          this.gameEngine.trace.info(() => `USER INPUT[${this.messageIndex}]: ${input} ${inputOptions ? JSON.stringify(inputOptions) : '{}'}`);

          // if we delay input application on client, then queue it
          // otherwise apply it now
          if (this.delayedInputs) {
              this.delayedInputs[this.delayedInputs.length - 1].push(inputEvent);
          } else {
              this.doInputLocal(inputEvent);
          }

          if (this.options.standaloneMode !== true) {
              this.outboundMessages.push(inputEvent);
          }

          this.messageIndex++;
      }

      // handle a message that has been received from the server
      handleInboundMessage(syncData) {

          let syncEvents = this.networkTransmitter.deserializePayload(syncData).events;
          let syncHeader = syncEvents.find((e) => e.eventName === 'syncHeader');

          // emit that a snapshot has been received
          if (!this.gameEngine.highestServerStep || syncHeader.stepCount > this.gameEngine.highestServerStep)
              this.gameEngine.highestServerStep = syncHeader.stepCount;
          this.gameEngine.emit('client__syncReceived', {
              syncEvents: syncEvents,
              stepCount: syncHeader.stepCount,
              fullUpdate: syncHeader.fullUpdate
          });

          this.gameEngine.trace.info(() => `========== inbound world update ${syncHeader.stepCount} ==========`);

          // finally update the stepCount
          if (syncHeader.stepCount > this.gameEngine.world.stepCount + this.synchronizer.syncStrategy.STEP_DRIFT_THRESHOLDS.clientReset) {
              this.gameEngine.trace.info(() => `========== world step count updated from ${this.gameEngine.world.stepCount} to  ${syncHeader.stepCount} ==========`);
              this.gameEngine.emit('client__stepReset', { oldStep: this.gameEngine.world.stepCount, newStep: syncHeader.stepCount });
              this.gameEngine.world.stepCount = syncHeader.stepCount;
          }
      }

      // emit an input to the authoritative server
      handleOutboundInput() {
          for (var x = 0; x < this.outboundMessages.length; x++) {
              this.socket.emit(this.outboundMessages[x].command, this.outboundMessages[x].data);
          }
          this.outboundMessages = [];
      }

  }

  // based on http://keycode.info/

  // keyboard handling
  const keyCodeTable = {
      3: 'break',
      8: 'backspace', // backspace / delete
      9: 'tab',
      12: 'clear',
      13: 'enter',
      16: 'shift',
      17: 'ctrl',
      18: 'alt',
      19: 'pause/break',
      20: 'caps lock',
      27: 'escape',
      28: 'conversion',
      29: 'non-conversion',
      32: 'space',
      33: 'page up',
      34: 'page down',
      35: 'end',
      36: 'home',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      41: 'select',
      42: 'print',
      43: 'execute',
      44: 'Print Screen',
      45: 'insert',
      46: 'delete',
      48: '0',
      49: '1',
      50: '2',
      51: '3',
      52: '4',
      53: '5',
      54: '6',
      55: '7',
      56: '8',
      57: '9',
      58: ':',
      59: 'semicolon (firefox), equals',
      60: '<',
      61: 'equals (firefox)',
      63: 'ß',
      64: '@',
      65: 'a',
      66: 'b',
      67: 'c',
      68: 'd',
      69: 'e',
      70: 'f',
      71: 'g',
      72: 'h',
      73: 'i',
      74: 'j',
      75: 'k',
      76: 'l',
      77: 'm',
      78: 'n',
      79: 'o',
      80: 'p',
      81: 'q',
      82: 'r',
      83: 's',
      84: 't',
      85: 'u',
      86: 'v',
      87: 'w',
      88: 'x',
      89: 'y',
      90: 'z',
      91: 'Windows Key / Left ⌘ / Chromebook Search key',
      92: 'right window key',
      93: 'Windows Menu / Right ⌘',
      96: 'numpad 0',
      97: 'numpad 1',
      98: 'numpad 2',
      99: 'numpad 3',
      100: 'numpad 4',
      101: 'numpad 5',
      102: 'numpad 6',
      103: 'numpad 7',
      104: 'numpad 8',
      105: 'numpad 9',
      106: 'multiply',
      107: 'add',
      108: 'numpad period (firefox)',
      109: 'subtract',
      110: 'decimal point',
      111: 'divide',
      112: 'f1',
      113: 'f2',
      114: 'f3',
      115: 'f4',
      116: 'f5',
      117: 'f6',
      118: 'f7',
      119: 'f8',
      120: 'f9',
      121: 'f10',
      122: 'f11',
      123: 'f12',
      124: 'f13',
      125: 'f14',
      126: 'f15',
      127: 'f16',
      128: 'f17',
      129: 'f18',
      130: 'f19',
      131: 'f20',
      132: 'f21',
      133: 'f22',
      134: 'f23',
      135: 'f24',
      144: 'num lock',
      145: 'scroll lock',
      160: '^',
      161: '!',
      163: '#',
      164: '$',
      165: 'ù',
      166: 'page backward',
      167: 'page forward',
      169: 'closing paren (AZERTY)',
      170: '*',
      171: '~ + * key',
      173: 'minus (firefox), mute/unmute',
      174: 'decrease volume level',
      175: 'increase volume level',
      176: 'next',
      177: 'previous',
      178: 'stop',
      179: 'play/pause',
      180: 'e-mail',
      181: 'mute/unmute (firefox)',
      182: 'decrease volume level (firefox)',
      183: 'increase volume level (firefox)',
      186: 'semi-colon / ñ',
      187: 'equal sign',
      188: 'comma',
      189: 'dash',
      190: 'period',
      191: 'forward slash / ç',
      192: 'grave accent / ñ / æ',
      193: '?, / or °',
      194: 'numpad period (chrome)',
      219: 'open bracket',
      220: 'back slash',
      221: 'close bracket / å',
      222: 'single quote / ø',
      223: '`',
      224: 'left or right ⌘ key (firefox)',
      225: 'altgr',
      226: '< /git >',
      230: 'GNOME Compose Key',
      231: 'ç',
      233: 'XF86Forward',
      234: 'XF86Back',
      240: 'alphanumeric',
      242: 'hiragana/katakana',
      243: 'half-width/full-width',
      244: 'kanji',
      255: 'toggle touchpad'
  };

  /**
   * This class allows easy usage of device keyboard controls.  Use the method {@link KeyboardControls#bindKey} to
   * generate events whenever a key is pressed.
   *
   * @example
   *    // in the ClientEngine constructor
   *    this.controls = new KeyboardControls(this);
   *    this.controls.bindKey('left', 'left', { repeat: true } );
   *    this.controls.bindKey('right', 'right', { repeat: true } );
   *    this.controls.bindKey('space', 'space');
   *
   */
  class KeyboardControls {

      constructor(clientEngine, eventEmitter) {

          this.clientEngine = clientEngine;
          this.gameEngine = clientEngine.gameEngine;

          this.setupListeners();

          // keep a reference for key press state
          this.keyState = {};

          // a list of bound keys and their corresponding actions
          this.boundKeys = {};

          this.stop = false;
          this.eventEmitter = eventEmitter;

          this.gameEngine.on('client__preStep', () => {
              for (let keyName of Object.keys(this.boundKeys)) {
                  if (this.keyState[keyName] && this.keyState[keyName].isDown) {

                      const { repeat, method } = this.boundKeys[keyName].options;

                      // handle repeat press
                      if (repeat || this.keyState[keyName].count == 0) {

                          // callback to get live parameters if function
                          let parameters = this.boundKeys[keyName].parameters;
                          if (typeof parameters === "function") {
                              parameters = parameters();
                          }

                          // todo movement is probably redundant
                          let inputOptions = Object.assign({
                              movement: true
                          }, parameters || {});

                          if (method) {
                              method(this.boundKeys[keyName]);
                          }
                          else {
                              this.clientEngine.sendInput(this.boundKeys[keyName].actionName, inputOptions);
                          }
              
                          this.keyState[keyName].count++;
                      }
                  }
              }
          });
      }

      setupListeners() {
          document.addEventListener('keydown', (e) => { this.onKeyChange(e, true);});
          document.addEventListener('keyup', (e) => { this.onKeyChange(e, false);});
      }

      /**
       * Bind a keyboard key to a Lance client event.  Each time the key is pressed,
       * an event will be transmitted by the client engine, using {@link ClientEngine#sendInput},
       * and the specified event name.
       *
       * Common key names: up, down, left, right, enter, shift, ctrl, alt,
       * escape, space, page up, page down, end, home, 0..9, a..z, A..Z.
       * For a full list, please check the source link above.
       *
       * @param {String} keys - keyboard key (or array of keys) which will cause the event.
       * @param {String} actionName - the event name
       * @param {Object} options - options object
       * @param {Boolean} options.repeat - if set to true, an event continues to be sent on each game step, while the key is pressed
       * @param {Object/Function} parameters - parameters (or function to get parameters) to be sent to
       *                                       the server with sendInput as the inputOptions
       */
      bindKey(keys, actionName, options, parameters) {
          if (!Array.isArray(keys)) keys = [keys];

          let keyOptions = Object.assign({
              repeat: false
          }, options);

          keys.forEach(keyName => {
              this.boundKeys[keyName] = { actionName, options: keyOptions, parameters: parameters };
          });
      }

      // todo implement unbindKey

      onKeyChange(e, isDown) {
          e = e || window.event;

          let keyName = keyCodeTable[e.keyCode];
          let ret = [];

          if (this.eventEmitter && isDown) {
              ret = this.eventEmitter.emit('keypress', keyName);
          }
          
          if (this.stop) return
          
          if (keyName && this.boundKeys[keyName]) {
              if (this.keyState[keyName] == null) {
                  this.keyState[keyName] = {
                      count: 0
                  };
              }
              this.keyState[keyName].isDown = isDown;

              // key up, reset press count
              if (!isDown) this.keyState[keyName].count = 0;

              // keep reference to the last key pressed to avoid duplicates
              this.lastKeyPressed = isDown ? e.keyCode : null;
              // this.renderer.onKeyChange({ keyName, isDown });
              e.preventDefault();
          }
      }
  }

  let singleton = null;

  const TIME_RESET_THRESHOLD = 100;

  /**
   * The Renderer is the component which must *draw* the game on the client.
   * It will be instantiated once on each client, and must implement the draw
   * method.  The draw method will be invoked on every iteration of the browser's
   * render loop.
   */
  class Renderer {

      static getInstance() {
          return singleton;
      }

      /**
      * Constructor of the Renderer singleton.
      * @param {GameEngine} gameEngine - Reference to the GameEngine instance.
      * @param {ClientEngine} clientEngine - Reference to the ClientEngine instance.
      */
      constructor(gameEngine, clientEngine) {
          this.gameEngine = gameEngine;
          this.clientEngine = clientEngine;
          this.gameEngine.on('client__stepReset', () => { this.doReset = true; });
          gameEngine.on('objectAdded', this.addObject.bind(this));
          gameEngine.on('objectDestroyed', this.removeObject.bind(this));

          // the singleton renderer has been created
          singleton = this;
      }

      /**
       * Initialize the renderer.
       * @return {Promise} Resolves when renderer is ready.
      */
      init() {
          if ((typeof window === 'undefined') || !document) {
              console.log('renderer invoked on server side.');
          }
          this.gameEngine.emit('client__rendererReady');
          return Promise.resolve(); // eslint-disable-line new-cap
      }

      reportSlowFrameRate() {
          this.gameEngine.emit('client__slowFrameRate');
      }

      /**
       * The main draw function.  This method is called at high frequency,
       * at the rate of the render loop.  Typically this is 60Hz, in WebVR 90Hz.
       * If the client engine has been configured to render-schedule, then this
       * method must call the clientEngine's step method.
       *
       * @param {Number} t - current time (only required in render-schedule mode)
       * @param {Number} dt - time elapsed since last draw
       */
      draw(t, dt) {
          this.gameEngine.emit('client__draw');

          if (this.clientEngine.options.scheduler === 'render-schedule')
              this.runClientStep(t);
      }

      /**
       * The main draw function.  This method is called at high frequency,
       * at the rate of the render loop.  Typically this is 60Hz, in WebVR 90Hz.
       *
       * @param {Number} t - current time
       * @param {Number} dt - time elapsed since last draw
       */
      runClientStep(t) {
          let p = this.clientEngine.options.stepPeriod;
          let dt = 0;

          // reset step time if we passed a threshold
          if (this.doReset || t > this.clientEngine.lastStepTime + TIME_RESET_THRESHOLD) {
              this.doReset = false;
              this.clientEngine.lastStepTime = t - p / 2;
              this.clientEngine.correction = p / 2;
          }

          // catch-up missed steps
          while (t > this.clientEngine.lastStepTime + p) {
              this.clientEngine.step(this.clientEngine.lastStepTime + p, p + this.clientEngine.correction);
              this.clientEngine.lastStepTime += p;
              this.clientEngine.correction = 0;
          }

          // if not ready for a real step yet, return
          // this might happen after catch up above
          if (t < this.clientEngine.lastStepTime) {
              dt = t - this.clientEngine.lastStepTime + this.clientEngine.correction;
              if (dt < 0) dt = 0;
              this.clientEngine.correction = this.clientEngine.lastStepTime - t;
              this.clientEngine.step(t, dt, true);
              return;
          }

          // render-controlled step
          dt = t - this.clientEngine.lastStepTime + this.clientEngine.correction;
          this.clientEngine.lastStepTime += p;
          this.clientEngine.correction = this.clientEngine.lastStepTime - t;
          this.clientEngine.step(t, dt);
      }

      /**
       * Handle the addition of a new object to the world.
       * @param {Object} obj - The object to be added.
       */
      addObject(obj) {}

      /**
       * Handle the removal of an old object from the world.
       * @param {Object} obj - The object to be removed.
       */
      removeObject(obj) {}

      /**
       * Called when clientEngine has stopped, time to clean up
       */
      stop() {}
  }

  /* global THREE */
  const FRAME_HISTORY_SIZE = 20;
  const MAX_SLOW_FRAMES = 10;

  var networkedPhysics = {
      schema: {
          traceLevel: { default: 4 }
      },

      init: function() {

          // TODO: Sometimes an object is "simple".  For example it uses
          //       existing AFrame assets (an OBJ file and a material)
          //       in this case, we can auto-generate the DOM element,
          //       setting the quaternion, position, material, game-object-id
          //       and obj-model.  Same goes for objects which use primitive
          //       geometric objects.  Remember to also remove them.
          this.CAMERA_OFFSET_VEC = new THREE.Vector3(0, 5, -10);
          this.frameRateHistory = [];
          for (let i = 0; i < FRAME_HISTORY_SIZE; i++)
              this.frameRateHistory.push(false);
          this.frameRateTest = (1000 / 60) * 1.2;

          // capture the chase camera if available
          let chaseCameras = document.getElementsByClassName('chaseCamera');
          if (chaseCameras)
              this.cameraEl = chaseCameras[0];
      },

      tick: function(t, dt) {
          if (!this.gameEngine)
              return;
          this.renderer.tick(t, dt);

          let frh = this.frameRateHistory;
          frh.push(dt > this.frameRateTest);
          frh.shift();
          const slowFrames = frh.filter(x => x);
          if (slowFrames.length > MAX_SLOW_FRAMES) {
              this.frameRateHistory = frh.map(x => false);
              this.renderer.reportSlowFrameRate();
          }

          // for each object in the world, update the a-frame element
          this.gameEngine.world.forEachObject((id, o) => {
              let el = o.renderEl;
              if (el) {
                  let q = o.quaternion;
                  let p = o.position;
                  el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
                  el.object3D.quaternion.set(q.x, q.y, q.z, q.w);

                  // if a chase camera is configured, update it
                  if (this.cameraEl && this.gameEngine.playerId === o.playerId) {
                      let camera = this.cameraEl.object3D.children[0];
                      let relativeCameraOffset = this.CAMERA_OFFSET_VEC.clone();
                      let cameraOffset = relativeCameraOffset.applyMatrix4(o.renderEl.object3D.matrixWorld);
                      camera.position.copy(cameraOffset);
                      camera.lookAt(o.renderEl.object3D.position);
                  }

              }
          });
      },

      // NOTE: webpack generated incorrect code if you use arrow notation below
      //       it sets "this" to "undefined"
      setGlobals: function(gameEngine, renderer) {
          this.gameEngine = gameEngine;
          this.renderer = renderer;
      }
  };

  /* globals AFRAME */

  /**
   * The A-Frame Renderer
   */
  class AFrameRenderer extends Renderer {

      /**
      * Constructor of the Renderer singleton.
      * @param {GameEngine} gameEngine - Reference to the GameEngine instance.
      * @param {ClientEngine} clientEngine - Reference to the ClientEngine instance.
      */
      constructor(gameEngine, clientEngine) {
          super(gameEngine, clientEngine);

          // set up the networkedPhysics as an A-Frame system
          networkedPhysics.setGlobals(gameEngine, this);
          AFRAME.registerSystem('networked-physics', networkedPhysics);
      }

      reportSlowFrameRate() {
          this.gameEngine.emit('client__slowFrameRate');
      }

      /**
       * Initialize the renderer.
       * @return {Promise} Resolves when renderer is ready.
      */
      init() {

          let p = super.init();

          let sceneElArray = document.getElementsByTagName('a-scene');
          if (sceneElArray.length !== 1) {
              throw new Error('A-Frame scene element not found');
          }
          this.scene = sceneElArray[0];

          this.gameEngine.on('objectRemoved', (o) => {
              o.renderObj.remove();
          });

          return p; // eslint-disable-line new-cap
      }

      /**
       * In AFrame, we set the draw method (which is called at requestAnimationFrame)
       * to a NO-OP. See tick() instead
       */
      draw() {}

      tick(t, dt) {
          super.draw(t, dt);
      }

  }

  var _0777 = parseInt('0777', 8);

  var mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

  function mkdirP (p, opts, f, made) {
      if (typeof opts === 'function') {
          f = opts;
          opts = {};
      }
      else if (!opts || typeof opts !== 'object') {
          opts = { mode: opts };
      }
      
      var mode = opts.mode;
      var xfs = opts.fs || fs;
      
      if (mode === undefined) {
          mode = _0777 & (~process.umask());
      }
      if (!made) made = null;
      
      var cb = f || function () {};
      p = path.resolve(p);
      
      xfs.mkdir(p, mode, function (er) {
          if (!er) {
              made = made || p;
              return cb(null, made);
          }
          switch (er.code) {
              case 'ENOENT':
                  if (path.dirname(p) === p) return cb(er);
                  mkdirP(path.dirname(p), opts, function (er, made) {
                      if (er) cb(er, made);
                      else mkdirP(p, opts, cb, made);
                  });
                  break;

              // In the case of any other error, just see if there's a dir
              // there already.  If so, then hooray!  If not, then something
              // is borked.
              default:
                  xfs.stat(p, function (er2, stat) {
                      // if the stat fails, then that's super weird.
                      // let the original error be the failure reason.
                      if (er2 || !stat.isDirectory()) cb(er, made);
                      else cb(null, made);
                  });
                  break;
          }
      });
  }

  mkdirP.sync = function sync (p, opts, made) {
      if (!opts || typeof opts !== 'object') {
          opts = { mode: opts };
      }
      
      var mode = opts.mode;
      var xfs = opts.fs || fs;
      
      if (mode === undefined) {
          mode = _0777 & (~process.umask());
      }
      if (!made) made = null;

      p = path.resolve(p);

      try {
          xfs.mkdirSync(p, mode);
          made = made || p;
      }
      catch (err0) {
          switch (err0.code) {
              case 'ENOENT' :
                  made = sync(path.dirname(p), opts, made);
                  sync(p, opts, made);
                  break;

              // In the case of any other error, just see if there's a dir
              // there already.  If so, then hooray!  If not, then something
              // is borked.
              default:
                  var stat;
                  try {
                      stat = xfs.statSync(p);
                  }
                  catch (err1) {
                      throw err0;
                  }
                  if (!stat.isDirectory()) throw err0;
                  break;
          }
      }

      return made;
  };

  /**
   * ServerEngine is the main server-side singleton code.
   * Extend this class with your own server-side logic, and
   * start a single instance.
   *
   * This class should not be used to contain the actual
   * game logic.  That belongs in the GameEngine class, where the mechanics
   * of the gameplay are actually implemented.
   * The ServerEngine singleton is typically a lightweight
   * implementation, logging gameplay statistics and registering
   * user activity and user data.
   *
   * The base class implementation is responsible for starting
   * the server, initiating each game step, accepting new
   * connections and dis-connections, emitting periodic game-state
   * updates, and capturing remote user inputs.
   */
  class ServerEngine {

      /**
       * create a ServerEngine instance
       *
       * @param {SocketIO} io - the SocketIO server
       * @param {GameEngine} gameEngine - instance of GameEngine
       * @param {Object} options - server options
       * @param {Number} options.stepRate - number of steps per second
       * @param {Number} options.updateRate - number of steps in each update (sync)
       * @param {Number} options.fullSyncRate - rate at which full-syncs are sent, in step count
       * @param {String} options.tracesPath - path where traces should go
       * @param {Boolean} options.countConnections - should ping player connections to lance.gg
       * @param {Boolean} options.updateOnObjectCreation - should send update immediately when new object is created
       * @param {Number} options.timeoutInterval=180 - number of seconds after which a player is automatically disconnected if no input is received. Set to 0 for no timeout
       * @return {ServerEngine} serverEngine - self
       */
      constructor(io, gameEngine, options) {
          this.options = Object.assign({
              updateRate: 6,
              stepRate: 60,
              fullSyncRate: 20,
              timeoutInterval: 180,
              updateOnObjectCreation: true,
              tracesPath: '',
              countConnections: true,
              debug: {
                  serverSendLag: false
              }
          }, options);
          if (this.options.tracesPath !== '') {
              this.options.tracesPath += '/';
              mkdirp.sync(this.options.tracesPath);
          }

          this.io = io;

          /**
           * reference to game engine
           * @member {GameEngine}
           */
          this.serializer = new Serializer();
          this.gameEngine = gameEngine;
          this.gameEngine.registerClasses(this.serializer);
          this.networkMonitor = new NetworkMonitor(this);

          /**
           * Default room name
           * @member {String} DEFAULT_ROOM_NAME
           */
          this.DEFAULT_ROOM_NAME = '/lobby';
          this.rooms = {};
          this.createRoom(this.DEFAULT_ROOM_NAME);
          this.connectedPlayers = {};
          this.playerInputQueues = {};
          this.objMemory = {};

          io.on('connection', this.onPlayerConnected.bind(this));
          this.gameEngine.on('objectAdded', this.onObjectAdded.bind(this));
          this.gameEngine.on('objectDestroyed', this.onObjectDestroyed.bind(this));

          return this;
      }

      // start the ServerEngine
      start() {
          this.gameEngine.start();
          this.networkTransmitter = new NetworkTransmitter(this.serializer, this.gameEngine.world);
          this.gameEngine.emit('server__init');

          let schedulerConfig = {
              tick: this.step.bind(this),
              period: 1000 / this.options.stepRate,
              delay: 4
          };
          this.scheduler = new Scheduler(schedulerConfig).start();
      }

      // every server step starts here
      step() {

          // first update the trace state
          this.gameEngine.trace.setStep(this.gameEngine.world.stepCount + 1);
          this.gameEngine.emit('server__preStep', this.gameEngine.world.stepCount + 1);

          this.serverTime = (new Date().getTime());

          // for each player, replay all the inputs in the oldest step
          for (let playerId of Object.keys(this.playerInputQueues)) {
              let inputQueue = this.playerInputQueues[playerId];
              let queueSteps = Object.keys(inputQueue);
              let minStep = Math.min.apply(null, queueSteps);

              // check that there are inputs for this step,
              // and that we have reached/passed this step
              if (queueSteps.length > 0 && minStep <= this.gameEngine.world.stepCount) {
                  inputQueue[minStep].forEach(input => {
                      this.gameEngine.emit('server__processInput', { input, playerId });
                      this.gameEngine.emit('processInput', { input, playerId });
                      this.gameEngine.processInput(input, playerId, true);
                  });
                  delete inputQueue[minStep];
              }
          }

          // run the game engine step
          this.gameEngine.step(false, this.serverTime / 1000);

          // synchronize the state to all clients
          //Object.keys(this.rooms).map(this.syncStateToClients.bind(this));

          this.gameEngine.world.groups.forEach((group) => {
              this.syncStateToClients(group);
          });

          // remove memory-objects which no longer exist
          for (let objId of Object.keys(this.objMemory)) {
              if (!(objId in this.gameEngine.world.objects)) {
                  delete this.objMemory[objId];
              }
          }

          // step is done on the server side
          this.gameEngine.emit('server__postStep', this.gameEngine.world.stepCount);

          if (this.gameEngine.trace.length) {
              let traceData = this.gameEngine.trace.rotate();
              let traceString = '';
              traceData.forEach(t => { traceString += `[${t.time.toISOString()}]${t.step}>${t.data}\n`; });
              fs.appendFile(`${this.options.tracesPath}server.trace`, traceString, err => { if (err) throw err; });
          }
      }

      syncStateToClients(room) {

          let world = this.gameEngine.world;

          // update clients only at the specified step interval, as defined in options
          // or if this room needs to sync
          //const room = this.rooms[roomName];
          const roomName = room.groupName;
          if (room.requestImmediateSync ||
              this.gameEngine.world.stepCount % this.options.updateRate === 0) {

              //const roomPlayers = Object.keys(this.connectedPlayers)
               //   .filter(p => this.connectedPlayers[p].roomName === roomName);
              // if at least one player is new, we should send a full payload
              const roomPlayers = world.getObjectsOfGroup(roomName);
              let diffUpdate = true;

              for (const player of roomPlayers) {
                  if (player._roomName != roomName) continue
                  if (player.state === 'new') {
                      player.state = 'synced';
                      diffUpdate = false;
                  }
              }

              // also, one in N syncs is a full update, or a special request
              if ((room.syncCounter++ % this.options.fullSyncRate === 0) || room.requestFullSync)
                  diffUpdate = false;

              this.networkTransmitter.addNetworkedEvent(roomName, 'syncHeader', {
                  stepCount: world.stepCount,
                  fullUpdate: Number(!diffUpdate)
              });
              
              for (const player of roomPlayers) {
                  if (player._roomName != roomName) continue
                  this.serializeUpdate(roomName, player, { diffUpdate });
              }

              const payload = this.networkTransmitter.serializePayload(roomName);

              if (payload) {
                  for (const player of roomPlayers) { 
                      if (player.socket && player._roomName == roomName) player.socket.emit('worldUpdate', payload); 
                  }
              }
              this.networkTransmitter.clearPayload(roomName); 
              room.requestImmediateSync = false;
              room.requestFullSync = false;
          }
      }

      // create a serialized package of the game world
      // TODO: this process could be made much much faster if the buffer creation and
      //       size calculation are done in a single phase, along with string pruning.
      serializeUpdate(roomName, object, options) {
          let world = this.gameEngine.world;
          let diffUpdate = Boolean(options && options.diffUpdate);
          let objId = object.id;
          let obj = world.objects[objId];
          let prevObject = this.objMemory[objId];

          // if the object (in serialized form) hasn't changed, move on
          if (diffUpdate) {
              let s = obj.serialize(this.serializer);
              if (prevObject && Utils.arrayBuffersEqual(s.dataBuffer, prevObject))
                  return;
              else
                  this.objMemory[objId] = s.dataBuffer;

              // prune strings which haven't changed
              obj = obj.prunedStringsClone(this.serializer, prevObject);
          }

          this.networkTransmitter.addNetworkedEvent(roomName, 'objectUpdate', {
              stepCount: world.stepCount,
              objectInstance: obj
          });
      }

      /**
       * Create a room
       *
       * There is a default room called "/lobby".  All newly created players
       * and objects are assigned to the default room.  When the server sends
       * periodic syncs to the players, each player is only sent those objects
       * which are present in his room.
       *
       * @param {String} roomName - the new room name
       */
      createRoom(roomName) {
          this.rooms[roomName] = { syncCounter: 0, requestImmediateSync: false };
      }

      /**
       * Assign an object to a room
       *
       * @param {Object} obj - the object to move
       * @param {String} roomName - the target room
       */
      assignObjectToRoom(obj, roomName) {
          obj._roomName = roomName;
          this.gameEngine.world.addObjectInGroup(obj, roomName);
      }

      /**
       * Assign a player to a room
       *
       * @param {Number} playerId - the playerId
       * @param {String} roomName - the target room
       */
      assignPlayerToRoom(playerId, roomName) {
         /* const room = this.rooms[roomName];
          let player = null;
          if (!room) {
              this.gameEngine.trace.error(() => `cannot assign player to non-existant room ${roomName}`);
              console.error(`player ${playerId} assigned to room [${roomName}] which isn't defined`);
              return;
          }
          for (const p of Object.keys(this.connectedPlayers)) {
              if (this.connectedPlayers[p].socket.playerId === playerId)
                  player = this.connectedPlayers[p];
          }
          if (!player) {
              this.gameEngine.trace.error(() => `cannot assign non-existant playerId ${playerId} to room ${roomName}`);
          }
          const roomUpdate = { playerId: playerId, from: player.roomName, to: roomName };
          player.socket.emit('roomUpdate', roomUpdate);
          this.gameEngine.emit('server__roomUpdate', roomUpdate);
          this.gameEngine.trace.info(() => `ROOM UPDATE: playerId ${playerId} from room ${player.roomName} to room ${roomName}`);
          player.roomName = roomName;
          room.requestImmediateSync = true;
          room.requestFullSync = true;
          */

      }

      // handle the object creation
      onObjectAdded(obj) {
         // obj._roomName = obj._roomName || this.DEFAULT_ROOM_NAME;
         /* this.networkTransmitter.addNetworkedEvent('objectCreate', {
              stepCount: this.gameEngine.world.stepCount,
              objectInstance: obj
          });*/

          if (this.options.updateOnObjectCreation) ;
      }

      // handle the object creation
      onObjectDestroyed({ object, groups }) {
          for (let room of groups) {
              this.networkTransmitter.addNetworkedEvent(room, 'objectDestroy', {
                  stepCount: this.gameEngine.world.stepCount,
                  objectInstance: object
              });
          }
      }

      getPlayerId(socket) {
      }

      // handle new player connection
      onPlayerConnected(socket) {
          let that = this;

          // save player
          this.connectedPlayers[socket.id] = {
              socket: socket,
              state: 'new',
              roomName: this.DEFAULT_ROOM_NAME
          };

          let playerId = this.getPlayerId(socket);
          if (!playerId) {
              playerId = v4();
          }
          socket.playerId = playerId;

          socket.lastHandledInput = null;
          socket.joinTime = (new Date()).getTime();
          this.resetIdleTimeout(socket);
          
          let playerEvent = { id: socket.id, playerId, joinTime: socket.joinTime, disconnectTime: 0 };
          this.gameEngine.emit('server__playerJoined', playerEvent);
          this.gameEngine.emit('playerJoined', playerEvent);
          socket.emit('playerJoined', playerEvent);

          socket.on('disconnect', function() {
              playerEvent.disconnectTime = (new Date()).getTime();
              that.onPlayerDisconnected(socket.id, playerId);
              that.gameEngine.emit('server__playerDisconnected', playerEvent);
              that.gameEngine.emit('playerDisconnected', playerEvent);
          });

          // todo rename, use number instead of name
          socket.on('move', function(data) {
              that.onReceivedInput(data, socket);
          });

          socket.on('_ping', function() {
              socket.emit('_pong');
          });

          // we got a packet of trace data, write it out to a side-file
          socket.on('trace', function(traceData) {
              traceData = JSON.parse(traceData);
              let traceString = '';
              traceData.forEach(t => { traceString += `[${t.time}]${t.step}>${t.data}\n`; });
              fs.appendFile(`${that.options.tracesPath}client.${playerId}.trace`, traceString, err => { if (err) throw err; });
          });

          this.networkMonitor.registerPlayerOnServer(socket);
      }

      // handle player timeout
      onPlayerTimeout(socket) {
          console.log(`Client timed out after ${this.options.timeoutInterval} seconds`, socket.id);
          socket.disconnect();
      }

      // handle player dis-connection
      onPlayerDisconnected(socketId, playerId) {
          delete this.connectedPlayers[socketId];
          console.log('Client disconnected');
      }

      // resets the idle timeout for a given player
      resetIdleTimeout(socket) {
          if (socket.idleTimeout) clearTimeout(socket.idleTimeout);
          if (this.options.timeoutInterval > 0) {
              socket.idleTimeout = setTimeout(() => {
                  this.onPlayerTimeout(socket);
              }, this.options.timeoutInterval * 1000);
          }
      }

      // add an input to the input-queue for the specific player
      // each queue is key'd by step, because there may be multiple inputs
      // per step
      queueInputForPlayer(data, playerId) {

          // create an input queue for this player, if one doesn't already exist
          if (!this.playerInputQueues.hasOwnProperty(playerId))
              this.playerInputQueues[playerId] = {};
          let queue = this.playerInputQueues[playerId];

          // create an array of inputs for this step, if one doesn't already exist
          if (!queue[data.step]) queue[data.step] = [];

          // add the input to the player's queue
          queue[data.step].push(data);
      }

      // an input has been received from a client, queue it for next step
      onReceivedInput(data, socket) {
          
          if (this.connectedPlayers[socket.id]) {
              this.connectedPlayers[socket.id].socket.lastHandledInput = data.messageIndex;
          }

          this.resetIdleTimeout(socket);

          this.queueInputForPlayer(data, socket.playerId);
      }

      /**
       * Report game status
       * This method is only relevant if the game uses MatchMaker functionality.
       * This method must return the game status.
       *
       * @return {String} Stringified game status object.
       */
      gameStatus() {
          let gameStatus = {
              numPlayers: Object.keys(this.connectedPlayers).length,
              upTime: 0,
              cpuLoad: 0,
              memoryLoad: 0,
              players: {}
          };

          for (let p of Object.keys(this.connectedPlayers)) {
              gameStatus.players[p] = {
                  frameRate: 0,
              };
          }

          return JSON.stringify(gameStatus);
      }

  }

  exports.GameEngine = GameEngine;
  exports.GameWorld = GameWorld;
  exports.SimplePhysicsEngine = SimplePhysicsEngine;
  exports.BaseTypes = BaseTypes;
  exports.TwoVector = TwoVector;
  exports.ThreeVector = ThreeVector;
  exports.Quaternion = Quaternion;
  exports.GameObject = GameObject;
  exports.DynamicObject = DynamicObject;
  exports.PhysicalObject2D = PhysicalObject2D;
  exports.PhysicalObject3D = PhysicalObject3D;
  exports.Lib = lib;
  exports.Utils = Utils;
  exports.ClientEngine = ClientEngine;
  exports.KeyboardControls = KeyboardControls;
  exports.Renderer = Renderer;
  exports.AFrameRenderer = AFrameRenderer;
  exports.ServerEngine = ServerEngine;
  exports.CannonPhysicsEngine = CannonPhysicsEngine;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
