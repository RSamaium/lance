import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import http from 'http';

const rnds8 = new Uint8Array(16);
function rng() {
  return crypto.randomFillSync(rnds8);
}

var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return stringify(rnds);
}

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

var lib = {
    Trace,
    Utils
};

export { GameEngine, GameWorld, SimplePhysicsEngine, BaseTypes, TwoVector, ThreeVector, Quaternion, GameObject, DynamicObject, PhysicalObject2D, PhysicalObject3D, ServerEngine, lib as Lib, Utils, CannonPhysicsEngine };
