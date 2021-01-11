(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('http'), require('fs'), require('path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'http', 'fs', 'path'], factory) :
  (global = global || self, factory(global.Client = {}, global.http, global.fs, global.path));
}(this, function (exports, http, fs, path) { 'use strict';

  http = http && http.hasOwnProperty('default') ? http['default'] : http;
  fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
  path = path && path.hasOwnProperty('default') ? path['default'] : path;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

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

  var GameWorld =
  /*#__PURE__*/
  function () {
    /**
     * Constructor of the World instance.  Invoked by Lance on startup.
     *
     * @hideconstructor
     */
    function GameWorld() {
      _classCallCheck(this, GameWorld);

      this.stepCount = 0;
      this.objects = {};
      this.playerCount = 0;
      this.idCount = 0;
      this.groups = new Map();
    }

    _createClass(GameWorld, [{
      key: "getNewId",

      /**
       * Gets a new, fresh and unused id that can be used for a new object
       * @private
       * @return {Number} the new id
       */
      value: function getNewId() {
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

    }, {
      key: "queryObjects",
      value: function queryObjects(query) {
        var queriedObjects = []; // todo this is currently a somewhat inefficient implementation for API testing purposes.
        // It should be implemented with cached dictionaries like in nano-ecs

        this.forEachObject(function (id, object) {
          var conditions = []; // object id condition

          conditions.push(!('id' in query) || query.id !== null && object.id === query.id); // player id condition

          conditions.push(!('playerId' in query) || query.playerId !== null && object.playerId === query.playerId); // instance type conditio

          conditions.push(!('instanceType' in query) || query.instanceType !== null && object instanceof query.instanceType); // components conditions

          if ('components' in query) {
            query.components.forEach(function (componentClass) {
              conditions.push(object.hasComponent(componentClass));
            });
          } // all conditions are true, object is qualified for the query


          if (conditions.every(function (value) {
            return value;
          })) {
            queriedObjects.push(object);
            if (query.returnSingle) return false;
          }
        }); // return a single object or null

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

    }, {
      key: "queryObject",
      value: function queryObject(query) {
        return this.queryObjects(Object.assign(query, {
          returnSingle: true
        }));
      }
    }, {
      key: "has",
      value: function has(id) {
        return !!this.objects[id];
      }
    }, {
      key: "getObject",
      value: function getObject(id) {
        if (typeof id != 'string') {
          id = id.id;
        }

        return this.objects[id];
      }
    }, {
      key: "getObjectsOfGroup",
      value: function getObjectsOfGroup(groupName) {
        var _this = this;

        return this.groups.get(groupName).collections.map(function (id) {
          return _this.getObject(id);
        });
      }
      /**
       * Add an object to the game world
       * @private
       * @param {Object} object object to add
       */

    }, {
      key: "addObject",
      value: function addObject(object) {
        this.objects[object.id] = object;
      }
    }, {
      key: "addObjectInGroup",
      value: function addObjectInGroup(object, groupName) {
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

    }, {
      key: "removeObject",
      value: function removeObject(id) {
        var _this2 = this;

        var groupsDeleted = [];
        this.groups.forEach(function (group) {
          var isDeleted = _this2.removeObjectOfGroup(group.groupName, id);

          if (isDeleted) groupsDeleted.push(group.groupName);
        });
        delete this.objects[id];
        return groupsDeleted;
      }
      /**
       * World object iterator.
       * Invoke callback(objId, obj) for each object
       *
       * @param {function} callback function receives id and object. If callback returns false, the iteration will cease
       */

    }, {
      key: "forEachObject",
      value: function forEachObject(callback) {
        var _arr = Object.keys(this.objects);

        for (var _i = 0; _i < _arr.length; _i++) {
          var id = _arr[_i];
          var returnValue = callback(id, this.objects[id]); // TODO: the key should be Number(id)

          if (returnValue === false) break;
        }
      }
    }, {
      key: "forEach",
      value: function forEach(callback) {
        for (var id in this.objects) {
          callback(this.objects[id], id);
        }
      }
    }, {
      key: "addGroup",
      value: function addGroup(groupName) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.groups.has(groupName)) {
          var meta = this.groups.get(groupName);
          this.groups.set(groupName, _objectSpread({}, meta, options));
        } else {
          this.groups.set(groupName, _objectSpread({
            collections: [],
            requestImmediateSync: false,
            requestFullSync: false,
            syncCounter: 0,
            groupName: groupName
          }, options));
        }

        if (this.onAddGroup) this.onAddGroup(groupName);
      }
    }, {
      key: "removeGroup",
      value: function removeGroup(groupName) {
        this.groups.delete(groupName);
        if (this.onRemoveGroup) this.onRemoveGroup(groupName);
      }
    }, {
      key: "removeObjectOfGroup",
      value: function removeObjectOfGroup(groupName, id) {
        var group = this.groups.get(groupName);
        var isDeleted = false;
        var collections = group.collections.filter(function (objId) {
          if (objId != id) {
            return true;
          } else {
            isDeleted = true;
            return false;
          }
        });

        if (collections.length == 0) {
          this.removeGroup(groupName);
        } else {
          this.groups.set(groupName, _objectSpread({}, group, {
            collections: collections
          }));
        }

        return isDeleted;
      }
    }, {
      key: "size",
      get: function get() {
        return Object.keys(this.objects).length;
      }
    }]);

    return GameWorld;
  }();

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
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
  var Timer =
  /*#__PURE__*/
  function () {
    function Timer() {
      _classCallCheck(this, Timer);

      this.currentTime = 0;
      this.isActive = false;
      this.idCounter = 0;
      this.events = {};
    }

    _createClass(Timer, [{
      key: "play",
      value: function play() {
        this.isActive = true;
      }
    }, {
      key: "tick",
      value: function tick() {
        var event;
        var eventId;

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
    }, {
      key: "destroyEvent",
      value: function destroyEvent(eventId) {
        delete this.events[eventId];
      }
    }, {
      key: "loop",
      value: function loop(time, callback) {
        var timerEvent = new TimerEvent(this, TimerEvent.TYPES.repeat, time, callback);
        this.events[timerEvent.id] = timerEvent;
        return timerEvent;
      }
    }, {
      key: "add",
      value: function add(time, callback, thisContext, args) {
        var timerEvent = new TimerEvent(this, TimerEvent.TYPES.single, time, callback, thisContext, args);
        this.events[timerEvent.id] = timerEvent;
        return timerEvent;
      } // todo implement timer delete all events

    }, {
      key: "destroy",
      value: function destroy(id) {
        delete this.events[id];
      }
    }]);

    return Timer;
  }(); // timer event

  var TimerEvent = function TimerEvent(timer, type, time, callback, thisContext, args) {
    _classCallCheck(this, TimerEvent);

    this.id = ++timer.idCounter;
    this.timer = timer;
    this.type = type;
    this.time = time;
    this.callback = callback;
    this.startOffset = timer.currentTime;
    this.thisContext = thisContext;
    this.args = args;

    this.destroy = function () {
      this.timer.destroy(this.id);
    };
  };

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
  var Trace =
  /*#__PURE__*/
  function () {
    function Trace(options) {
      _classCallCheck(this, Trace);

      this.options = Object.assign({
        traceLevel: this.TRACE_DEBUG
      }, options);
      this.traceBuffer = [];
      this.step = 'initializing'; // syntactic sugar functions

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


    _createClass(Trace, [{
      key: "trace",
      value: function trace(level, dataCB) {
        // all traces must be functions which return strings
        if (typeof dataCB !== 'function') {
          throw new Error("Lance trace was called but instead of passing a function, it received a [".concat(_typeof(dataCB), "]"));
        }

        if (level < this.options.traceLevel) return;
        this.traceBuffer.push({
          data: dataCB(),
          level: level,
          step: this.step,
          time: new Date()
        });
      }
    }, {
      key: "rotate",
      value: function rotate() {
        var buffer = this.traceBuffer;
        this.traceBuffer = [];
        return buffer;
      }
    }, {
      key: "setStep",
      value: function setStep(s) {
        this.step = s;
      }
    }, {
      key: "length",
      get: function get() {
        return this.traceBuffer.length;
      }
    }], [{
      key: "TRACE_ALL",
      get: function get() {
        return 0;
      }
      /**
       * Include debug traces and higher.
       * @memberof Trace
       * @member {Number} TRACE_DEBUG
       */

    }, {
      key: "TRACE_DEBUG",
      get: function get() {
        return 1;
      }
      /**
       * Include info traces and higher.
       * @memberof Trace
       * @member {Number} TRACE_INFO
       */

    }, {
      key: "TRACE_INFO",
      get: function get() {
        return 2;
      }
      /**
       * Include warn traces and higher.
       * @memberof Trace
       * @member {Number} TRACE_WARN
       */

    }, {
      key: "TRACE_WARN",
      get: function get() {
        return 3;
      }
      /**
       * Include error traces and higher.
       * @memberof Trace
       * @member {Number} TRACE_ERROR
       */

    }, {
      key: "TRACE_ERROR",
      get: function get() {
        return 4;
      }
      /**
       * Disable all tracing.
       * @memberof Trace
       * @member {Number} TRACE_NONE
       */

    }, {
      key: "TRACE_NONE",
      get: function get() {
        return 1000;
      }
    }]);

    return Trace;
  }();

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

  var GameEngine =
  /*#__PURE__*/
  function () {
    /**
      * Create a game engine instance.  This needs to happen
      * once on the server, and once on each client.
      *
      * @param {Object} options - options object
      * @param {Number} options.traceLevel - the trace level.
      */
    function GameEngine(options) {
      _classCallCheck(this, GameEngine);

      // place the game engine in the LANCE globals
      var isServerSide = typeof window === 'undefined';
      var glob = isServerSide ? global : window;
      glob.LANCE = {
        gameEngine: this
      }; // set options

      var defaultOpts = {
        traceLevel: Trace.TRACE_NONE
      };
      if (!isServerSide) defaultOpts.clientIDSpace = 1000000;
      this.options = Object.assign(defaultOpts, options);
      /**
       * client's player ID, as a string. If running on the client, this is set at runtime by the clientEngine
       * @member {String}
       */

      this.playerId = NaN; // set up event emitting and interface

      var eventEmitter$1 = this.options.eventEmitter;
      if (typeof eventEmitter$1 === 'undefined') eventEmitter$1 = new eventEmitter();
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
      this.emit = eventEmitter$1.emit; // set up trace

      this.trace = new Trace({
        traceLevel: this.options.traceLevel
      });
    }

    _createClass(GameEngine, [{
      key: "findLocalShadow",
      value: function findLocalShadow(serverObj) {
        var _arr = Object.keys(this.world.objects);

        for (var _i = 0; _i < _arr.length; _i++) {
          var localId = _arr[_i];
          if (localId < this.options.clientIDSpace) continue;
          var localObj = this.world.objects[localId];
          if (localObj.hasOwnProperty('inputId') && localObj.inputId === serverObj.inputId) return localObj;
        }

        return null;
      }
    }, {
      key: "initWorld",
      value: function initWorld(worldSettings) {
        this.world = new GameWorld(); // on the client we have a different ID space

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

    }, {
      key: "start",
      value: function start() {
        var _this = this;

        this.trace.info(function () {
          return '========== game engine started ==========';
        });
        this.initWorld(); // create the default timer

        this.timer = new Timer();
        this.timer.play();
        this.on('postStep', function (step, isReenact) {
          if (!isReenact) _this.timer.tick();
        });
        this.emit('start', {
          timestamp: new Date().getTime()
        });
      }
      /**
        * Single game step.
        *
        * @param {Boolean} isReenact - is this step a re-enactment of the past.
        * @param {Number} t - the current time (optional)
        * @param {Number} dt - elapsed time since last step was called.  (optional)
        * @param {Boolean} physicsOnly - do a physics step only, no game logic
        */

    }, {
      key: "step",
      value: function step(isReenact, t, dt, physicsOnly) {
        var _this2 = this;

        // physics-only step
        if (physicsOnly) {
          if (dt) dt /= 1000; // physics engines work in seconds

          this.physicsEngine.step(dt, objectFilter);
          return;
        } // emit preStep event


        if (isReenact === undefined) throw new Error('game engine does not forward argument isReenact to super class');
        isReenact = Boolean(isReenact);
        var step = ++this.world.stepCount;
        var clientIDSpace = this.options.clientIDSpace;
        this.emit('preStep', {
          step: step,
          isReenact: isReenact,
          dt: dt
        }); // skip physics for shadow objects during re-enactment

        function objectFilter(o) {
          return !isReenact || o.id < clientIDSpace;
        } // physics step


        if (this.physicsEngine && !this.ignorePhysics) {
          if (dt) dt /= 1000; // physics engines work in seconds

          this.physicsEngine.step(dt, objectFilter);
        } // for each object
        // - apply incremental bending
        // - refresh object positions after physics


        this.world.forEachObject(function (id, o) {
          if (typeof o.refreshFromPhysics === 'function') o.refreshFromPhysics();

          _this2.trace.trace(function () {
            return "object[".concat(id, "] after ").concat(isReenact ? 'reenact' : 'step', " : ").concat(o.toString());
          });
        }); // emit postStep event

        this.emit('postStep', {
          step: step,
          isReenact: isReenact
        });
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

    }, {
      key: "addObjectToWorld",
      value: function addObjectToWorld(object) {
        // if we are asked to create a local shadow object
        // the server copy may already have arrived.
        if (object.id >= this.options.clientIDSpace) {
          var serverCopyArrived = false;
          this.world.forEachObject(function (id, o) {
            if (o.hasOwnProperty('inputId') && o.inputId === object.inputId) {
              serverCopyArrived = true;
              return false;
            }
          });

          if (serverCopyArrived) {
            this.trace.info(function () {
              return "========== shadow object NOT added ".concat(object.toString(), " ==========");
            });
            return null;
          }
        }

        this.world.addObject(object); // tell the object to join the game, by creating
        // its corresponding physical entities and renderer entities.

        if (typeof object.onAddToWorld === 'function') object.onAddToWorld(this);
        this.emit('objectAdded', object);
        this.trace.info(function () {
          return "========== object added ".concat(object.toString(), " ==========");
        });
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

    }, {
      key: "processInput",
      value: function processInput(inputDesc, playerId, isServer) {
        this.trace.info(function () {
          return "game engine processing input[".concat(inputDesc.messageIndex, "] <").concat(inputDesc.input, "> from playerId ").concat(playerId);
        });
      }
      /**
       * Remove an object from the game world.
       *
       * @param {Object|String} objectId - the object or object ID
       */

    }, {
      key: "removeObjectFromWorld",
      value: function removeObjectFromWorld(objectId) {
        if (_typeof(objectId) === 'object') objectId = objectId.id;
        var object = this.world.objects[objectId];

        if (!object) {
          throw new Error("Game attempted to remove a game object which doesn't (or never did) exist, id=".concat(objectId));
        }

        this.trace.info(function () {
          return "========== destroying object ".concat(object.toString(), " ==========");
        });
        /*if (typeof object.onRemoveFromWorld === 'function')
            object.onRemoveFromWorld(this);
         const groups = this.world.removeObject(objectId);
        this.emit('objectDestroyed', { object, groups });*/
      }
      /**
       * Check if a given object is owned by the player on this client
       *
       * @param {Object} object the game object to check
       * @return {Boolean} true if the game object is owned by the player on this client
       */

    }, {
      key: "isOwnedByPlayer",
      value: function isOwnedByPlayer(object) {
        return object.playerId == this.playerId;
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

    }, {
      key: "registerClasses",
      value: function registerClasses(serializer) {}
      /**
       * Decide whether the player game is over by returning an Object, need to be implemented
       *
       * @return {Object} truthful if the game is over for the player and the object is returned as GameOver data
       */

    }, {
      key: "getPlayerGameOverResult",
      value: function getPlayerGameOverResult() {
        return null;
      }
    }]);

    return GameEngine;
  }();

  // The base Physics Engine class defines the expected interface
  // for all physics engines
  var PhysicsEngine =
  /*#__PURE__*/
  function () {
    function PhysicsEngine(options) {
      _classCallCheck(this, PhysicsEngine);

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


    _createClass(PhysicsEngine, [{
      key: "step",
      value: function step(dt, objectFilter) {}
    }]);

    return PhysicsEngine;
  }();

  var Utils =
  /*#__PURE__*/
  function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "hashStr",
      value: function hashStr(str, bits) {
        var hash = 5381;
        var i = str.length;
        bits = bits ? bits : 8;

        while (i) {
          hash = hash * 33 ^ str.charCodeAt(--i);
        }

        hash = hash >>> 0;
        hash = hash % (Math.pow(2, bits) - 1); // JavaScript does bitwise operations (like XOR, above) on 32-bit signed
        // integers. Since we want the results to be always positive, convert the
        // signed int to an unsigned by doing an unsigned bitshift. */

        return hash;
      }
    }, {
      key: "arrayBuffersEqual",
      value: function arrayBuffersEqual(buf1, buf2) {
        if (buf1.byteLength !== buf2.byteLength) return false;
        var dv1 = new Int8Array(buf1);
        var dv2 = new Int8Array(buf2);

        for (var i = 0; i !== buf1.byteLength; i++) {
          if (dv1[i] !== dv2[i]) return false;
        }

        return true;
      }
    }, {
      key: "httpGetPromise",
      value: function httpGetPromise(url) {
        return new Promise(function (resolve, reject) {
          var req = new XMLHttpRequest();
          req.open('GET', url, true);

          req.onload = function () {
            if (req.status >= 200 && req.status < 400) resolve(JSON.parse(req.responseText));else reject();
          };

          req.onerror = function () {};

          req.send();
        });
      }
    }, {
      key: "generateUID",
      value: function generateUID() {
        var firstPart = Math.random() * 46656 | 0;
        var secondPart = Math.random() * 46656 | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        return firstPart + secondPart;
      }
    }]);

    return Utils;
  }();

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
  var BaseTypes = function BaseTypes() {
    _classCallCheck(this, BaseTypes);
  };
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

  var Serializable =
  /*#__PURE__*/
  function () {
    function Serializable() {
      _classCallCheck(this, Serializable);
    }

    _createClass(Serializable, [{
      key: "serialize",

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
      value: function serialize(serializer, options) {
        options = Object.assign({
          bufferOffset: 0
        }, options);
        var netScheme;
        var dataBuffer;
        var dataView;
        var classId = 0;
        var bufferOffset = options.bufferOffset;
        var localBufferOffset = 0; // used for counting the bufferOffset
        // instance classId

        if (this.classId) {
          classId = this.classId;
        } else {
          classId = Utils.hashStr(this.constructor.name);
        } // instance netScheme


        if (this.netScheme) {
          netScheme = this.netScheme;
        } else if (this.constructor.netScheme) {
          netScheme = this.constructor.netScheme;
        } else {
          // todo define behaviour when a netScheme is undefined
          console.warn('no netScheme defined! This will result in awful performance');
        } // TODO: currently we serialize every node twice, once to calculate the size
        //       of the buffers and once to write them out.  This can be reduced to
        //       a single pass by starting with a large (and static) ArrayBuffer and
        //       recursively building it up.
        // buffer has one Uint8Array for class id, then payload


        if (options.dataBuffer == null && options.dry != true) {
          var bufferSize = this.serialize(serializer, {
            dry: true
          }).bufferOffset;
          dataBuffer = new ArrayBuffer(bufferSize);
        } else {
          dataBuffer = options.dataBuffer;
        }

        if (options.dry != true) {
          dataView = new DataView(dataBuffer); // first set the id of the class, so that the deserializer can fetch information about it

          dataView.setUint8(bufferOffset + localBufferOffset, classId);
        } // advance the offset counter


        localBufferOffset += Uint8Array.BYTES_PER_ELEMENT;

        if (netScheme) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = Object.keys(netScheme).sort()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var property = _step.value;

              // write the property to buffer
              if (options.dry != true) {
                serializer.writeDataView(dataView, this[property], bufferOffset + localBufferOffset, netScheme[property]);
              }

              if (netScheme[property].type === BaseTypes.TYPES.STRING) {
                // derive the size of the string
                localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
                if (this[property] !== null && this[property] !== undefined) localBufferOffset += this[property].length * Uint16Array.BYTES_PER_ELEMENT;
              } else if (netScheme[property].type === BaseTypes.TYPES.CLASSINSTANCE) {
                // derive the size of the included class
                var objectInstanceBufferOffset = this[property].serialize(serializer, {
                  dry: true
                }).bufferOffset;
                localBufferOffset += objectInstanceBufferOffset;
              } else if (netScheme[property].type === BaseTypes.TYPES.LIST) {
                // derive the size of the list
                // list starts with number of elements
                localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = this[property][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var item = _step2.value;

                    // todo inelegant, currently doesn't support list of lists
                    if (netScheme[property].itemType === BaseTypes.TYPES.CLASSINSTANCE) {
                      var listBufferOffset = item.serialize(serializer, {
                        dry: true
                      }).bufferOffset;
                      localBufferOffset += listBufferOffset;
                    } else if (netScheme[property].itemType === BaseTypes.TYPES.STRING) {
                      // size includes string length plus double-byte characters
                      localBufferOffset += Uint16Array.BYTES_PER_ELEMENT * (1 + item.length);
                    } else {
                      localBufferOffset += serializer.getTypeByteSize(netScheme[property].itemType);
                    }
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                      _iterator2.return();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }
              } else {
                // advance offset
                localBufferOffset += serializer.getTypeByteSize(netScheme[property].type);
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }

        return {
          dataBuffer: dataBuffer,
          bufferOffset: localBufferOffset
        };
      } // build a clone of this object with pruned strings (if necessary)

    }, {
      key: "prunedStringsClone",
      value: function prunedStringsClone(serializer, prevObject) {
        var _this = this;

        if (!prevObject) return this;
        prevObject = serializer.deserialize(prevObject).obj; // get list of string properties which changed

        var netScheme = this.constructor.netScheme;

        var isString = function isString(p) {
          return netScheme[p].type === BaseTypes.TYPES.STRING;
        };

        var hasChanged = function hasChanged(p) {
          return prevObject[p] !== _this[p];
        };

        var changedStrings = Object.keys(netScheme).filter(isString).filter(hasChanged);
        if (changedStrings.length == 0) return this; // build a clone with pruned strings

        var prunedCopy = new this.constructor(null, {
          id: null
        });

        var _arr = Object.keys(netScheme);

        for (var _i = 0; _i < _arr.length; _i++) {
          var p = _arr[_i];
          prunedCopy[p] = changedStrings.indexOf(p) < 0 ? this[p] : null;
        }

        return prunedCopy;
      }
    }, {
      key: "syncTo",
      value: function syncTo(other) {
        var netScheme = this.constructor.netScheme;

        var _arr2 = Object.keys(netScheme);

        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
          var p = _arr2[_i2];
          // ignore classes and lists
          if (netScheme[p].type === BaseTypes.TYPES.LIST || netScheme[p].type === BaseTypes.TYPES.CLASSINSTANCE) continue; // strings might be pruned

          if (netScheme[p].type === BaseTypes.TYPES.STRING) {
            if (typeof other[p] === 'string') this[p] = other[p];
            continue;
          } // all other values are copied


          this[p] = other[p];
        }
      }
    }]);

    return Serializable;
  }();

  /**
   * A TwoVector is a geometric object which is completely described
   * by two values.
   */

  var TwoVector =
  /*#__PURE__*/
  function (_Serializable) {
    _inherits(TwoVector, _Serializable);

    _createClass(TwoVector, null, [{
      key: "netScheme",
      get: function get() {
        return {
          x: {
            type: BaseTypes.TYPES.FLOAT32
          },
          y: {
            type: BaseTypes.TYPES.FLOAT32
          }
        };
      }
      /**
      * Creates an instance of a TwoVector.
      * @param {Number} x - first value
      * @param {Number} y - second value
      * @return {TwoVector} v - the new TwoVector
      */

    }]);

    function TwoVector(x, y) {
      var _this;

      _classCallCheck(this, TwoVector);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(TwoVector).call(this));
      _this.x = x;
      _this.y = y;
      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }
    /**
     * Formatted textual description of the TwoVector.
     * @return {String} description
     */


    _createClass(TwoVector, [{
      key: "toString",
      value: function toString() {
        function round3(x) {
          return Math.round(x * 1000) / 1000;
        }

        return "[".concat(round3(this.x), ", ").concat(round3(this.y), "]");
      }
      /**
       * Set TwoVector values
       *
       * @param {Number} x x-value
       * @param {Number} y y-value
       * @return {TwoVector} returns self
       */

    }, {
      key: "set",
      value: function set(x, y) {
        this.x = x;
        this.y = y;
        return this;
      }
    }, {
      key: "multiply",
      value: function multiply(other) {
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

    }, {
      key: "multiplyScalar",
      value: function multiplyScalar(s) {
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

    }, {
      key: "add",
      value: function add(other) {
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

    }, {
      key: "subtract",
      value: function subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
      }
      /**
       * Get vector length
       *
       * @return {Number} length of this vector
       */

    }, {
      key: "length",
      value: function length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
      /**
       * Normalize this vector, in-place
       *
       * @return {TwoVector} returns self
       */

    }, {
      key: "normalize",
      value: function normalize() {
        this.multiplyScalar(1 / this.length());
        return this;
      }
      /**
       * Copy values from another TwoVector into this TwoVector
       *
       * @param {TwoVector} sourceObj the other vector
       * @return {TwoVector} returns self
       */

    }, {
      key: "copy",
      value: function copy(sourceObj) {
        this.x = sourceObj.x;
        this.y = sourceObj.y;
        return this;
      }
      /**
       * Create a clone of this vector
       *
       * @return {TwoVector} returns clone
       */

    }, {
      key: "clone",
      value: function clone() {
        return new TwoVector(this.x, this.y);
      }
      /**
       * Apply in-place lerp (linear interpolation) to this TwoVector
       * towards another TwoVector
       * @param {TwoVector} target the target vector
       * @param {Number} p The percentage to interpolate
       * @return {TwoVector} returns self
       */

    }, {
      key: "lerp",
      value: function lerp(target, p) {
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

    }, {
      key: "getBendingDelta",
      value: function getBendingDelta(target, options) {
        var increment = target.clone();
        increment.subtract(this);
        increment.multiplyScalar(options.percent); // check for max case

        if (typeof options.max === 'number' && increment.length() > options.max || typeof options.min === 'number' && increment.length() < options.min) {
          return new TwoVector(0, 0);
        } // divide into increments


        increment.multiplyScalar(1 / options.increments);
        return increment;
      }
    }]);

    return TwoVector;
  }(Serializable);

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
    var i, obj, grid, meta, objAABB, newObjHash; // for each object

    for (i = 0; i < this._globalObjects.length; i++) {
      obj = this._globalObjects[i];
      meta = obj.HSHG;
      grid = meta.grid; // recompute hash

      objAABB = obj.getAABB();
      newObjHash = grid.toHash(objAABB.min[0], objAABB.min[1]);

      if (newObjHash !== meta.hash) {
        // grid position has changed, update!
        grid.removeObject(obj);
        grid.addObject(obj, newObjHash);
      }
    }
  } // not implemented yet :)


  function update_REMOVEALL() {}

  function testAABBOverlap(objA, objB) {
    var a = objA.getAABB(),
        b = objB.getAABB(); // if(a.min[0] > b.max[0] || a.min[1] > b.max[1] || a.min[2] > b.max[2]
    // || a.max[0] < b.min[0] || a.max[1] < b.min[1] || a.max[2] < b.min[2]){

    if (a.min[0] > b.max[0] || a.min[1] > b.max[1] || a.max[0] < b.min[0] || a.max[1] < b.min[1]) {
      return false;
    }

    return true;
  }

  function getLongestAABBEdge(min, max) {
    return Math.max(Math.abs(max[0] - min[0]), Math.abs(max[1] - min[1]) // ,Math.abs(max[2] - min[2])
    );
  } // ---------------------------------------------------------------------
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
  } // HSHG.prototype.init = function(){
  //	this._grids = [];
  //	this._globalObjects = [];
  // }


  HSHG.prototype.addObject = function (obj) {
    var x,
        i,
        cellSize,
        objAABB = obj.getAABB(),
        objSize = getLongestAABBEdge(objAABB.min, objAABB.max),
        oneGrid,
        newGrid; // for HSHG metadata

    obj.HSHG = {
      globalObjectsIndex: this._globalObjects.length
    }; // add to global object array

    this._globalObjects.push(obj);

    if (this._grids.length == 0) {
      // no grids exist yet
      cellSize = objSize * this.HIERARCHY_FACTOR_SQRT;
      newGrid = new Grid(cellSize, this.INITIAL_GRID_LENGTH, this);
      newGrid.initCells();
      newGrid.addObject(obj);

      this._grids.push(newGrid);
    } else {
      x = 0; // grids are sorted by cellSize, smallest to largest

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
            newGrid.initCells(); // assign obj to grid

            newGrid.addObject(obj); // insert grid into list of grids directly before oneGrid

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
      newGrid.initCells(); // insert obj into grid

      newGrid.addObject(obj); // add newGrid as last element in grid list

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
    } // remove object from global object list


    globalObjectsIndex = meta.globalObjectsIndex;

    if (globalObjectsIndex === this._globalObjects.length - 1) {
      this._globalObjects.pop();
    } else {
      replacementObj = this._globalObjects.pop();
      replacementObj.HSHG.globalObjectsIndex = globalObjectsIndex;
      this._globalObjects[globalObjectsIndex] = replacementObj;
    }

    meta.grid.removeObject(obj); // remove meta data

    delete obj.HSHG;
  };

  HSHG.prototype.update = function () {
    this.UPDATE_METHOD.call(this);
  };

  HSHG.prototype.queryForCollisionPairs = function (broadOverlapTestCallback) {
    var i,
        j,
        k,
        l,
        c,
        grid,
        cell,
        objA,
        objB,
        offset,
        adjacentCell,
        biggerGrid,
        objAAABB,
        objAHashInBiggerGrid,
        possibleCollisions = []; // default broad test to internal aabb overlap test

    var broadOverlapTest = broadOverlapTestCallback || testAABBOverlap; // for all grids ordered by cell size ASC

    for (i = 0; i < this._grids.length; i++) {
      grid = this._grids[i]; // for each cell of the grid that is occupied

      for (j = 0; j < grid.occupiedCells.length; j++) {
        cell = grid.occupiedCells[j]; // collide all objects within the occupied cell

        for (k = 0; k < cell.objectContainer.length; k++) {
          objA = cell.objectContainer[k];

          for (l = k + 1; l < cell.objectContainer.length; l++) {
            objB = cell.objectContainer[l];

            if (broadOverlapTest(objA, objB) === true) {
              possibleCollisions.push([objA, objB]);
            }
          }
        } // for the first half of all adjacent cells (offset 4 is the current cell)


        for (c = 0; c < 4; c++) {
          offset = cell.neighborOffsetArray[c]; // if(offset === null) { continue; }

          adjacentCell = grid.allCells[cell.allCellsIndex + offset]; // collide all objects in cell with adjacent cell

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
      } // forall objects that are stored in this grid


      for (j = 0; j < grid.allObjects.length; j++) {
        objA = grid.allObjects[j];
        objAAABB = objA.getAABB(); // for all grids with cellsize larger than grid

        for (k = i + 1; k < this._grids.length; k++) {
          biggerGrid = this._grids[k];
          objAHashInBiggerGrid = biggerGrid.toHash(objAAABB.min[0], objAAABB.min[1]);
          cell = biggerGrid.allCells[objAHashInBiggerGrid]; // check objA against every object in all cells in offset array of cell
          // for all adjacent cells...

          for (c = 0; c < cell.neighborOffsetArray.length; c++) {
            offset = cell.neighborOffsetArray[c]; // if(offset === null) { continue; }

            adjacentCell = biggerGrid.allCells[cell.allCellsIndex + offset]; // for all objects in the adjacent cell...

            for (l = 0; l < adjacentCell.objectContainer.length; l++) {
              objB = adjacentCell.objectContainer[l]; // test against object A

              if (broadOverlapTest(objA, objB) === true) {
                possibleCollisions.push([objA, objB]);
              }
            }
          }
        }
      }
    } // return list of object pairs


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
        x,
        y,
        wh = this.rowColumnCount,
        isOnRightEdge,
        isOnLeftEdge,
        isOnTopEdge,
        isOnBottomEdge,
        innerOffsets = [// y+ down offsets
    // -1 + -wh, -wh, -wh + 1,
    // -1, 0, 1,
    // wh - 1, wh, wh + 1
    // y+ up offsets
    wh - 1, wh, wh + 1, -1, 0, 1, -1 + -wh, -wh, -wh + 1],
        leftOffset,
        rightOffset,
        topOffset,
        bottomOffset,
        uniqueOffsets = [],
        cell;
    this.sharedInnerOffsets = innerOffsets; // init all cells, creating offset arrays as needed

    for (i = 0; i < gridLength; i++) {
      cell = new Cell(); // compute row (y) and column (x) for an index

      y = ~~(i / this.rowColumnCount);
      x = ~~(i - y * this.rowColumnCount); // reset / init

      isOnRightEdge = false;
      isOnLeftEdge = false;
      isOnTopEdge = false;
      isOnBottomEdge = false; // right or left edge cell

      if ((x + 1) % this.rowColumnCount == 0) {
        isOnRightEdge = true;
      } else if (x % this.rowColumnCount == 0) {
        isOnLeftEdge = true;
      } // top or bottom edge cell


      if ((y + 1) % this.rowColumnCount == 0) {
        isOnTopEdge = true;
      } else if (y % this.rowColumnCount == 0) {
        isOnBottomEdge = true;
      } // if cell is edge cell, use unique offsets, otherwise use inner offsets


      if (isOnRightEdge || isOnLeftEdge || isOnTopEdge || isOnBottomEdge) {
        // figure out cardinal offsets first
        rightOffset = isOnRightEdge === true ? -wh + 1 : 1;
        leftOffset = isOnLeftEdge === true ? wh - 1 : -1;
        topOffset = isOnTopEdge === true ? -gridLength + wh : wh;
        bottomOffset = isOnBottomEdge === true ? gridLength - wh : -wh; // diagonals are composites of the cardinals

        uniqueOffsets = [// y+ down offset
        // leftOffset + bottomOffset, bottomOffset, rightOffset + bottomOffset,
        // leftOffset, 0, rightOffset,
        // leftOffset + topOffset, topOffset, rightOffset + topOffset
        // y+ up offset
        leftOffset + topOffset, topOffset, rightOffset + topOffset, leftOffset, 0, rightOffset, leftOffset + bottomOffset, bottomOffset, rightOffset + bottomOffset];
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
      i = -x * this.inverseCellSize;
      xHash = this.rowColumnCount - 1 - (~~i & this.xyHashMask);
    } else {
      i = x * this.inverseCellSize;
      xHash = ~~i & this.xyHashMask;
    }

    if (y < 0) {
      i = -y * this.inverseCellSize;
      yHash = this.rowColumnCount - 1 - (~~i & this.xyHashMask);
    } else {
      i = y * this.inverseCellSize;
      yHash = ~~i & this.xyHashMask;
    } // if(z < 0){
    //	i = (-z) * this.inverseCellSize;
    //	zHash = this.rowColumnCount - 1 - ( ~~i & this.xyHashMask );
    // } else {
    //	i = z * this.inverseCellSize;
    //	zHash = ~~i & this.xyHashMask;
    // }


    return xHash + yHash * this.rowColumnCount; // + zHash * this.rowColumnCount * this.rowColumnCount;
  };

  Grid.prototype.addObject = function (obj, hash) {
    var objAABB, objHash, targetCell; // technically, passing this in this should save some computational effort when updating objects

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
    } // add meta data to obj, for fast update/removal


    obj.HSHG.objectContainerIndex = targetCell.objectContainer.length;
    obj.HSHG.hash = objHash;
    obj.HSHG.grid = this;
    obj.HSHG.allGridObjectsIndex = this.allObjects.length; // add obj to cell

    targetCell.objectContainer.push(obj); // we can assume that the targetCell is already a member of the occupied list
    // add to grid-global object list

    this.allObjects.push(obj); // do test for grid density

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
    cell = this.allCells[hash]; // remove object from cell object container

    if (cell.objectContainer.length === 1) {
      // this is the last object in the cell, so reset it
      cell.objectContainer.length = 0; // remove cell from occupied list

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
    } // remove object from grid object list


    if (allGridObjectsIndex === this.allObjects.length - 1) {
      this.allObjects.pop();
    } else {
      replacementObj = this.allObjects.pop();
      replacementObj.HSHG.allGridObjectsIndex = allGridObjectsIndex;
      this.allObjects[allGridObjectsIndex] = replacementObj;
    }
  };

  Grid.prototype.expandGrid = function () {
    var i,
        currentCellCount = this.allCells.length,
        currentRowColumnCount = this.rowColumnCount,
        currentXYHashMask = this.xyHashMask,
        newCellCount = currentCellCount * 4,
        // double each dimension
    newRowColumnCount = ~~Math.sqrt(newCellCount),
        newXYHashMask = newRowColumnCount - 1,
        allObjects = this.allObjects.slice(0);
   // remove all objects

    for (i = 0; i < allObjects.length; i++) {
      this.removeObject(allObjects[i]);
    } // reset grid values, set new grid to be 4x larger than last


    this.rowColumnCount = newRowColumnCount;
    this.allCells = Array(this.rowColumnCount * this.rowColumnCount);
    this.xyHashMask = newXYHashMask; // initialize new cells

    this.initCells(); // re-add all objects to grid

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
  } // ---------------------------------------------------------------------
  // EXPORTS
  // ---------------------------------------------------------------------


  HSHG._private = {
    Grid: Grid,
    Cell: Cell,
    testAABBOverlap: testAABBOverlap,
    getLongestAABBEdge: getLongestAABBEdge
  };

  // uses this implementation https://gist.github.com/kirbysayshi/1760774

  var HSHGCollisionDetection =
  /*#__PURE__*/
  function () {
    function HSHGCollisionDetection(options) {
      _classCallCheck(this, HSHGCollisionDetection);

      this.options = Object.assign({
        COLLISION_DISTANCE: 28
      }, options);
    }

    _createClass(HSHGCollisionDetection, [{
      key: "init",
      value: function init(options) {
        var _this = this;

        this.gameEngine = options.gameEngine;
        this.grid = new HSHG();
        this.previousCollisionPairs = {};
        this.stepCollidingPairs = {};
        this.gameEngine.on('objectAdded', function (obj) {
          // add the gameEngine obj the the spatial grid
          _this.grid.addObject(obj);
        });
        this.gameEngine.on('objectDestroyed', function (obj) {
          // add the gameEngine obj the the spatial grid
          _this.grid.removeObject(obj);
        });
      }
    }, {
      key: "detect",
      value: function detect() {
        this.grid.update();
        this.stepCollidingPairs = this.grid.queryForCollisionPairs().reduce(function (accumulator, currentValue, i) {
          var pairId = getArrayPairId(currentValue);
          accumulator[pairId] = {
            o1: currentValue[0],
            o2: currentValue[1]
          };
          return accumulator;
        }, {});

        var _arr = Object.keys(this.previousCollisionPairs);

        for (var _i = 0; _i < _arr.length; _i++) {
          var pairId = _arr[_i];
          var pairObj = this.previousCollisionPairs[pairId]; // existed in previous pairs, but not during this step: this pair stopped colliding

          if (pairId in this.stepCollidingPairs === false) {
            this.gameEngine.emit('collisionStop', pairObj);
          }
        }

        var _arr2 = Object.keys(this.stepCollidingPairs);

        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
          var _pairId = _arr2[_i2];
          var _pairObj = this.stepCollidingPairs[_pairId]; // didn't exist in previous pairs, but exists now: this is a new colliding pair

          if (_pairId in this.previousCollisionPairs === false) {
            this.gameEngine.emit('collisionStart', _pairObj);
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

    }, {
      key: "areObjectsColliding",
      value: function areObjectsColliding(o1, o2) {
        return getArrayPairId([o1, o2]) in this.stepCollidingPairs;
      }
    }]);

    return HSHGCollisionDetection;
  }();

  function getArrayPairId(arrayPair) {
    // make sure to get the same id regardless of object order
    var sortedArrayPair = arrayPair.slice(0).sort();
    return sortedArrayPair[0].id + '-' + sortedArrayPair[1].id;
  }

  var differenceVector = new TwoVector(); // The collision detection of SimplePhysicsEngine is a brute-force approach

  var BruteForceCollisionDetection =
  /*#__PURE__*/
  function () {
    function BruteForceCollisionDetection(options) {
      _classCallCheck(this, BruteForceCollisionDetection);

      this.options = Object.assign({
        autoResolve: true
      }, options);
      this.collisionPairs = {};
    }

    _createClass(BruteForceCollisionDetection, [{
      key: "init",
      value: function init(options) {
        this.gameEngine = options.gameEngine;
      }
    }, {
      key: "findCollision",
      value: function findCollision(o1, o2) {
        // static objects don't collide
        if (o1.isStatic && o2.isStatic) return false; // allow a collision checker function

        if (typeof o1.collidesWith === 'function') {
          if (!o1.collidesWith(o2)) return false;
        } // radius-based collision


        if (this.options.collisionDistance) {
          differenceVector.copy(o1.position).subtract(o2.position);
          return differenceVector.length() < this.options.collisionDistance;
        } // check for no-collision first


        var o1Box = getBox(o1);
        var o2Box = getBox(o2);
        if (o1Box.xMin > o2Box.xMax || o1Box.yMin > o2Box.yMax || o2Box.xMin > o1Box.xMax || o2Box.yMin > o1Box.yMax) return false;
        if (!this.options.autoResolve) return true; // need to auto-resolve

        var shiftY1 = o2Box.yMax - o1Box.yMin;
        var shiftY2 = o1Box.yMax - o2Box.yMin;
        var shiftX1 = o2Box.xMax - o1Box.xMin;
        var shiftX2 = o1Box.xMax - o2Box.xMin;
        var smallestYShift = Math.min(Math.abs(shiftY1), Math.abs(shiftY2));
        var smallestXShift = Math.min(Math.abs(shiftX1), Math.abs(shiftX2)); // choose to apply the smallest shift which solves the collision

        if (smallestYShift < smallestXShift) {
          if (o1Box.yMin > o2Box.yMin && o1Box.yMin < o2Box.yMax) {
            if (o2.isStatic) o1.position.y += shiftY1;else if (o1.isStatic) o2.position.y -= shiftY1;else {
              o1.position.y += shiftY1 / 2;
              o2.position.y -= shiftY1 / 2;
            }
          } else if (o1Box.yMax > o2Box.yMin && o1Box.yMax < o2Box.yMax) {
            if (o2.isStatic) o1.position.y -= shiftY2;else if (o1.isStatic) o2.position.y += shiftY2;else {
              o1.position.y -= shiftY2 / 2;
              o2.position.y += shiftY2 / 2;
            }
          }

          o1.velocity.y = 0;
          o2.velocity.y = 0;
        } else {
          if (o1Box.xMin > o2Box.xMin && o1Box.xMin < o2Box.xMax) {
            if (o2.isStatic) o1.position.x += shiftX1;else if (o1.isStatic) o2.position.x -= shiftX1;else {
              o1.position.x += shiftX1 / 2;
              o2.position.x -= shiftX1 / 2;
            }
          } else if (o1Box.xMax > o2Box.xMin && o1Box.xMax < o2Box.xMax) {
            if (o2.isStatic) o1.position.x -= shiftX2;else if (o1.isStatic) o2.position.x += shiftX2;else {
              o1.position.x -= shiftX2 / 2;
              o2.position.x += shiftX2 / 2;
            }
          }

          o1.velocity.x = 0;
          o2.velocity.x = 0;
        }

        return true;
      } // check if pair (id1, id2) have collided

    }, {
      key: "checkPair",
      value: function checkPair(id1, id2) {
        var objects = this.gameEngine.world.objects;
        var o1 = objects[id1];
        var o2 = objects[id2]; // make sure that objects actually exist. might have been destroyed

        if (!o1 || !o2) return;
        var pairId = [id1, id2].join(',');

        if (this.findCollision(o1, o2)) {
          if (!(pairId in this.collisionPairs)) {
            this.collisionPairs[pairId] = true;
            this.gameEngine.emit('collisionStart', {
              o1: o1,
              o2: o2
            });
          }
        } else if (pairId in this.collisionPairs) {
          this.gameEngine.emit('collisionStop', {
            o1: o1,
            o2: o2
          });
          delete this.collisionPairs[pairId];
        }
      } // detect by checking all pairs

    }, {
      key: "detect",
      value: function detect() {
        var objects = this.gameEngine.world.objects;
        var keys = Object.keys(objects); // delete non existant object pairs

        for (var pairId in this.collisionPairs) {
          if (this.collisionPairs.hasOwnProperty(pairId)) if (keys.indexOf(pairId.split(',')[0]) === -1 || keys.indexOf(pairId.split(',')[1]) === -1) delete this.collisionPairs[pairId];
        } // check all pairs


        for (var _i = 0; _i < keys.length; _i++) {
          var k1 = keys[_i];

          for (var _i2 = 0; _i2 < keys.length; _i2++) {
            var k2 = keys[_i2];
            if (k2 > k1) this.checkPair(k1, k2);
          }
        }
      }
    }]);

    return BruteForceCollisionDetection;
  }(); // get bounding box of object o

  function getBox(o) {
    return {
      xMin: o.position.x,
      xMax: o.position.x + o.width,
      yMin: o.position.y,
      yMax: o.position.y + o.height
    };
  }

  var dv = new TwoVector();
  var dx = new TwoVector();
  /**
   * SimplePhysicsEngine is a pseudo-physics engine which works with
   * objects of class DynamicObject.
   * The Simple Physics Engine is a "fake" physics engine, which is more
   * appropriate for arcade games, and it is sometimes referred to as "arcade"
   * physics. For example if a character is standing at the edge of a platform,
   * with only one foot on the platform, it won't fall over. This is a desired
   * game behaviour in platformer games.
   */

  var SimplePhysicsEngine =
  /*#__PURE__*/
  function (_PhysicsEngine) {
    _inherits(SimplePhysicsEngine, _PhysicsEngine);

    /**
    * Creates an instance of the Simple Physics Engine.
    * @param {Object} options - physics options
    * @param {Object} options.collisions - collision options
    * @param {String} options.collisions.type - can be set to "HSHG" or "bruteForce".  Default is Brute-Force collision detection.
    * @param {Number} options.collisions.collisionDistance - for brute force, this can be set for a simple distance-based (radius) collision detection.
    * @param {Boolean} options.collisions.autoResolve - for brute force collision, colliding objects should be moved apart
    * @param {TwoVector} options.gravity - TwoVector instance which describes gravity, which will be added to the velocity of all objects at every step.  For example TwoVector(0, -0.01)
    */
    function SimplePhysicsEngine(options) {
      var _this;

      _classCallCheck(this, SimplePhysicsEngine);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(SimplePhysicsEngine).call(this, options)); // todo does this mean both modules always get loaded?

      if (options.collisions && options.collisions.type === 'HSHG') {
        _this.collisionDetection = new HSHGCollisionDetection(options.collisions);
      } else {
        _this.collisionDetection = new BruteForceCollisionDetection(options.collisions);
      }
      /**
       * The actor's name.
       * @memberof SimplePhysicsEngine
       * @member {TwoVector} gravity affecting all objects
       */


      _this.gravity = new TwoVector(0, 0);
      if (options.gravity) _this.gravity.copy(options.gravity);
      var collisionOptions = Object.assign({
        gameEngine: _this.gameEngine
      }, options.collisionOptions);

      _this.collisionDetection.init(collisionOptions);

      return _this;
    } // a single object advances, based on:
    // isRotatingRight, isRotatingLeft, isAccelerating, current velocity
    // wrap-around the world if necessary


    _createClass(SimplePhysicsEngine, [{
      key: "objectStep",
      value: function objectStep(o, dt) {
        // calculate factor
        if (dt === 0) return;
        if (dt) dt /= 1 / 60;else dt = 1; // TODO: worldsettings is a hack.  Find all places which use it in all games
        // and come up with a better solution.  for example an option sent to the physics Engine
        // with a "worldWrap:true" options
        // replace with a "worldBounds" parameter to the PhysicsEngine constructor

        var worldSettings = this.gameEngine.worldSettings; // TODO: remove this code in version 4: these attributes are deprecated

        if (o.isRotatingRight) {
          o.angle += o.rotationSpeed;
        }

        if (o.isRotatingLeft) {
          o.angle -= o.rotationSpeed;
        } // TODO: remove this code in version 4: these attributes are deprecated


        if (o.angle >= 360) {
          o.angle -= 360;
        }

        if (o.angle < 0) {
          o.angle += 360;
        } // TODO: remove this code in version 4: these attributes are deprecated


        if (o.isAccelerating) {
          var rad = o.angle * (Math.PI / 180);
          dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(o.acceleration).multiplyScalar(dt);
          o.velocity.add(dv);
        } // apply gravity


        if (!o.isStatic) o.velocity.add(this.gravity);
        var velMagnitude = o.velocity.length();

        if (o.maxSpeed !== null && velMagnitude > o.maxSpeed) {
          o.velocity.multiplyScalar(o.maxSpeed / velMagnitude);
        }

        o.isAccelerating = false;
        o.isRotatingLeft = false;
        o.isRotatingRight = false;
        dx.copy(o.velocity).multiplyScalar(dt);
        o.position.add(dx);
        o.velocity.multiply(o.friction); // wrap around the world edges

        if (worldSettings.worldWrap) {
          if (o.position.x >= worldSettings.width) {
            o.position.x -= worldSettings.width;
          }

          if (o.position.y >= worldSettings.height) {
            o.position.y -= worldSettings.height;
          }

          if (o.position.x < 0) {
            o.position.x += worldSettings.width;
          }

          if (o.position.y < 0) {
            o.position.y += worldSettings.height;
          }
        }
      } // entry point for a single step of the Simple Physics

    }, {
      key: "step",
      value: function step(dt, objectFilter) {
        // each object should advance
        var objects = this.gameEngine.world.objects;

        var _arr = Object.keys(objects);

        for (var _i = 0; _i < _arr.length; _i++) {
          var objId = _arr[_i];
          // shadow objects are not re-enacted
          var ob = objects[objId];
          if (!objectFilter(ob)) continue; // run the object step

          this.objectStep(ob, dt);
        } // emit event on collision


        this.collisionDetection.detect(this.gameEngine);
      }
    }]);

    return SimplePhysicsEngine;
  }(PhysicsEngine);

  var CANNON = require('cannon');
  /**
   * CannonPhysicsEngine is a three-dimensional lightweight physics engine
   */


  var CannonPhysicsEngine =
  /*#__PURE__*/
  function (_PhysicsEngine) {
    _inherits(CannonPhysicsEngine, _PhysicsEngine);

    function CannonPhysicsEngine(options) {
      var _this;

      _classCallCheck(this, CannonPhysicsEngine);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CannonPhysicsEngine).call(this, options));
      _this.options.dt = _this.options.dt || 1 / 60;
      var world = _this.world = new CANNON.World();
      world.quatNormalizeSkip = 0;
      world.quatNormalizeFast = false;
      world.gravity.set(0, -10, 0);
      world.broadphase = new CANNON.NaiveBroadphase();
      _this.CANNON = CANNON;
      return _this;
    } // entry point for a single step of the Simple Physics


    _createClass(CannonPhysicsEngine, [{
      key: "step",
      value: function step(dt, objectFilter) {
        this.world.step(dt || this.options.dt);
      }
    }, {
      key: "addSphere",
      value: function addSphere(radius, mass) {
        var shape = new CANNON.Sphere(radius);
        var body = new CANNON.Body({
          mass: mass,
          shape: shape
        });
        body.position.set(0, 0, 0);
        this.world.addBody(body);
        return body;
      }
    }, {
      key: "addBox",
      value: function addBox(x, y, z, mass, friction) {
        var shape = new CANNON.Box(new CANNON.Vec3(x, y, z));
        var options = {
          mass: mass,
          shape: shape
        };
        if (friction !== undefined) options.material = new CANNON.Material({
          friction: friction
        });
        var body = new CANNON.Body(options);
        body.position.set(0, 0, 0);
        this.world.addBody(body);
        return body;
      }
    }, {
      key: "addCylinder",
      value: function addCylinder(radiusTop, radiusBottom, height, numSegments, mass) {
        var shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments);
        var body = new CANNON.Body({
          mass: mass,
          shape: shape
        });
        this.world.addBody(body);
        return body;
      }
    }, {
      key: "removeObject",
      value: function removeObject(obj) {
        this.world.removeBody(obj);
      }
    }]);

    return CannonPhysicsEngine;
  }(PhysicsEngine);

  /**
   * A ThreeVector is a geometric object which is completely described
   * by three values.
   */

  var ThreeVector =
  /*#__PURE__*/
  function (_Serializable) {
    _inherits(ThreeVector, _Serializable);

    _createClass(ThreeVector, null, [{
      key: "netScheme",
      get: function get() {
        return {
          x: {
            type: BaseTypes.TYPES.FLOAT32
          },
          y: {
            type: BaseTypes.TYPES.FLOAT32
          },
          z: {
            type: BaseTypes.TYPES.FLOAT32
          }
        };
      }
      /**
      * Creates an instance of a ThreeVector.
      * @param {Number} x - first value
      * @param {Number} y - second value
      * @param {Number} z - second value
      * @return {ThreeVector} v - the new ThreeVector
      */

    }]);

    function ThreeVector(x, y, z) {
      var _this;

      _classCallCheck(this, ThreeVector);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ThreeVector).call(this));
      _this.x = x;
      _this.y = y;
      _this.z = z;
      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }
    /**
     * Formatted textual description of the ThreeVector.
     * @return {String} description
     */


    _createClass(ThreeVector, [{
      key: "toString",
      value: function toString() {
        function round3(x) {
          return Math.round(x * 1000) / 1000;
        }

        return "[".concat(round3(this.x), ", ").concat(round3(this.y), ", ").concat(round3(this.z), "]");
      }
      /**
       * Multiply this ThreeVector by a scalar
       *
       * @param {Number} s the scale
       * @return {ThreeVector} returns self
       */

    }, {
      key: "multiplyScalar",
      value: function multiplyScalar(s) {
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

    }, {
      key: "length",
      value: function length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      }
      /**
       * Add other vector to this vector
       *
       * @param {ThreeVector} other the other vector
       * @return {ThreeVector} returns self
       */

    }, {
      key: "add",
      value: function add(other) {
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

    }, {
      key: "subtract",
      value: function subtract(other) {
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

    }, {
      key: "normalize",
      value: function normalize() {
        this.multiplyScalar(1 / this.length());
        return this;
      }
      /**
       * Copy values from another ThreeVector into this ThreeVector
       *
       * @param {ThreeVector} sourceObj the other vector
       * @return {ThreeVector} returns self
       */

    }, {
      key: "copy",
      value: function copy(sourceObj) {
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

    }, {
      key: "set",
      value: function set(x, y, z) {
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

    }, {
      key: "clone",
      value: function clone() {
        return new ThreeVector(this.x, this.y, this.z);
      }
      /**
       * Apply in-place lerp (linear interpolation) to this ThreeVector
       * towards another ThreeVector
       * @param {ThreeVector} target the target vector
       * @param {Number} p The percentage to interpolate
       * @return {ThreeVector} returns self
       */

    }, {
      key: "lerp",
      value: function lerp(target, p) {
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

    }, {
      key: "getBendingDelta",
      value: function getBendingDelta(target, options) {
        var increment = target.clone();
        increment.subtract(this);
        increment.multiplyScalar(options.percent); // check for max case

        if (options.max && increment.length() > options.max || options.max && increment.length() < options.min) {
          return new ThreeVector(0, 0, 0);
        } // divide into increments


        increment.multiplyScalar(1 / options.increments);
        return increment;
      }
    }, {
      key: "toJSON",
      value: function toJSON() {
        return {
          x: this.x,
          y: this.y,
          z: this.z
        };
      }
    }]);

    return ThreeVector;
  }(Serializable);

  var MAX_DEL_THETA = 0.2;
  /**
   * A Quaternion is a geometric object which can be used to
   * represent a three-dimensional rotation.
   */

  var Quaternion =
  /*#__PURE__*/
  function (_Serializable) {
    _inherits(Quaternion, _Serializable);

    _createClass(Quaternion, null, [{
      key: "netScheme",
      get: function get() {
        return {
          w: {
            type: BaseTypes.TYPES.FLOAT32
          },
          x: {
            type: BaseTypes.TYPES.FLOAT32
          },
          y: {
            type: BaseTypes.TYPES.FLOAT32
          },
          z: {
            type: BaseTypes.TYPES.FLOAT32
          }
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

    }]);

    function Quaternion(w, x, y, z) {
      var _this;

      _classCallCheck(this, Quaternion);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Quaternion).call(this));
      _this.w = w;
      _this.x = x;
      _this.y = y;
      _this.z = z;
      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }
    /**
     * Formatted textual description of the Quaternion.
     * @return {String} description
     */


    _createClass(Quaternion, [{
      key: "toString",
      value: function toString() {
        function round3(x) {
          return Math.round(x * 1000) / 1000;
        }

        {
          var axisAngle = this.toAxisAngle();
          return "[".concat(round3(axisAngle.angle), ",").concat(axisAngle.axis.toString(), "]");
        }

        return "[".concat(round3(this.w), ", ").concat(round3(this.x), ", ").concat(round3(this.y), ", ").concat(round3(this.z), "]");
      }
      /**
       * copy values from another quaternion into this quaternion
       *
       * @param {Quaternion} sourceObj the quaternion to copy from
       * @return {Quaternion} returns self
       */

    }, {
      key: "copy",
      value: function copy(sourceObj) {
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

    }, {
      key: "set",
      value: function set(w, x, y, z) {
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

    }, {
      key: "toAxisAngle",
      value: function toAxisAngle() {
        // assuming quaternion normalised then w is less than 1, so term always positive.
        var axis = new ThreeVector(1, 0, 0);
        this.normalize();
        var angle = 2 * Math.acos(this.w);
        var s = Math.sqrt(1 - this.w * this.w);

        if (s > 0.001) {
          var divS = 1 / s;
          axis.x = this.x * divS;
          axis.y = this.y * divS;
          axis.z = this.z * divS;
        }

        if (s > Math.PI) {
          s -= 2 * Math.PI;
        }

        return {
          axis: axis,
          angle: angle
        };
      }
    }, {
      key: "normalize",
      value: function normalize() {
        var l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);

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

    }, {
      key: "setFromAxisAngle",
      value: function setFromAxisAngle(axis, angle) {
        if (angle < 0) angle += Math.PI * 2;
        var halfAngle = angle * 0.5;
        var s = Math.sin(halfAngle);
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

    }, {
      key: "conjugate",
      value: function conjugate() {
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

    }, {
      key: "multiply",
      value: function multiply(other) {
        var aw = this.w,
            ax = this.x,
            ay = this.y,
            az = this.z;
        var bw = other.w,
            bx = other.x,
            by = other.y,
            bz = other.z;
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

    }, {
      key: "slerp",
      value: function slerp(target, bending) {
        if (bending <= 0) return this;
        if (bending >= 1) return this.copy(target);
        var aw = this.w,
            ax = this.x,
            ay = this.y,
            az = this.z;
        var bw = target.w,
            bx = target.x,
            by = target.y,
            bz = target.z;
        var cosHalfTheta = aw * bw + ax * bx + ay * by + az * bz;

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

        var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

        if (sqrSinHalfTheta < Number.EPSILON) {
          var s = 1 - bending;
          this.set(s * aw + bending * this.w, s * ax + bending * this.x, s * ay + bending * this.y, s * az + bending * this.z);
          return this.normalize();
        }

        var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
        var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
        var delTheta = bending * halfTheta;
        if (Math.abs(delTheta) > MAX_DEL_THETA) delTheta = MAX_DEL_THETA * Math.sign(delTheta);
        var ratioA = Math.sin(halfTheta - delTheta) / sinHalfTheta;
        var ratioB = Math.sin(delTheta) / sinHalfTheta;
        this.set(aw * ratioA + this.w * ratioB, ax * ratioA + this.x * ratioB, ay * ratioA + this.y * ratioB, az * ratioA + this.z * ratioB);
        return this;
      }
      /* eslint-enable */

    }]);

    return Quaternion;
  }(Serializable);

  /**
   * GameObject is the base class of all game objects.
   * It is created only for the purpose of clearly defining the game
   * object interface.
   * Game developers will use one of the subclasses such as DynamicObject,
   * or PhysicalObject.
   */

  var GameObject =
  /*#__PURE__*/
  function (_Serializable) {
    _inherits(GameObject, _Serializable);

    _createClass(GameObject, null, [{
      key: "netScheme",
      get: function get() {
        return {
          id: {
            type: BaseTypes.TYPES.STRING
          },
          playerId: {
            type: BaseTypes.TYPES.STRING
          }
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

    }]);

    function GameObject(gameEngine, options, props) {
      var _this;

      _classCallCheck(this, GameObject);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(GameObject).call(this));
      /**
       * The gameEngine this object will be used in
       * @member {GameEngine}
       */

      _this.gameEngine = gameEngine;
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

      _this.id = null;
      _this.playerId = props && props.playerId ? props.playerId : 0;
      if (options && 'id' in options) _this.id = options.id;else if (_this.gameEngine) _this.id = _this.playerId || _this.gameEngine.world.getNewId();
      /**
      * playerId of player who created this object
      * @member {Number}
      */

      _this.components = {};
      return _this;
    }
    /**
     * Called after the object is added to to the game world.
     * This is the right place to add renderer sub-objects, physics sub-objects
     * and any other resources that should be created
     * @param {GameEngine} gameEngine the game engine
     */


    _createClass(GameObject, [{
      key: "onAddToWorld",
      value: function onAddToWorld(gameEngine) {}
      /**
       * Called after the object is removed from game-world.
       * This is where renderer sub-objects and any other resources should be freed
       * @param {GameEngine} gameEngine the game engine
       */

    }, {
      key: "onRemoveFromWorld",
      value: function onRemoveFromWorld(gameEngine) {}
      /**
       * Formatted textual description of the game object.
       * @return {String} description - a string description
       */

    }, {
      key: "toString",
      value: function toString() {
        return "game-object[".concat(this.id, "]");
      }
      /**
       * Formatted textual description of the game object's current bending properties.
       * @return {String} description - a string description
       */

    }, {
      key: "bendingToString",
      value: function bendingToString() {
        return 'no bending';
      }
    }, {
      key: "saveState",
      value: function saveState(other) {
        this.savedCopy = new this.constructor(this.gameEngine, {
          id: null
        });
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

    }, {
      key: "bendToCurrentState",
      // TODO:
      // rather than pass worldSettings on each bend, they could
      // be passed in on the constructor just once.
      value: function bendToCurrentState(bending, worldSettings, isLocal, bendingIncrements) {
        if (this.savedCopy) {
          this.bendToCurrent(this.savedCopy, bending, worldSettings, isLocal, bendingIncrements);
        }

        this.savedCopy = null;
      }
    }, {
      key: "bendToCurrent",
      value: function bendToCurrent(original, bending, worldSettings, isLocal, bendingIncrements) {}
      /**
       * synchronize this object to the state of an other object, by copying all the netscheme variables.
       * This is used by the synchronizer to create temporary objects, and must be implemented by all sub-classes as well.
       * @param {GameObject} other the other object to synchronize to
       */

    }, {
      key: "syncTo",
      value: function syncTo(other) {
        _get(_getPrototypeOf(GameObject.prototype), "syncTo", this).call(this, other);

        this.playerId = other.playerId;
      } // copy physical attributes to physics sub-object

    }, {
      key: "refreshToPhysics",
      value: function refreshToPhysics() {} // copy physical attributes from physics sub-object

    }, {
      key: "refreshFromPhysics",
      value: function refreshFromPhysics() {} // apply a single bending increment

    }, {
      key: "applyIncrementalBending",
      value: function applyIncrementalBending() {} // clean up resources

    }, {
      key: "destroy",
      value: function destroy() {}
    }, {
      key: "addComponent",
      value: function addComponent(componentInstance) {
        componentInstance.parentObject = this;
        this.components[componentInstance.constructor.name] = componentInstance; // a gameEngine might not exist if this class is instantiated by the serializer

        if (this.gameEngine) {
          this.gameEngine.emit('componentAdded', this, componentInstance);
        }
      }
    }, {
      key: "removeComponent",
      value: function removeComponent(componentName) {
        // todo cleanup of the component ?
        delete this.components[componentName]; // a gameEngine might not exist if this class is instantiated by the serializer

        if (this.gameEngine) {
          this.gameEngine.emit('componentRemoved', this, componentName);
        }
      }
      /**
       * Check whether this game object has a certain component
       * @param {Object} componentClass the comp
       * @return {Boolean} true if the gameObject contains this component
       */

    }, {
      key: "hasComponent",
      value: function hasComponent(componentClass) {
        return componentClass.name in this.components;
      }
    }, {
      key: "getComponent",
      value: function getComponent(componentClass) {
        return this.components[componentClass.name];
      }
    }, {
      key: "bending",
      get: function get() {
        return {
          position: {
            percent: 1.0,
            min: 0.0
          },
          velocity: {
            percent: 0.0,
            min: 0.0
          },
          angularVelocity: {
            percent: 0.0
          },
          angleLocal: {
            percent: 1.0
          }
        };
      }
    }]);

    return GameObject;
  }(Serializable);

  var MathUtils =
  /*#__PURE__*/
  function () {
    function MathUtils() {
      _classCallCheck(this, MathUtils);
    }

    _createClass(MathUtils, null, [{
      key: "interpolate",
      // interpolate from start to end, advancing "percent" of the way
      value: function interpolate(start, end, percent) {
        return (end - start) * percent + start;
      } // interpolate from start to end, advancing "percent" of the way
      //
      // returns just the delta. i.e. the value that must be added to the start value

    }, {
      key: "interpolateDelta",
      value: function interpolateDelta(start, end, percent) {
        return (end - start) * percent;
      } // interpolate from start to end, advancing "percent" of the way
      // and noting that the dimension wraps around {x >= wrapMin, x < wrapMax}
      //
      // returns just the delta. i.e. the value that must be added to the start value

    }, {
      key: "interpolateDeltaWithWrapping",
      value: function interpolateDeltaWithWrapping(start, end, percent, wrapMin, wrapMax) {
        var wrapTest = wrapMax - wrapMin;
        if (start - end > wrapTest / 2) end += wrapTest;else if (end - start > wrapTest / 2) start += wrapTest;

        if (Math.abs(start - end) > wrapTest / 3) {
          console.log('wrap interpolation is close to limit.  Not sure which edge to wrap to.');
        }

        return (end - start) * percent;
      }
    }, {
      key: "interpolateWithWrapping",
      value: function interpolateWithWrapping(start, end, percent, wrapMin, wrapMax) {
        var interpolatedVal = start + this.interpolateDeltaWithWrapping(start, end, percent, wrapMin, wrapMax);
        var wrapLength = wrapMax - wrapMin;
        if (interpolatedVal >= wrapLength) interpolatedVal -= wrapLength;
        if (interpolatedVal < 0) interpolatedVal += wrapLength;
        return interpolatedVal;
      }
    }]);

    return MathUtils;
  }();

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

  var DynamicObject =
  /*#__PURE__*/
  function (_GameObject) {
    _inherits(DynamicObject, _GameObject);

    _createClass(DynamicObject, null, [{
      key: "netScheme",

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
      get: function get() {
        return Object.assign({
          position: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          },
          width: {
            type: BaseTypes.TYPES.INT16
          },
          height: {
            type: BaseTypes.TYPES.INT16
          },
          isStatic: {
            type: BaseTypes.TYPES.UINT8
          },
          velocity: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          },
          angle: {
            type: BaseTypes.TYPES.FLOAT32
          }
        }, _get(_getPrototypeOf(DynamicObject), "netScheme", this));
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

    }]);

    function DynamicObject(gameEngine, options, props) {
      var _this;

      _classCallCheck(this, DynamicObject);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(DynamicObject).call(this, gameEngine, options, props));
      _this.bendingIncrements = 0;
      _this.velocity = new TwoVector(0, 0);
      /**
       * Object width for collision detection purposes. Default is 1
       * @member {Number}
       */

      _this.width = props && props.width ? props.width : 1;
      /**
       * Object height for collision detection purposes. Default is 1
       * @member {Number}
       */

      _this.height = props && props.height ? props.height : 1;
      /**
       * Determine if the object is static (i.e. it never moves, like a wall). The value 0 implies the object is dynamic.  Default is 0 (dynamic).
       * @member {Number}
       */

      _this.isStatic = props && props.isStatic ? props.isStatic : 0;
      /**
       * The friction coefficient. Velocity is multiplied by this for each step. Default is (1,1)
       * @member {TwoVector}
       */

      _this.friction = new TwoVector(1, 1);
      /**
      * position
      * @member {TwoVector}
      */

      if (props && props.position) _this.position.copy(props.position);
      /**
      * velocity
      * @member {TwoVector}
      */

      if (props && props.velocity) _this.velocity.copy(props.velocity);
      /**
      * object orientation angle in degrees
      * @member {Number}
      */

      _this.angle = 90;
      /**
      * @deprecated since version 3.0.8
      * should rotate left by {@link DynamicObject#rotationSpeed} on next step
      * @member {Boolean}
      */

      _this.isRotatingLeft = false;
      /**
      * @deprecated since version 3.0.8
      * should rotate right by {@link DynamicObject#rotationSpeed} on next step
      * @member {Boolean}
      */

      _this.isRotatingRight = false;
      /**
      * @deprecated since version 3.0.8
      * should accelerate by {@link DynamicObject#acceleration} on next step
      * @member {Boolean}
      */

      _this.isAccelerating = false;
      /**
      * @deprecated since version 3.0.8
      * angle rotation per step
      * @member {Number}
      */

      _this.rotationSpeed = 2.5;
      /**
      * @deprecated since version 3.0.8
      * acceleration per step
      * @member {Number}
      */

      _this.acceleration = 0.1;
      _this.deceleration = 0.99;
      return _this;
    } // convenience getters


    _createClass(DynamicObject, [{
      key: "toString",

      /**
       * Formatted textual description of the dynamic object.
       * The output of this method is used to describe each instance in the traces,
       * which significantly helps in debugging.
       *
       * @return {String} description - a string describing the DynamicObject
       */
      value: function toString() {
        function round3(x) {
          return Math.round(x * 1000) / 1000;
        }

        return "".concat(this.constructor.name, "[").concat(this.id, "] player").concat(this.playerId, " Pos=").concat(this.position, " Vel=").concat(this.velocity, " angle").concat(round3(this.angle));
      }
      /**
       * Each object class can define its own bending overrides.
       * return an object which can include attributes: position, velocity,
       * and angle.  In each case, you can specify a min value, max
       * value, and a percent value.  { @see GameObject.bending }
       *
       * @return {Object} bending - an object with bending paramters
       */

    }, {
      key: "turnRight",

      /**
      * turn object clock-wise
      * @param {Number} deltaAngle - the angle to turn, in degrees
      * @return {DynamicObject} return this object
      */
      value: function turnRight(deltaAngle) {
        this.angle += deltaAngle;

        if (this.angle >= 360) {
          this.angle -= 360;
        }

        if (this.angle < 0) {
          this.angle += 360;
        }

        return this;
      }
      /**
      * turn object counter-clock-wise
      * @param {Number} deltaAngle - the angle to turn, in degrees
      * @return {DynamicObject} return this object
      */

    }, {
      key: "turnLeft",
      value: function turnLeft(deltaAngle) {
        return this.turnRight(-deltaAngle);
      }
      /**
      * accelerate along the direction that the object is facing
      * @param {Number} acceleration - the acceleration
      * @return {DynamicObject} return this object
      */

    }, {
      key: "accelerate",
      value: function accelerate(acceleration) {
        var rad = this.angle * (Math.PI / 180);
        var dv = new TwoVector(Math.cos(rad), Math.sin(rad));
        dv.multiplyScalar(acceleration);
        this.velocity.add(dv);
        return this;
      }
      /**
       * Formatted textual description of the game object's current bending properties.
       * @return {String} description - a string description
       */

    }, {
      key: "bendingToString",
      value: function bendingToString() {
        if (this.bendingIncrements) return "\u0394Pos=".concat(this.bendingPositionDelta, " \u0394Vel=").concat(this.bendingVelocityDelta, " \u0394Angle=").concat(this.bendingAngleDelta, " increments=").concat(this.bendingIncrements);
        return 'no bending';
      }
      /**
      * The maximum velocity allowed.  If returns null then ignored.
      * @memberof DynamicObject
      * @member {Number} maxSpeed
      */

    }, {
      key: "syncTo",

      /**
      * Copy the netscheme variables from another DynamicObject.
      * This is used by the synchronizer to create temporary objects, and must be implemented by all sub-classes as well.
      * @param {DynamicObject} other DynamicObject
      */
      value: function syncTo(other) {
        _get(_getPrototypeOf(DynamicObject.prototype), "syncTo", this).call(this, other);

        this.position.copy(other.position);
        this.velocity.copy(other.velocity);
        this.width = other.width;
        this.height = other.height;
        this.bendingAngle = other.bendingAngle;
        this.rotationSpeed = other.rotationSpeed;
        this.acceleration = other.acceleration;
        this.deceleration = other.deceleration;
      }
    }, {
      key: "bendToCurrent",
      value: function bendToCurrent(original, percent, worldSettings, isLocal, increments) {
        var bending = {
          increments: increments,
          percent: percent
        }; // if the object has defined a bending multiples for this object, use them

        var positionBending = Object.assign({}, bending, this.bending.position);
        var velocityBending = Object.assign({}, bending, this.bending.velocity);
        var angleBending = Object.assign({}, bending, this.bending.angle);

        if (isLocal) {
          Object.assign(positionBending, this.bending.positionLocal);
          Object.assign(velocityBending, this.bending.velocityLocal);
          Object.assign(angleBending, this.bending.angleLocal);
        } // get the incremental delta position & velocity


        this.incrementScale = percent / increments;
        this.bendingPositionDelta = original.position.getBendingDelta(this.position, positionBending);
        this.bendingVelocityDelta = original.velocity.getBendingDelta(this.velocity, velocityBending);
        this.bendingAngleDelta = MathUtils.interpolateDeltaWithWrapping(original.angle, this.angle, angleBending.percent, 0, 360) / increments;
        this.bendingTarget = new this.constructor();
        this.bendingTarget.syncTo(this); // revert to original

        this.position.copy(original.position);
        this.velocity.copy(original.velocity);
        this.angle = original.angle; // keep parameters

        this.bendingIncrements = increments;
        this.bendingOptions = bending;
      }
    }, {
      key: "applyIncrementalBending",
      value: function applyIncrementalBending(stepDesc) {
        if (this.bendingIncrements === 0) return;
        var timeFactor = 1;
        if (stepDesc && stepDesc.dt) timeFactor = stepDesc.dt / (1000 / 60);
        var posDelta = this.bendingPositionDelta.clone().multiplyScalar(timeFactor);
        var velDelta = this.bendingVelocityDelta.clone().multiplyScalar(timeFactor);
        this.position.add(posDelta);
        this.velocity.add(velDelta);
        this.angle += this.bendingAngleDelta * timeFactor;
        this.bendingIncrements--;
      }
    }, {
      key: "getAABB",
      value: function getAABB() {
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

    }, {
      key: "collidesWith",
      value: function collidesWith(other) {
        return true;
      }
    }, {
      key: "x",
      get: function get() {
        return this.position.x;
      }
    }, {
      key: "y",
      get: function get() {
        return this.position.y;
      }
    }, {
      key: "bending",
      get: function get() {
        return {// example:
          // position: { percent: 0.8, min: 0.0, max: 4.0 },
          // velocity: { percent: 0.4, min: 0.0 },
          // angleLocal: { percent: 0.0 }
        };
      }
    }, {
      key: "maxSpeed",
      get: function get() {
        return null;
      }
    }]);

    return DynamicObject;
  }(GameObject);

  /**
   * The PhysicalObject2D is the base class for physical game objects in 2D Physics
   */

  var PhysicalObject2D =
  /*#__PURE__*/
  function (_GameObject) {
    _inherits(PhysicalObject2D, _GameObject);

    _createClass(PhysicalObject2D, null, [{
      key: "netScheme",

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
      get: function get() {
        return Object.assign({
          mass: {
            type: BaseTypes.TYPES.FLOAT32
          },
          position: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          },
          angle: {
            type: BaseTypes.TYPES.FLOAT32
          },
          velocity: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          },
          angularVelocity: {
            type: BaseTypes.TYPES.FLOAT32
          }
        }, _get(_getPrototypeOf(PhysicalObject2D), "netScheme", this));
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

    }]);

    function PhysicalObject2D(gameEngine, options, props) {
      var _this;

      _classCallCheck(this, PhysicalObject2D);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(PhysicalObject2D).call(this, gameEngine, options, props));
      _this.bendingIncrements = 0; // set default position, velocity and quaternion

      _this.position = new TwoVector(0, 0);
      _this.velocity = new TwoVector(0, 0);
      _this.angle = 0;
      _this.angularVelocity = 0;
      _this.mass = 0; // use values if provided

      props = props || {};
      if (props.position) _this.position.copy(props.position);
      if (props.velocity) _this.velocity.copy(props.velocity);
      if (props.angle) _this.angle = props.angle;
      if (props.angularVelocity) _this.angularVelocity = props.angularVelocity;
      if (props.mass) _this.mass = props.mass;
      _this.class = PhysicalObject2D;
      return _this;
    }
    /**
     * Called after the object is added to to the game world.
     * This is the right place to add renderer sub-objects, physics sub-objects
     * and any other resources that should be created
     */


    _createClass(PhysicalObject2D, [{
      key: "onAddToWorld",
      value: function onAddToWorld() {}
      /**
       * Formatted textual description of the dynamic object.
       * The output of this method is used to describe each instance in the traces,
       * which significantly helps in debugging.
       *
       * @return {String} description - a string describing the PhysicalObject2D
       */

    }, {
      key: "toString",
      value: function toString() {
        var p = this.position.toString();
        var v = this.velocity.toString();
        var a = this.angle;
        var av = this.angularVelocity;
        return "phyObj2D[".concat(this.id, "] player").concat(this.playerId, " Pos=").concat(p, " Vel=").concat(v, " Ang=").concat(a, " AVel=").concat(av);
      }
      /**
       * Each object class can define its own bending overrides.
       * return an object which can include attributes: position, velocity,
       * angle, and angularVelocity.  In each case, you can specify a min value, max
       * value, and a percent value.
       *
       * @return {Object} bending - an object with bending paramters
       */

    }, {
      key: "bendingToString",
      // display object's physical attributes as a string
      // for debugging purposes mostly
      value: function bendingToString() {
        if (this.bendingIncrements) return "\u0394Pos=".concat(this.bendingPositionDelta, " \u0394Vel=").concat(this.bendingVelocityDelta, " \u0394Angle=").concat(this.bendingAngleDelta, " increments=").concat(this.bendingIncrements);
        return 'no bending';
      } // derive and save the bending increment parameters:
      // - bendingPositionDelta
      // - bendingVelocityDelta
      // - bendingAVDelta
      // - bendingAngleDelta
      // these can later be used to "bend" incrementally from the state described
      // by "original" to the state described by "self"

    }, {
      key: "bendToCurrent",
      value: function bendToCurrent(original, percent, worldSettings, isLocal, increments) {
        var bending = {
          increments: increments,
          percent: percent
        }; // if the object has defined a bending multiples for this object, use them

        var positionBending = Object.assign({}, bending, this.bending.position);
        var velocityBending = Object.assign({}, bending, this.bending.velocity);
        var angleBending = Object.assign({}, bending, this.bending.angle);
        var avBending = Object.assign({}, bending, this.bending.angularVelocity); // check for local object overrides to bendingTarget

        if (isLocal) {
          Object.assign(positionBending, this.bending.positionLocal);
          Object.assign(velocityBending, this.bending.velocityLocal);
          Object.assign(angleBending, this.bending.angleLocal);
          Object.assign(avBending, this.bending.angularVelocityLocal);
        } // get the incremental delta position & velocity


        this.incrementScale = percent / increments;
        this.bendingPositionDelta = original.position.getBendingDelta(this.position, positionBending);
        this.bendingVelocityDelta = original.velocity.getBendingDelta(this.velocity, velocityBending); // get the incremental angular-velocity

        this.bendingAVDelta = (this.angularVelocity - original.angularVelocity) * this.incrementScale * avBending.percent; // get the incremental angle correction

        this.bendingAngleDelta = MathUtils.interpolateDeltaWithWrapping(original.angle, this.angle, angleBending.percent, 0, 2 * Math.PI) / increments;
        this.bendingTarget = new this.constructor();
        this.bendingTarget.syncTo(this); // revert to original

        this.position.copy(original.position);
        this.angle = original.angle;
        this.angularVelocity = original.angularVelocity;
        this.velocity.copy(original.velocity);
        this.bendingIncrements = increments;
        this.bendingOptions = bending;
        this.refreshToPhysics();
      }
    }, {
      key: "syncTo",
      value: function syncTo(other, options) {
        _get(_getPrototypeOf(PhysicalObject2D.prototype), "syncTo", this).call(this, other);

        this.position.copy(other.position);
        this.angle = other.angle;
        this.angularVelocity = other.angularVelocity;

        if (!options || !options.keepVelocity) {
          this.velocity.copy(other.velocity);
        }

        if (this.physicsObj) this.refreshToPhysics();
      } // update position, angle, angular velocity, and velocity from new physical state.

    }, {
      key: "refreshFromPhysics",
      value: function refreshFromPhysics() {
        this.copyVector(this.physicsObj.position, this.position);
        this.copyVector(this.physicsObj.velocity, this.velocity);
        this.angle = this.physicsObj.angle;
        this.angularVelocity = this.physicsObj.angularVelocity;
      } // generic vector copy.  We need this because different
      // physics engines have different implementations.
      // TODO: Better implementation: the physics engine implementor
      // should define copyFromLanceVector and copyToLanceVector

    }, {
      key: "copyVector",
      value: function copyVector(source, target) {
        var sourceVec = source;
        if (typeof source[0] === 'number' && typeof source[1] === 'number') sourceVec = {
          x: source[0],
          y: source[1]
        };

        if (typeof target.copy === 'function') {
          target.copy(sourceVec);
        } else if (target instanceof Float32Array) {
          target[0] = sourceVec.x;
          target[1] = sourceVec.y;
        } else {
          target.x = sourceVec.x;
          target.y = sourceVec.y;
        }
      } // update position, angle, angular velocity, and velocity from new game state.

    }, {
      key: "refreshToPhysics",
      value: function refreshToPhysics() {
        this.copyVector(this.position, this.physicsObj.position);
        this.copyVector(this.velocity, this.physicsObj.velocity);
        this.physicsObj.angle = this.angle;
        this.physicsObj.angularVelocity = this.angularVelocity;
      } // apply one increment of bending

    }, {
      key: "applyIncrementalBending",
      value: function applyIncrementalBending(stepDesc) {
        if (this.bendingIncrements === 0) return;
        var timeFactor = 1;
        if (stepDesc && stepDesc.dt) timeFactor = stepDesc.dt / (1000 / 60);
        var posDelta = this.bendingPositionDelta.clone().multiplyScalar(timeFactor);
        var velDelta = this.bendingVelocityDelta.clone().multiplyScalar(timeFactor);
        this.position.add(posDelta);
        this.velocity.add(velDelta);
        this.angularVelocity += this.bendingAVDelta * timeFactor;
        this.angle += this.bendingAngleDelta * timeFactor;
        this.bendingIncrements--;
      } // interpolate implementation

    }, {
      key: "interpolate",
      value: function interpolate(nextObj, percent) {
        // slerp to target position
        this.position.lerp(nextObj.position, percent);
        this.angle = MathUtils.interpolateDeltaWithWrapping(this.angle, nextObj.angle, percent, 0, 2 * Math.PI);
      }
    }, {
      key: "bending",
      get: function get() {
        return {// example:
          // position: { percent: 0.8, min: 0.0, max: 4.0 },
          // velocity: { percent: 0.4, min: 0.0 },
          // angularVelocity: { percent: 0.0 },
          // angleLocal: { percent: 0.0 }
        };
      }
    }]);

    return PhysicalObject2D;
  }(GameObject);

  /**
   * The PhysicalObject3D is the base class for physical game objects
   */

  var PhysicalObject3D =
  /*#__PURE__*/
  function (_GameObject) {
    _inherits(PhysicalObject3D, _GameObject);

    _createClass(PhysicalObject3D, null, [{
      key: "netScheme",

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
      get: function get() {
        return Object.assign({
          position: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          },
          quaternion: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          },
          velocity: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          },
          angularVelocity: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          }
        }, _get(_getPrototypeOf(PhysicalObject3D), "netScheme", this));
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

    }]);

    function PhysicalObject3D(gameEngine, options, props) {
      var _this;

      _classCallCheck(this, PhysicalObject3D);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(PhysicalObject3D).call(this, gameEngine, options, props));
      _this.bendingIncrements = 0; // set default position, velocity and quaternion

      _this.position = new ThreeVector(0, 0, 0);
      _this.velocity = new ThreeVector(0, 0, 0);
      _this.quaternion = new Quaternion(1, 0, 0, 0);
      _this.angularVelocity = new ThreeVector(0, 0, 0); // use values if provided

      props = props || {};
      if (props.position) _this.position.copy(props.position);
      if (props.velocity) _this.velocity.copy(props.velocity);
      if (props.quaternion) _this.quaternion.copy(props.quaternion);
      if (props.angularVelocity) _this.angularVelocity.copy(props.angularVelocity);
      _this.class = PhysicalObject3D;
      return _this;
    }
    /**
     * Formatted textual description of the dynamic object.
     * The output of this method is used to describe each instance in the traces,
     * which significantly helps in debugging.
     *
     * @return {String} description - a string describing the PhysicalObject3D
     */


    _createClass(PhysicalObject3D, [{
      key: "toString",
      value: function toString() {
        var p = this.position.toString();
        var v = this.velocity.toString();
        var q = this.quaternion.toString();
        var a = this.angularVelocity.toString();
        return "phyObj[".concat(this.id, "] player").concat(this.playerId, " Pos").concat(p, " Vel").concat(v, " Dir").concat(q, " AVel").concat(a);
      } // display object's physical attributes as a string
      // for debugging purposes mostly

    }, {
      key: "bendingToString",
      value: function bendingToString() {
        if (this.bendingOptions) return "bend=".concat(this.bendingOptions.percent, " deltaPos=").concat(this.bendingPositionDelta, " deltaVel=").concat(this.bendingVelocityDelta, " deltaQuat=").concat(this.bendingQuaternionDelta);
        return 'no bending';
      } // derive and save the bending increment parameters:
      // - bendingPositionDelta
      // - bendingAVDelta
      // - bendingQuaternionDelta
      // these can later be used to "bend" incrementally from the state described
      // by "original" to the state described by "self"

    }, {
      key: "bendToCurrent",
      value: function bendToCurrent(original, percent, worldSettings, isLocal, increments) {
        var bending = {
          increments: increments,
          percent: percent
        }; // if the object has defined a bending multiples for this object, use them

        var positionBending = Object.assign({}, bending, this.bending.position);
        var velocityBending = Object.assign({}, bending, this.bending.velocity); // check for local object overrides to bendingTarget

        if (isLocal) {
          Object.assign(positionBending, this.bending.positionLocal);
          Object.assign(velocityBending, this.bending.velocityLocal);
        } // get the incremental delta position & velocity


        this.incrementScale = percent / increments;
        this.bendingPositionDelta = original.position.getBendingDelta(this.position, positionBending);
        this.bendingVelocityDelta = original.velocity.getBendingDelta(this.velocity, velocityBending);
        this.bendingAVDelta = new ThreeVector(0, 0, 0); // get the incremental quaternion rotation

        this.bendingQuaternionDelta = new Quaternion().copy(original.quaternion).conjugate();
        this.bendingQuaternionDelta.multiply(this.quaternion);
        var axisAngle = this.bendingQuaternionDelta.toAxisAngle();
        axisAngle.angle *= this.incrementScale;
        this.bendingQuaternionDelta.setFromAxisAngle(axisAngle.axis, axisAngle.angle);
        this.bendingTarget = new this.constructor();
        this.bendingTarget.syncTo(this);
        this.position.copy(original.position);
        this.quaternion.copy(original.quaternion);
        this.angularVelocity.copy(original.angularVelocity);
        this.bendingIncrements = increments;
        this.bendingOptions = bending;
        this.refreshToPhysics();
      }
    }, {
      key: "syncTo",
      value: function syncTo(other, options) {
        _get(_getPrototypeOf(PhysicalObject3D.prototype), "syncTo", this).call(this, other);

        this.position.copy(other.position);
        this.quaternion.copy(other.quaternion);
        this.angularVelocity.copy(other.angularVelocity);

        if (!options || !options.keepVelocity) {
          this.velocity.copy(other.velocity);
        }

        if (this.physicsObj) this.refreshToPhysics();
      } // update position, quaternion, and velocity from new physical state.

    }, {
      key: "refreshFromPhysics",
      value: function refreshFromPhysics() {
        this.position.copy(this.physicsObj.position);
        this.quaternion.copy(this.physicsObj.quaternion);
        this.velocity.copy(this.physicsObj.velocity);
        this.angularVelocity.copy(this.physicsObj.angularVelocity);
      } // update position, quaternion, and velocity from new game state.

    }, {
      key: "refreshToPhysics",
      value: function refreshToPhysics() {
        if (!this.physicsObj) return;
        this.physicsObj.position.copy(this.position);
        this.physicsObj.quaternion.copy(this.quaternion);
        this.physicsObj.velocity.copy(this.velocity);
        this.physicsObj.angularVelocity.copy(this.angularVelocity);
      } // apply one increment of bending

    }, {
      key: "applyIncrementalBending",
      value: function applyIncrementalBending(stepDesc) {
        if (this.bendingIncrements === 0) return;

        if (stepDesc && stepDesc.dt) {
          var timeFactor = stepDesc.dt / (1000 / 60); // TODO: use clone() below.  it's cleaner

          var posDelta = new ThreeVector().copy(this.bendingPositionDelta).multiplyScalar(timeFactor);
          var avDelta = new ThreeVector().copy(this.bendingAVDelta).multiplyScalar(timeFactor);
          this.position.add(posDelta);
          this.angularVelocity.add(avDelta); // one approach to orientation bending is slerp:

          this.quaternion.slerp(this.bendingTarget.quaternion, this.incrementScale * timeFactor * 0.8);
        } else {
          this.position.add(this.bendingPositionDelta);
          this.angularVelocity.add(this.bendingAVDelta);
          this.quaternion.slerp(this.bendingTarget.quaternion, this.incrementScale);
        } // alternative: fixed delta-quaternion correction
        // TODO: adjust quaternion bending to dt timefactor precision
        // this.quaternion.multiply(this.bendingQuaternionDelta);


        this.bendingIncrements--;
      } // interpolate implementation

    }, {
      key: "interpolate",
      value: function interpolate(nextObj, percent) {
        // slerp to target position
        this.position.lerp(nextObj.position, percent);
        this.quaternion.slerp(nextObj.quaternion, percent);
      }
    }]);

    return PhysicalObject3D;
  }(GameObject);

  var lib = {
    Trace: Trace,
    Utils: Utils
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

      uri.pathNames = pathNames(uri, uri['path']);
      uri.queryKey = queryKey(uri, uri['query']);

      return uri;
  };

  function pathNames(obj, path) {
      var regx = /\/{2,9}/g,
          names = path.replace(regx, "/").split("/");

      if (path.substr(0, 1) == '/' || path.length === 0) {
          names.splice(0, 1);
      }
      if (path.substr(path.length - 1, 1) == '/') {
          names.splice(names.length - 1, 1);
      }

      return names;
  }

  function queryKey(uri, query) {
      var data = {};

      query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
          if ($1) {
              data[$1] = $2;
          }
      });

      return data;
  }

  /**
   * Helpers.
   */

  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
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
    } else if (type === 'number' && isFinite(val)) {
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
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
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
      case 'weeks':
      case 'week':
      case 'w':
        return n * w;
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
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + 'd';
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + 'h';
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + 'm';
    }
    if (msAbs >= s) {
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
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, 'second');
    }
    return ms + ' ms';
  }

  /**
   * Pluralization helper.
   */

  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
  }

  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   */

  function setup(env) {
  	createDebug.debug = createDebug;
  	createDebug.default = createDebug;
  	createDebug.coerce = coerce;
  	createDebug.disable = disable;
  	createDebug.enable = enable;
  	createDebug.enabled = enabled;
  	createDebug.humanize = ms;
  	createDebug.destroy = destroy;

  	Object.keys(env).forEach(key => {
  		createDebug[key] = env[key];
  	});

  	/**
  	* The currently active debug mode names, and names to skip.
  	*/

  	createDebug.names = [];
  	createDebug.skips = [];

  	/**
  	* Map of special "%n" handling functions, for the debug "format" argument.
  	*
  	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  	*/
  	createDebug.formatters = {};

  	/**
  	* Selects a color for a debug namespace
  	* @param {String} namespace The namespace string for the for the debug instance to be colored
  	* @return {Number|String} An ANSI color code for the given namespace
  	* @api private
  	*/
  	function selectColor(namespace) {
  		let hash = 0;

  		for (let i = 0; i < namespace.length; i++) {
  			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
  			hash |= 0; // Convert to 32bit integer
  		}

  		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  	}
  	createDebug.selectColor = selectColor;

  	/**
  	* Create a debugger with the given `namespace`.
  	*
  	* @param {String} namespace
  	* @return {Function}
  	* @api public
  	*/
  	function createDebug(namespace) {
  		let prevTime;
  		let enableOverride = null;

  		function debug(...args) {
  			// Disabled?
  			if (!debug.enabled) {
  				return;
  			}

  			const self = debug;

  			// Set `diff` timestamp
  			const curr = Number(new Date());
  			const ms = curr - (prevTime || curr);
  			self.diff = ms;
  			self.prev = prevTime;
  			self.curr = curr;
  			prevTime = curr;

  			args[0] = createDebug.coerce(args[0]);

  			if (typeof args[0] !== 'string') {
  				// Anything else let's inspect with %O
  				args.unshift('%O');
  			}

  			// Apply any `formatters` transformations
  			let index = 0;
  			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
  				// If we encounter an escaped % then don't increase the array index
  				if (match === '%%') {
  					return '%';
  				}
  				index++;
  				const formatter = createDebug.formatters[format];
  				if (typeof formatter === 'function') {
  					const val = args[index];
  					match = formatter.call(self, val);

  					// Now we need to remove `args[index]` since it's inlined in the `format`
  					args.splice(index, 1);
  					index--;
  				}
  				return match;
  			});

  			// Apply env-specific formatting (colors, etc.)
  			createDebug.formatArgs.call(self, args);

  			const logFn = self.log || createDebug.log;
  			logFn.apply(self, args);
  		}

  		debug.namespace = namespace;
  		debug.useColors = createDebug.useColors();
  		debug.color = createDebug.selectColor(namespace);
  		debug.extend = extend;
  		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

  		Object.defineProperty(debug, 'enabled', {
  			enumerable: true,
  			configurable: false,
  			get: () => enableOverride === null ? createDebug.enabled(namespace) : enableOverride,
  			set: v => {
  				enableOverride = v;
  			}
  		});

  		// Env-specific initialization logic for debug instances
  		if (typeof createDebug.init === 'function') {
  			createDebug.init(debug);
  		}

  		return debug;
  	}

  	function extend(namespace, delimiter) {
  		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  		newDebug.log = this.log;
  		return newDebug;
  	}

  	/**
  	* Enables a debug mode by namespaces. This can include modes
  	* separated by a colon and wildcards.
  	*
  	* @param {String} namespaces
  	* @api public
  	*/
  	function enable(namespaces) {
  		createDebug.save(namespaces);

  		createDebug.names = [];
  		createDebug.skips = [];

  		let i;
  		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  		const len = split.length;

  		for (i = 0; i < len; i++) {
  			if (!split[i]) {
  				// ignore empty strings
  				continue;
  			}

  			namespaces = split[i].replace(/\*/g, '.*?');

  			if (namespaces[0] === '-') {
  				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
  			} else {
  				createDebug.names.push(new RegExp('^' + namespaces + '$'));
  			}
  		}
  	}

  	/**
  	* Disable debug output.
  	*
  	* @return {String} namespaces
  	* @api public
  	*/
  	function disable() {
  		const namespaces = [
  			...createDebug.names.map(toNamespace),
  			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
  		].join(',');
  		createDebug.enable('');
  		return namespaces;
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

  		let i;
  		let len;

  		for (i = 0, len = createDebug.skips.length; i < len; i++) {
  			if (createDebug.skips[i].test(name)) {
  				return false;
  			}
  		}

  		for (i = 0, len = createDebug.names.length; i < len; i++) {
  			if (createDebug.names[i].test(name)) {
  				return true;
  			}
  		}

  		return false;
  	}

  	/**
  	* Convert regexp to namespace
  	*
  	* @param {RegExp} regxep
  	* @return {String} namespace
  	* @api private
  	*/
  	function toNamespace(regexp) {
  		return regexp.toString()
  			.substring(2, regexp.toString().length - 2)
  			.replace(/\.\*\?$/, '*');
  	}

  	/**
  	* Coerce `val`.
  	*
  	* @param {Mixed} val
  	* @return {Mixed}
  	* @api private
  	*/
  	function coerce(val) {
  		if (val instanceof Error) {
  			return val.stack || val.message;
  		}
  		return val;
  	}

  	/**
  	* XXX DO NOT USE. This is a temporary stub function.
  	* XXX It WILL be removed in the next major release.
  	*/
  	function destroy() {
  		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  	}

  	createDebug.enable(createDebug.load());

  	return createDebug;
  }

  var common = setup;

  var browser = createCommonjsModule(function (module, exports) {
  /* eslint-env browser */

  /**
   * This is the web browser implementation of `debug()`.
   */

  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
  	let warned = false;

  	return () => {
  		if (!warned) {
  			warned = true;
  			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  		}
  	};
  })();

  /**
   * Colors.
   */

  exports.colors = [
  	'#0000CC',
  	'#0000FF',
  	'#0033CC',
  	'#0033FF',
  	'#0066CC',
  	'#0066FF',
  	'#0099CC',
  	'#0099FF',
  	'#00CC00',
  	'#00CC33',
  	'#00CC66',
  	'#00CC99',
  	'#00CCCC',
  	'#00CCFF',
  	'#3300CC',
  	'#3300FF',
  	'#3333CC',
  	'#3333FF',
  	'#3366CC',
  	'#3366FF',
  	'#3399CC',
  	'#3399FF',
  	'#33CC00',
  	'#33CC33',
  	'#33CC66',
  	'#33CC99',
  	'#33CCCC',
  	'#33CCFF',
  	'#6600CC',
  	'#6600FF',
  	'#6633CC',
  	'#6633FF',
  	'#66CC00',
  	'#66CC33',
  	'#9900CC',
  	'#9900FF',
  	'#9933CC',
  	'#9933FF',
  	'#99CC00',
  	'#99CC33',
  	'#CC0000',
  	'#CC0033',
  	'#CC0066',
  	'#CC0099',
  	'#CC00CC',
  	'#CC00FF',
  	'#CC3300',
  	'#CC3333',
  	'#CC3366',
  	'#CC3399',
  	'#CC33CC',
  	'#CC33FF',
  	'#CC6600',
  	'#CC6633',
  	'#CC9900',
  	'#CC9933',
  	'#CCCC00',
  	'#CCCC33',
  	'#FF0000',
  	'#FF0033',
  	'#FF0066',
  	'#FF0099',
  	'#FF00CC',
  	'#FF00FF',
  	'#FF3300',
  	'#FF3333',
  	'#FF3366',
  	'#FF3399',
  	'#FF33CC',
  	'#FF33FF',
  	'#FF6600',
  	'#FF6633',
  	'#FF9900',
  	'#FF9933',
  	'#FFCC00',
  	'#FFCC33'
  ];

  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  // eslint-disable-next-line complexity
  function useColors() {
  	// NB: In an Electron preload script, document will be defined but not fully
  	// initialized. Since we know we're in Chrome, we'll just detect this case
  	// explicitly
  	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
  		return true;
  	}

  	// Internet Explorer and Edge do not support colors.
  	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
  		return false;
  	}

  	// Is webkit? http://stackoverflow.com/a/16459606/376773
  	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
  		// Is firebug? http://stackoverflow.com/a/398120/376773
  		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
  		// Is firefox >= v31?
  		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
  		// Double check webkit in userAgent just in case we are in a worker
  		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
  }

  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  function formatArgs(args) {
  	args[0] = (this.useColors ? '%c' : '') +
  		this.namespace +
  		(this.useColors ? ' %c' : ' ') +
  		args[0] +
  		(this.useColors ? '%c ' : ' ') +
  		'+' + module.exports.humanize(this.diff);

  	if (!this.useColors) {
  		return;
  	}

  	const c = 'color: ' + this.color;
  	args.splice(1, 0, c, 'color: inherit');

  	// The final "%c" is somewhat tricky, because there could be other
  	// arguments passed either before or after the %c, so we need to
  	// figure out the correct index to insert the CSS into
  	let index = 0;
  	let lastC = 0;
  	args[0].replace(/%[a-zA-Z%]/g, match => {
  		if (match === '%%') {
  			return;
  		}
  		index++;
  		if (match === '%c') {
  			// We only are interested in the *last* %c
  			// (the user may have provided their own)
  			lastC = index;
  		}
  	});

  	args.splice(lastC, 0, c);
  }

  /**
   * Invokes `console.debug()` when available.
   * No-op when `console.debug` is not a "function".
   * If `console.debug` is not available, falls back
   * to `console.log`.
   *
   * @api public
   */
  exports.log = console.debug || console.log || (() => {});

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */
  function save(namespaces) {
  	try {
  		if (namespaces) {
  			exports.storage.setItem('debug', namespaces);
  		} else {
  			exports.storage.removeItem('debug');
  		}
  	} catch (error) {
  		// Swallow
  		// XXX (@Qix-) should we be logging these?
  	}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */
  function load() {
  	let r;
  	try {
  		r = exports.storage.getItem('debug');
  	} catch (error) {
  		// Swallow
  		// XXX (@Qix-) should we be logging these?
  	}

  	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  	if (!r && typeof process !== 'undefined' && 'env' in process) {
  		r = process.env.DEBUG;
  	}

  	return r;
  }

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
  		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
  		// The Browser also has localStorage in the global context.
  		return localStorage;
  	} catch (error) {
  		// Swallow
  		// XXX (@Qix-) should we be logging these?
  	}
  }

  module.exports = common(exports);

  const {formatters} = module.exports;

  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  formatters.j = function (v) {
  	try {
  		return JSON.stringify(v);
  	} catch (error) {
  		return '[UnexpectedJSONParseError]: ' + error.message;
  	}
  };
  });
  var browser_1 = browser.formatArgs;
  var browser_2 = browser.save;
  var browser_3 = browser.load;
  var browser_4 = browser.useColors;
  var browser_5 = browser.storage;
  var browser_6 = browser.destroy;
  var browser_7 = browser.colors;
  var browser_8 = browser.log;

  var url_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.url = void 0;

  const debug = browser("socket.io-client:url");
  /**
   * URL parser.
   *
   * @param uri - url
   * @param loc - An object meant to mimic window.location.
   *        Defaults to window.location.
   * @public
   */
  function url(uri, loc) {
      let obj = uri;
      // default to window.location
      loc = loc || (typeof location !== "undefined" && location);
      if (null == uri)
          uri = loc.protocol + "//" + loc.host;
      // relative path support
      if (typeof uri === "string") {
          if ("/" === uri.charAt(0)) {
              if ("/" === uri.charAt(1)) {
                  uri = loc.protocol + uri;
              }
              else {
                  uri = loc.host + uri;
              }
          }
          if (!/^(https?|wss?):\/\//.test(uri)) {
              debug("protocol-less url %s", uri);
              if ("undefined" !== typeof loc) {
                  uri = loc.protocol + "//" + uri;
              }
              else {
                  uri = "https://" + uri;
              }
          }
          // parse
          debug("parse %s", uri);
          obj = parseuri(uri);
      }
      // make sure we treat `localhost:80` and `localhost` equally
      if (!obj.port) {
          if (/^(http|ws)$/.test(obj.protocol)) {
              obj.port = "80";
          }
          else if (/^(http|ws)s$/.test(obj.protocol)) {
              obj.port = "443";
          }
      }
      obj.path = obj.path || "/";
      const ipv6 = obj.host.indexOf(":") !== -1;
      const host = ipv6 ? "[" + obj.host + "]" : obj.host;
      // define unique id
      obj.id = obj.protocol + "://" + host + ":" + obj.port;
      // define href
      obj.href =
          obj.protocol +
              "://" +
              host +
              (loc && loc.port === obj.port ? "" : ":" + obj.port);
      return obj;
  }
  exports.url = url;
  });

  unwrapExports(url_1);
  var url_2 = url_1.url;

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

  var globalThis_browser = (() => {
    if (typeof self !== "undefined") {
      return self;
    } else if (typeof window !== "undefined") {
      return window;
    } else {
      return Function("return this")();
    }
  })();

  // browser shim for xmlhttprequest module




  var xmlhttprequest = function(opts) {
    const xdomain = opts.xdomain;

    // scheme must be same when usign XDomainRequest
    // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
    const xscheme = opts.xscheme;

    // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
    // https://github.com/Automattic/engine.io-client/pull/217
    const enablesXDR = opts.enablesXDR;

    // XMLHttpRequest can be disabled on IE
    try {
      if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCors)) {
        return new XMLHttpRequest();
      }
    } catch (e) {}

    // Use XDomainRequest for IE8 if enablesXDR is true
    // because loading bar keeps flashing when using jsonp-polling
    // https://github.com/yujiosaka/socke.io-ie8-loading-example
    try {
      if ("undefined" !== typeof XDomainRequest && !xscheme && enablesXDR) {
        return new XDomainRequest();
      }
    } catch (e) {}

    if (!xdomain) {
      try {
        return new globalThis_browser[["Active"].concat("Object").join("X")](
          "Microsoft.XMLHTTP"
        );
      } catch (e) {}
    }
  };

  const PACKET_TYPES = Object.create(null); // no Map = no polyfill
  PACKET_TYPES["open"] = "0";
  PACKET_TYPES["close"] = "1";
  PACKET_TYPES["ping"] = "2";
  PACKET_TYPES["pong"] = "3";
  PACKET_TYPES["message"] = "4";
  PACKET_TYPES["upgrade"] = "5";
  PACKET_TYPES["noop"] = "6";

  const PACKET_TYPES_REVERSE = Object.create(null);
  Object.keys(PACKET_TYPES).forEach(key => {
    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
  });

  const ERROR_PACKET = { type: "error", data: "parser error" };

  var commons = {
    PACKET_TYPES,
    PACKET_TYPES_REVERSE,
    ERROR_PACKET
  };

  const { PACKET_TYPES: PACKET_TYPES$1 } = commons;

  const withNativeBlob =
    typeof Blob === "function" ||
    (typeof Blob !== "undefined" &&
      Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
  const withNativeArrayBuffer = typeof ArrayBuffer === "function";

  // ArrayBuffer.isView method is not defined in IE10
  const isView = obj => {
    return typeof ArrayBuffer.isView === "function"
      ? ArrayBuffer.isView(obj)
      : obj && obj.buffer instanceof ArrayBuffer;
  };

  const encodePacket = ({ type, data }, supportsBinary, callback) => {
    if (withNativeBlob && data instanceof Blob) {
      if (supportsBinary) {
        return callback(data);
      } else {
        return encodeBlobAsBase64(data, callback);
      }
    } else if (
      withNativeArrayBuffer &&
      (data instanceof ArrayBuffer || isView(data))
    ) {
      if (supportsBinary) {
        return callback(data instanceof ArrayBuffer ? data : data.buffer);
      } else {
        return encodeBlobAsBase64(new Blob([data]), callback);
      }
    }
    // plain string
    return callback(PACKET_TYPES$1[type] + (data || ""));
  };

  const encodeBlobAsBase64 = (data, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const content = fileReader.result.split(",")[1];
      callback("b" + content);
    };
    return fileReader.readAsDataURL(data);
  };

  var encodePacket_browser = encodePacket;

  var base64Arraybuffer = createCommonjsModule(function (module, exports) {
  /*
   * base64-arraybuffer
   * https://github.com/niklasvh/base64-arraybuffer
   *
   * Copyright (c) 2012 Niklas von Hertzen
   * Licensed under the MIT license.
   */
  (function(chars){

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
        encoded1 = chars.indexOf(base64[i]);
        encoded2 = chars.indexOf(base64[i+1]);
        encoded3 = chars.indexOf(base64[i+2]);
        encoded4 = chars.indexOf(base64[i+3]);

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
      }

      return arraybuffer;
    };
  })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
  });
  var base64Arraybuffer_1 = base64Arraybuffer.encode;
  var base64Arraybuffer_2 = base64Arraybuffer.decode;

  const { PACKET_TYPES_REVERSE: PACKET_TYPES_REVERSE$1, ERROR_PACKET: ERROR_PACKET$1 } = commons;

  const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";

  let base64decoder;
  if (withNativeArrayBuffer$1) {
    base64decoder = base64Arraybuffer;
  }

  const decodePacket = (encodedPacket, binaryType) => {
    if (typeof encodedPacket !== "string") {
      return {
        type: "message",
        data: mapBinary(encodedPacket, binaryType)
      };
    }
    const type = encodedPacket.charAt(0);
    if (type === "b") {
      return {
        type: "message",
        data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
      };
    }
    const packetType = PACKET_TYPES_REVERSE$1[type];
    if (!packetType) {
      return ERROR_PACKET$1;
    }
    return encodedPacket.length > 1
      ? {
          type: PACKET_TYPES_REVERSE$1[type],
          data: encodedPacket.substring(1)
        }
      : {
          type: PACKET_TYPES_REVERSE$1[type]
        };
  };

  const decodeBase64Packet = (data, binaryType) => {
    if (base64decoder) {
      const decoded = base64decoder.decode(data);
      return mapBinary(decoded, binaryType);
    } else {
      return { base64: true, data }; // fallback for old browsers
    }
  };

  const mapBinary = (data, binaryType) => {
    switch (binaryType) {
      case "blob":
        return data instanceof ArrayBuffer ? new Blob([data]) : data;
      case "arraybuffer":
      default:
        return data; // assuming the data is already an ArrayBuffer
    }
  };

  var decodePacket_browser = decodePacket;

  const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text

  const encodePayload = (packets, callback) => {
    // some packets may be added to the array while encoding, so the initial length must be saved
    const length = packets.length;
    const encodedPackets = new Array(length);
    let count = 0;

    packets.forEach((packet, i) => {
      // force base64 encoding for binary packets
      encodePacket_browser(packet, false, encodedPacket => {
        encodedPackets[i] = encodedPacket;
        if (++count === length) {
          callback(encodedPackets.join(SEPARATOR));
        }
      });
    });
  };

  const decodePayload = (encodedPayload, binaryType) => {
    const encodedPackets = encodedPayload.split(SEPARATOR);
    const packets = [];
    for (let i = 0; i < encodedPackets.length; i++) {
      const decodedPacket = decodePacket_browser(encodedPackets[i], binaryType);
      packets.push(decodedPacket);
      if (decodedPacket.type === "error") {
        break;
      }
    }
    return packets;
  };

  var lib$1 = {
    protocol: 4,
    encodePacket: encodePacket_browser,
    encodePayload,
    decodePacket: decodePacket_browser,
    decodePayload
  };

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

    // Remove event specific arrays for event types that no
    // one is subscribed for to avoid memory leak.
    if (callbacks.length === 0) {
      delete this._callbacks['$' + event];
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

    var args = new Array(arguments.length - 1)
      , callbacks = this._callbacks['$' + event];

    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }

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

  class Transport extends componentEmitter {
    /**
     * Transport abstract constructor.
     *
     * @param {Object} options.
     * @api private
     */
    constructor(opts) {
      super();

      this.opts = opts;
      this.query = opts.query;
      this.readyState = "";
      this.socket = opts.socket;
    }

    /**
     * Emits an error.
     *
     * @param {String} str
     * @return {Transport} for chaining
     * @api public
     */
    onError(msg, desc) {
      const err = new Error(msg);
      err.type = "TransportError";
      err.description = desc;
      this.emit("error", err);
      return this;
    }

    /**
     * Opens the transport.
     *
     * @api public
     */
    open() {
      if ("closed" === this.readyState || "" === this.readyState) {
        this.readyState = "opening";
        this.doOpen();
      }

      return this;
    }

    /**
     * Closes the transport.
     *
     * @api private
     */
    close() {
      if ("opening" === this.readyState || "open" === this.readyState) {
        this.doClose();
        this.onClose();
      }

      return this;
    }

    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     * @api private
     */
    send(packets) {
      if ("open" === this.readyState) {
        this.write(packets);
      } else {
        throw new Error("Transport not open");
      }
    }

    /**
     * Called upon open
     *
     * @api private
     */
    onOpen() {
      this.readyState = "open";
      this.writable = true;
      this.emit("open");
    }

    /**
     * Called with data.
     *
     * @param {String} data
     * @api private
     */
    onData(data) {
      const packet = lib$1.decodePacket(data, this.socket.binaryType);
      this.onPacket(packet);
    }

    /**
     * Called with a decoded packet.
     */
    onPacket(packet) {
      this.emit("packet", packet);
    }

    /**
     * Called upon close.
     *
     * @api private
     */
    onClose() {
      this.readyState = "closed";
      this.emit("close");
    }
  }

  var transport = Transport;

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

  const debug = browser("engine.io-client:polling");

  class Polling extends transport {
    /**
     * Transport name.
     */
    get name() {
      return "polling";
    }

    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @api private
     */
    doOpen() {
      this.poll();
    }

    /**
     * Pauses polling.
     *
     * @param {Function} callback upon buffers are flushed and transport is paused
     * @api private
     */
    pause(onPause) {
      const self = this;

      this.readyState = "pausing";

      function pause() {
        debug("paused");
        self.readyState = "paused";
        onPause();
      }

      if (this.polling || !this.writable) {
        let total = 0;

        if (this.polling) {
          debug("we are currently polling - waiting to pause");
          total++;
          this.once("pollComplete", function() {
            debug("pre-pause polling complete");
            --total || pause();
          });
        }

        if (!this.writable) {
          debug("we are currently writing - waiting to pause");
          total++;
          this.once("drain", function() {
            debug("pre-pause writing complete");
            --total || pause();
          });
        }
      } else {
        pause();
      }
    }

    /**
     * Starts polling cycle.
     *
     * @api public
     */
    poll() {
      debug("polling");
      this.polling = true;
      this.doPoll();
      this.emit("poll");
    }

    /**
     * Overloads onData to detect payloads.
     *
     * @api private
     */
    onData(data) {
      const self = this;
      debug("polling got data %s", data);
      const callback = function(packet, index, total) {
        // if its the first message we consider the transport open
        if ("opening" === self.readyState && packet.type === "open") {
          self.onOpen();
        }

        // if its a close packet, we close the ongoing requests
        if ("close" === packet.type) {
          self.onClose();
          return false;
        }

        // otherwise bypass onData and handle the message
        self.onPacket(packet);
      };

      // decode payload
      lib$1.decodePayload(data, this.socket.binaryType).forEach(callback);

      // if an event did not trigger closing
      if ("closed" !== this.readyState) {
        // if we got data we're not polling
        this.polling = false;
        this.emit("pollComplete");

        if ("open" === this.readyState) {
          this.poll();
        } else {
          debug('ignoring poll - transport state "%s"', this.readyState);
        }
      }
    }

    /**
     * For polling, send a close packet.
     *
     * @api private
     */
    doClose() {
      const self = this;

      function close() {
        debug("writing close packet");
        self.write([{ type: "close" }]);
      }

      if ("open" === this.readyState) {
        debug("transport open - closing");
        close();
      } else {
        // in case we're trying to close while
        // handshaking is in progress (GH-164)
        debug("transport not open - deferring close");
        this.once("open", close);
      }
    }

    /**
     * Writes a packets payload.
     *
     * @param {Array} data packets
     * @param {Function} drain callback
     * @api private
     */
    write(packets) {
      this.writable = false;

      lib$1.encodePayload(packets, data => {
        this.doWrite(data, () => {
          this.writable = true;
          this.emit("drain");
        });
      });
    }

    /**
     * Generates uri for connection.
     *
     * @api private
     */
    uri() {
      let query = this.query || {};
      const schema = this.opts.secure ? "https" : "http";
      let port = "";

      // cache busting is forced
      if (false !== this.opts.timestampRequests) {
        query[this.opts.timestampParam] = yeast_1();
      }

      if (!this.supportsBinary && !query.sid) {
        query.b64 = 1;
      }

      query = parseqs.encode(query);

      // avoid port if default for schema
      if (
        this.opts.port &&
        (("https" === schema && Number(this.opts.port) !== 443) ||
          ("http" === schema && Number(this.opts.port) !== 80))
      ) {
        port = ":" + this.opts.port;
      }

      // prepend ? to query
      if (query.length) {
        query = "?" + query;
      }

      const ipv6 = this.opts.hostname.indexOf(":") !== -1;
      return (
        schema +
        "://" +
        (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
        port +
        this.opts.path +
        query
      );
    }
  }

  var polling = Polling;

  var pick = (obj, ...attr) => {
    return attr.reduce((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
  };

  var util = {
  	pick: pick
  };

  /* global attachEvent */




  const { pick: pick$1 } = util;


  const debug$1 = browser("engine.io-client:polling-xhr");

  /**
   * Empty function
   */

  function empty() {}

  const hasXHR2 = (function() {
    const xhr = new xmlhttprequest({ xdomain: false });
    return null != xhr.responseType;
  })();

  class XHR extends polling {
    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @api public
     */
    constructor(opts) {
      super(opts);

      if (typeof location !== "undefined") {
        const isSSL = "https:" === location.protocol;
        let port = location.port;

        // some user agents have empty `location.port`
        if (!port) {
          port = isSSL ? 443 : 80;
        }

        this.xd =
          (typeof location !== "undefined" &&
            opts.hostname !== location.hostname) ||
          port !== opts.port;
        this.xs = opts.secure !== isSSL;
      }
      /**
       * XHR supports binary
       */
      const forceBase64 = opts && opts.forceBase64;
      this.supportsBinary = hasXHR2 && !forceBase64;
    }

    /**
     * Creates a request.
     *
     * @param {String} method
     * @api private
     */
    request(opts = {}) {
      Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
      return new Request(this.uri(), opts);
    }

    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @api private
     */
    doWrite(data, fn) {
      const req = this.request({
        method: "POST",
        data: data
      });
      const self = this;
      req.on("success", fn);
      req.on("error", function(err) {
        self.onError("xhr post error", err);
      });
    }

    /**
     * Starts a poll cycle.
     *
     * @api private
     */
    doPoll() {
      debug$1("xhr poll");
      const req = this.request();
      const self = this;
      req.on("data", function(data) {
        self.onData(data);
      });
      req.on("error", function(err) {
        self.onError("xhr poll error", err);
      });
      this.pollXhr = req;
    }
  }

  class Request extends componentEmitter {
    /**
     * Request constructor
     *
     * @param {Object} options
     * @api public
     */
    constructor(uri, opts) {
      super();
      this.opts = opts;

      this.method = opts.method || "GET";
      this.uri = uri;
      this.async = false !== opts.async;
      this.data = undefined !== opts.data ? opts.data : null;

      this.create();
    }

    /**
     * Creates the XHR object and sends the request.
     *
     * @api private
     */
    create() {
      const opts = pick$1(
        this.opts,
        "agent",
        "enablesXDR",
        "pfx",
        "key",
        "passphrase",
        "cert",
        "ca",
        "ciphers",
        "rejectUnauthorized"
      );
      opts.xdomain = !!this.opts.xd;
      opts.xscheme = !!this.opts.xs;

      const xhr = (this.xhr = new xmlhttprequest(opts));
      const self = this;

      try {
        debug$1("xhr open %s: %s", this.method, this.uri);
        xhr.open(this.method, this.uri, this.async);
        try {
          if (this.opts.extraHeaders) {
            xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
            for (let i in this.opts.extraHeaders) {
              if (this.opts.extraHeaders.hasOwnProperty(i)) {
                xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
              }
            }
          }
        } catch (e) {}

        if ("POST" === this.method) {
          try {
            xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
          } catch (e) {}
        }

        try {
          xhr.setRequestHeader("Accept", "*/*");
        } catch (e) {}

        // ie6 check
        if ("withCredentials" in xhr) {
          xhr.withCredentials = this.opts.withCredentials;
        }

        if (this.opts.requestTimeout) {
          xhr.timeout = this.opts.requestTimeout;
        }

        if (this.hasXDR()) {
          xhr.onload = function() {
            self.onLoad();
          };
          xhr.onerror = function() {
            self.onError(xhr.responseText);
          };
        } else {
          xhr.onreadystatechange = function() {
            if (4 !== xhr.readyState) return;
            if (200 === xhr.status || 1223 === xhr.status) {
              self.onLoad();
            } else {
              // make sure the `error` event handler that's user-set
              // does not throw in the same tick and gets caught here
              setTimeout(function() {
                self.onError(typeof xhr.status === "number" ? xhr.status : 0);
              }, 0);
            }
          };
        }

        debug$1("xhr data %s", this.data);
        xhr.send(this.data);
      } catch (e) {
        // Need to defer since .create() is called directly from the constructor
        // and thus the 'error' event can only be only bound *after* this exception
        // occurs.  Therefore, also, we cannot throw here at all.
        setTimeout(function() {
          self.onError(e);
        }, 0);
        return;
      }

      if (typeof document !== "undefined") {
        this.index = Request.requestsCount++;
        Request.requests[this.index] = this;
      }
    }

    /**
     * Called upon successful response.
     *
     * @api private
     */
    onSuccess() {
      this.emit("success");
      this.cleanup();
    }

    /**
     * Called if we have data.
     *
     * @api private
     */
    onData(data) {
      this.emit("data", data);
      this.onSuccess();
    }

    /**
     * Called upon error.
     *
     * @api private
     */
    onError(err) {
      this.emit("error", err);
      this.cleanup(true);
    }

    /**
     * Cleans up house.
     *
     * @api private
     */
    cleanup(fromError) {
      if ("undefined" === typeof this.xhr || null === this.xhr) {
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

      if (typeof document !== "undefined") {
        delete Request.requests[this.index];
      }

      this.xhr = null;
    }

    /**
     * Called upon load.
     *
     * @api private
     */
    onLoad() {
      const data = this.xhr.responseText;
      if (data !== null) {
        this.onData(data);
      }
    }

    /**
     * Check if it has XDomainRequest.
     *
     * @api private
     */
    hasXDR() {
      return typeof XDomainRequest !== "undefined" && !this.xs && this.enablesXDR;
    }

    /**
     * Aborts the request.
     *
     * @api public
     */
    abort() {
      this.cleanup();
    }
  }

  /**
   * Aborts pending requests when unloading the window. This is needed to prevent
   * memory leaks (e.g. when using IE) and to ensure that no spurious error is
   * emitted.
   */

  Request.requestsCount = 0;
  Request.requests = {};

  if (typeof document !== "undefined") {
    if (typeof attachEvent === "function") {
      attachEvent("onunload", unloadHandler);
    } else if (typeof addEventListener === "function") {
      const terminationEvent = "onpagehide" in globalThis_browser ? "pagehide" : "unload";
      addEventListener(terminationEvent, unloadHandler, false);
    }
  }

  function unloadHandler() {
    for (let i in Request.requests) {
      if (Request.requests.hasOwnProperty(i)) {
        Request.requests[i].abort();
      }
    }
  }

  var pollingXhr = XHR;
  var Request_1 = Request;
  pollingXhr.Request = Request_1;

  const rNewline = /\n/g;
  const rEscapedNewline = /\\n/g;

  /**
   * Global JSONP callbacks.
   */

  let callbacks;

  /**
   * Noop.
   */

  function empty$1() {}

  class JSONPPolling extends polling {
    /**
     * JSONP Polling constructor.
     *
     * @param {Object} opts.
     * @api public
     */
    constructor(opts) {
      super(opts);

      this.query = this.query || {};

      // define global callbacks array if not present
      // we do this here (lazily) to avoid unneeded global pollution
      if (!callbacks) {
        // we need to consider multiple engines in the same page
        callbacks = globalThis_browser.___eio = globalThis_browser.___eio || [];
      }

      // callback identifier
      this.index = callbacks.length;

      // add callback to jsonp global
      const self = this;
      callbacks.push(function(msg) {
        self.onData(msg);
      });

      // append to query string
      this.query.j = this.index;

      // prevent spurious errors from being emitted when the window is unloaded
      if (typeof addEventListener === "function") {
        addEventListener(
          "beforeunload",
          function() {
            if (self.script) self.script.onerror = empty$1;
          },
          false
        );
      }
    }

    /**
     * JSONP only supports binary as base64 encoded strings
     */
    get supportsBinary() {
      return false;
    }

    /**
     * Closes the socket.
     *
     * @api private
     */
    doClose() {
      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      if (this.form) {
        this.form.parentNode.removeChild(this.form);
        this.form = null;
        this.iframe = null;
      }

      super.doClose();
    }

    /**
     * Starts a poll cycle.
     *
     * @api private
     */
    doPoll() {
      const self = this;
      const script = document.createElement("script");

      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      script.async = true;
      script.src = this.uri();
      script.onerror = function(e) {
        self.onError("jsonp poll error", e);
      };

      const insertAt = document.getElementsByTagName("script")[0];
      if (insertAt) {
        insertAt.parentNode.insertBefore(script, insertAt);
      } else {
        (document.head || document.body).appendChild(script);
      }
      this.script = script;

      const isUAgecko =
        "undefined" !== typeof navigator && /gecko/i.test(navigator.userAgent);

      if (isUAgecko) {
        setTimeout(function() {
          const iframe = document.createElement("iframe");
          document.body.appendChild(iframe);
          document.body.removeChild(iframe);
        }, 100);
      }
    }

    /**
     * Writes with a hidden iframe.
     *
     * @param {String} data to send
     * @param {Function} called upon flush.
     * @api private
     */
    doWrite(data, fn) {
      const self = this;
      let iframe;

      if (!this.form) {
        const form = document.createElement("form");
        const area = document.createElement("textarea");
        const id = (this.iframeId = "eio_iframe_" + this.index);

        form.className = "socketio";
        form.style.position = "absolute";
        form.style.top = "-1000px";
        form.style.left = "-1000px";
        form.target = id;
        form.method = "POST";
        form.setAttribute("accept-charset", "utf-8");
        area.name = "d";
        form.appendChild(area);
        document.body.appendChild(form);

        this.form = form;
        this.area = area;
      }

      this.form.action = this.uri();

      function complete() {
        initIframe();
        fn();
      }

      function initIframe() {
        if (self.iframe) {
          try {
            self.form.removeChild(self.iframe);
          } catch (e) {
            self.onError("jsonp polling iframe removal error", e);
          }
        }

        try {
          // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
          const html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
          iframe = document.createElement(html);
        } catch (e) {
          iframe = document.createElement("iframe");
          iframe.name = self.iframeId;
          iframe.src = "javascript:0";
        }

        iframe.id = self.iframeId;

        self.form.appendChild(iframe);
        self.iframe = iframe;
      }

      initIframe();

      // escape \n to prevent it from being converted into \r\n by some UAs
      // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
      data = data.replace(rEscapedNewline, "\\\n");
      this.area.value = data.replace(rNewline, "\\n");

      try {
        this.form.submit();
      } catch (e) {}

      if (this.iframe.attachEvent) {
        this.iframe.onreadystatechange = function() {
          if (self.iframe.readyState === "complete") {
            complete();
          }
        };
      } else {
        this.iframe.onload = complete;
      }
    }
  }

  var pollingJsonp = JSONPPolling;

  var websocketConstructor_browser = {
    WebSocket: globalThis_browser.WebSocket || globalThis_browser.MozWebSocket,
    usingBrowserWebSocket: true,
    defaultBinaryType: "arraybuffer"
  };

  const { pick: pick$2 } = util;
  const {
    WebSocket,
    usingBrowserWebSocket,
    defaultBinaryType
  } = websocketConstructor_browser;

  const debug$2 = browser("engine.io-client:websocket");

  // detect ReactNative environment
  const isReactNative =
    typeof navigator !== "undefined" &&
    typeof navigator.product === "string" &&
    navigator.product.toLowerCase() === "reactnative";

  class WS extends transport {
    /**
     * WebSocket transport constructor.
     *
     * @api {Object} connection options
     * @api public
     */
    constructor(opts) {
      super(opts);

      this.supportsBinary = !opts.forceBase64;
    }

    /**
     * Transport name.
     *
     * @api public
     */
    get name() {
      return "websocket";
    }

    /**
     * Opens socket.
     *
     * @api private
     */
    doOpen() {
      if (!this.check()) {
        // let probe timeout
        return;
      }

      const uri = this.uri();
      const protocols = this.opts.protocols;

      // React Native only supports the 'headers' option, and will print a warning if anything else is passed
      const opts = isReactNative
        ? {}
        : pick$2(
            this.opts,
            "agent",
            "perMessageDeflate",
            "pfx",
            "key",
            "passphrase",
            "cert",
            "ca",
            "ciphers",
            "rejectUnauthorized",
            "localAddress"
          );

      if (this.opts.extraHeaders) {
        opts.headers = this.opts.extraHeaders;
      }

      try {
        this.ws =
          usingBrowserWebSocket && !isReactNative
            ? protocols
              ? new WebSocket(uri, protocols)
              : new WebSocket(uri)
            : new WebSocket(uri, protocols, opts);
      } catch (err) {
        return this.emit("error", err);
      }

      this.ws.binaryType = this.socket.binaryType || defaultBinaryType;

      this.addEventListeners();
    }

    /**
     * Adds event listeners to the socket
     *
     * @api private
     */
    addEventListeners() {
      const self = this;

      this.ws.onopen = function() {
        self.onOpen();
      };
      this.ws.onclose = function() {
        self.onClose();
      };
      this.ws.onmessage = function(ev) {
        self.onData(ev.data);
      };
      this.ws.onerror = function(e) {
        self.onError("websocket error", e);
      };
    }

    /**
     * Writes data to socket.
     *
     * @param {Array} array of packets.
     * @api private
     */
    write(packets) {
      const self = this;
      this.writable = false;

      // encodePacket efficient as it uses WS framing
      // no need for encodePayload
      let total = packets.length;
      let i = 0;
      const l = total;
      for (; i < l; i++) {
        (function(packet) {
          lib$1.encodePacket(packet, self.supportsBinary, function(data) {
            // always create a new object (GH-437)
            const opts = {};
            if (!usingBrowserWebSocket) {
              if (packet.options) {
                opts.compress = packet.options.compress;
              }

              if (self.opts.perMessageDeflate) {
                const len =
                  "string" === typeof data
                    ? Buffer.byteLength(data)
                    : data.length;
                if (len < self.opts.perMessageDeflate.threshold) {
                  opts.compress = false;
                }
              }
            }

            // Sometimes the websocket has already been closed but the browser didn't
            // have a chance of informing us about it yet, in that case send will
            // throw an error
            try {
              if (usingBrowserWebSocket) {
                // TypeError is thrown when passing the second argument on Safari
                self.ws.send(data);
              } else {
                self.ws.send(data, opts);
              }
            } catch (e) {
              debug$2("websocket closed before onclose event");
            }

            --total || done();
          });
        })(packets[i]);
      }

      function done() {
        self.emit("flush");

        // fake drain
        // defer to next tick to allow Socket to clear writeBuffer
        setTimeout(function() {
          self.writable = true;
          self.emit("drain");
        }, 0);
      }
    }

    /**
     * Called upon close
     *
     * @api private
     */
    onClose() {
      transport.prototype.onClose.call(this);
    }

    /**
     * Closes socket.
     *
     * @api private
     */
    doClose() {
      if (typeof this.ws !== "undefined") {
        this.ws.close();
      }
    }

    /**
     * Generates uri for connection.
     *
     * @api private
     */
    uri() {
      let query = this.query || {};
      const schema = this.opts.secure ? "wss" : "ws";
      let port = "";

      // avoid port if default for schema
      if (
        this.opts.port &&
        (("wss" === schema && Number(this.opts.port) !== 443) ||
          ("ws" === schema && Number(this.opts.port) !== 80))
      ) {
        port = ":" + this.opts.port;
      }

      // append timestamp to URI
      if (this.opts.timestampRequests) {
        query[this.opts.timestampParam] = yeast_1();
      }

      // communicate binary support capabilities
      if (!this.supportsBinary) {
        query.b64 = 1;
      }

      query = parseqs.encode(query);

      // prepend ? to query
      if (query.length) {
        query = "?" + query;
      }

      const ipv6 = this.opts.hostname.indexOf(":") !== -1;
      return (
        schema +
        "://" +
        (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
        port +
        this.opts.path +
        query
      );
    }

    /**
     * Feature detection for WebSocket.
     *
     * @return {Boolean} whether this transport is available.
     * @api public
     */
    check() {
      return (
        !!WebSocket &&
        !("__initialize" in WebSocket && this.name === WS.prototype.name)
      );
    }
  }

  var websocket = WS;

  var polling_1 = polling$1;
  var websocket_1 = websocket;

  /**
   * Polling transport polymorphic constructor.
   * Decides on xhr vs jsonp based on feature detection.
   *
   * @api private
   */

  function polling$1(opts) {
    let xhr;
    let xd = false;
    let xs = false;
    const jsonp = false !== opts.jsonp;

    if (typeof location !== "undefined") {
      const isSSL = "https:" === location.protocol;
      let port = location.port;

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

    if ("open" in xhr && !opts.forceJSONP) {
      return new pollingXhr(opts);
    } else {
      if (!jsonp) throw new Error("JSONP disabled");
      return new pollingJsonp(opts);
    }
  }

  var transports = {
  	polling: polling_1,
  	websocket: websocket_1
  };

  const debug$3 = browser("engine.io-client:socket");




  class Socket extends componentEmitter {
    /**
     * Socket constructor.
     *
     * @param {String|Object} uri or options
     * @param {Object} options
     * @api public
     */
    constructor(uri, opts = {}) {
      super();

      if (uri && "object" === typeof uri) {
        opts = uri;
        uri = null;
      }

      if (uri) {
        uri = parseuri(uri);
        opts.hostname = uri.host;
        opts.secure = uri.protocol === "https" || uri.protocol === "wss";
        opts.port = uri.port;
        if (uri.query) opts.query = uri.query;
      } else if (opts.host) {
        opts.hostname = parseuri(opts.host).host;
      }

      this.secure =
        null != opts.secure
          ? opts.secure
          : typeof location !== "undefined" && "https:" === location.protocol;

      if (opts.hostname && !opts.port) {
        // if no port is specified manually, use the protocol default
        opts.port = this.secure ? "443" : "80";
      }

      this.hostname =
        opts.hostname ||
        (typeof location !== "undefined" ? location.hostname : "localhost");
      this.port =
        opts.port ||
        (typeof location !== "undefined" && location.port
          ? location.port
          : this.secure
          ? 443
          : 80);

      this.transports = opts.transports || ["polling", "websocket"];
      this.readyState = "";
      this.writeBuffer = [];
      this.prevBufferLen = 0;

      this.opts = Object.assign(
        {
          path: "/engine.io",
          agent: false,
          withCredentials: false,
          upgrade: true,
          jsonp: true,
          timestampParam: "t",
          rememberUpgrade: false,
          rejectUnauthorized: true,
          perMessageDeflate: {
            threshold: 1024
          },
          transportOptions: {}
        },
        opts
      );

      this.opts.path = this.opts.path.replace(/\/$/, "") + "/";

      if (typeof this.opts.query === "string") {
        this.opts.query = parseqs.decode(this.opts.query);
      }

      // set on handshake
      this.id = null;
      this.upgrades = null;
      this.pingInterval = null;
      this.pingTimeout = null;

      // set on heartbeat
      this.pingTimeoutTimer = null;

      this.open();
    }

    /**
     * Creates transport of the given type.
     *
     * @param {String} transport name
     * @return {Transport}
     * @api private
     */
    createTransport(name) {
      debug$3('creating transport "%s"', name);
      const query = clone(this.opts.query);

      // append engine.io protocol identifier
      query.EIO = lib$1.protocol;

      // transport name
      query.transport = name;

      // session id if we already have one
      if (this.id) query.sid = this.id;

      const opts = Object.assign(
        {},
        this.opts.transportOptions[name],
        this.opts,
        {
          query,
          socket: this,
          hostname: this.hostname,
          secure: this.secure,
          port: this.port
        }
      );

      debug$3("options: %j", opts);

      return new transports[name](opts);
    }

    /**
     * Initializes transport to use and starts probe.
     *
     * @api private
     */
    open() {
      let transport;
      if (
        this.opts.rememberUpgrade &&
        Socket.priorWebsocketSuccess &&
        this.transports.indexOf("websocket") !== -1
      ) {
        transport = "websocket";
      } else if (0 === this.transports.length) {
        // Emit error on next tick so it can be listened to
        const self = this;
        setTimeout(function() {
          self.emit("error", "No transports available");
        }, 0);
        return;
      } else {
        transport = this.transports[0];
      }
      this.readyState = "opening";

      // Retry with the next transport if the transport is disabled (jsonp: false)
      try {
        transport = this.createTransport(transport);
      } catch (e) {
        debug$3("error while creating transport: %s", e);
        this.transports.shift();
        this.open();
        return;
      }

      transport.open();
      this.setTransport(transport);
    }

    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @api private
     */
    setTransport(transport) {
      debug$3("setting transport %s", transport.name);
      const self = this;

      if (this.transport) {
        debug$3("clearing existing transport %s", this.transport.name);
        this.transport.removeAllListeners();
      }

      // set up transport
      this.transport = transport;

      // set up transport listeners
      transport
        .on("drain", function() {
          self.onDrain();
        })
        .on("packet", function(packet) {
          self.onPacket(packet);
        })
        .on("error", function(e) {
          self.onError(e);
        })
        .on("close", function() {
          self.onClose("transport close");
        });
    }

    /**
     * Probes a transport.
     *
     * @param {String} transport name
     * @api private
     */
    probe(name) {
      debug$3('probing transport "%s"', name);
      let transport = this.createTransport(name, { probe: 1 });
      let failed = false;
      const self = this;

      Socket.priorWebsocketSuccess = false;

      function onTransportOpen() {
        if (self.onlyBinaryUpgrades) {
          const upgradeLosesBinary =
            !this.supportsBinary && self.transport.supportsBinary;
          failed = failed || upgradeLosesBinary;
        }
        if (failed) return;

        debug$3('probe transport "%s" opened', name);
        transport.send([{ type: "ping", data: "probe" }]);
        transport.once("packet", function(msg) {
          if (failed) return;
          if ("pong" === msg.type && "probe" === msg.data) {
            debug$3('probe transport "%s" pong', name);
            self.upgrading = true;
            self.emit("upgrading", transport);
            if (!transport) return;
            Socket.priorWebsocketSuccess = "websocket" === transport.name;

            debug$3('pausing current transport "%s"', self.transport.name);
            self.transport.pause(function() {
              if (failed) return;
              if ("closed" === self.readyState) return;
              debug$3("changing transport and sending upgrade packet");

              cleanup();

              self.setTransport(transport);
              transport.send([{ type: "upgrade" }]);
              self.emit("upgrade", transport);
              transport = null;
              self.upgrading = false;
              self.flush();
            });
          } else {
            debug$3('probe transport "%s" failed', name);
            const err = new Error("probe error");
            err.transport = transport.name;
            self.emit("upgradeError", err);
          }
        });
      }

      function freezeTransport() {
        if (failed) return;

        // Any callback called by transport should be ignored since now
        failed = true;

        cleanup();

        transport.close();
        transport = null;
      }

      // Handle any error that happens while probing
      function onerror(err) {
        const error = new Error("probe error: " + err);
        error.transport = transport.name;

        freezeTransport();

        debug$3('probe transport "%s" failed because of error: %s', name, err);

        self.emit("upgradeError", error);
      }

      function onTransportClose() {
        onerror("transport closed");
      }

      // When the socket is closed while we're probing
      function onclose() {
        onerror("socket closed");
      }

      // When the socket is upgraded while we're probing
      function onupgrade(to) {
        if (transport && to.name !== transport.name) {
          debug$3('"%s" works - aborting "%s"', to.name, transport.name);
          freezeTransport();
        }
      }

      // Remove all listeners on the transport and on self
      function cleanup() {
        transport.removeListener("open", onTransportOpen);
        transport.removeListener("error", onerror);
        transport.removeListener("close", onTransportClose);
        self.removeListener("close", onclose);
        self.removeListener("upgrading", onupgrade);
      }

      transport.once("open", onTransportOpen);
      transport.once("error", onerror);
      transport.once("close", onTransportClose);

      this.once("close", onclose);
      this.once("upgrading", onupgrade);

      transport.open();
    }

    /**
     * Called when connection is deemed open.
     *
     * @api public
     */
    onOpen() {
      debug$3("socket open");
      this.readyState = "open";
      Socket.priorWebsocketSuccess = "websocket" === this.transport.name;
      this.emit("open");
      this.flush();

      // we check for `readyState` in case an `open`
      // listener already closed the socket
      if (
        "open" === this.readyState &&
        this.opts.upgrade &&
        this.transport.pause
      ) {
        debug$3("starting upgrade probes");
        let i = 0;
        const l = this.upgrades.length;
        for (; i < l; i++) {
          this.probe(this.upgrades[i]);
        }
      }
    }

    /**
     * Handles a packet.
     *
     * @api private
     */
    onPacket(packet) {
      if (
        "opening" === this.readyState ||
        "open" === this.readyState ||
        "closing" === this.readyState
      ) {
        debug$3('socket receive: type "%s", data "%s"', packet.type, packet.data);

        this.emit("packet", packet);

        // Socket is live - any packet counts
        this.emit("heartbeat");

        switch (packet.type) {
          case "open":
            this.onHandshake(JSON.parse(packet.data));
            break;

          case "ping":
            this.resetPingTimeout();
            this.sendPacket("pong");
            this.emit("pong");
            break;

          case "error":
            const err = new Error("server error");
            err.code = packet.data;
            this.onError(err);
            break;

          case "message":
            this.emit("data", packet.data);
            this.emit("message", packet.data);
            break;
        }
      } else {
        debug$3('packet received with socket readyState "%s"', this.readyState);
      }
    }

    /**
     * Called upon handshake completion.
     *
     * @param {Object} handshake obj
     * @api private
     */
    onHandshake(data) {
      this.emit("handshake", data);
      this.id = data.sid;
      this.transport.query.sid = data.sid;
      this.upgrades = this.filterUpgrades(data.upgrades);
      this.pingInterval = data.pingInterval;
      this.pingTimeout = data.pingTimeout;
      this.onOpen();
      // In case open handler closes socket
      if ("closed" === this.readyState) return;
      this.resetPingTimeout();
    }

    /**
     * Sets and resets ping timeout timer based on server pings.
     *
     * @api private
     */
    resetPingTimeout() {
      clearTimeout(this.pingTimeoutTimer);
      this.pingTimeoutTimer = setTimeout(() => {
        this.onClose("ping timeout");
      }, this.pingInterval + this.pingTimeout);
    }

    /**
     * Called on `drain` event
     *
     * @api private
     */
    onDrain() {
      this.writeBuffer.splice(0, this.prevBufferLen);

      // setting prevBufferLen = 0 is very important
      // for example, when upgrading, upgrade packet is sent over,
      // and a nonzero prevBufferLen could cause problems on `drain`
      this.prevBufferLen = 0;

      if (0 === this.writeBuffer.length) {
        this.emit("drain");
      } else {
        this.flush();
      }
    }

    /**
     * Flush write buffers.
     *
     * @api private
     */
    flush() {
      if (
        "closed" !== this.readyState &&
        this.transport.writable &&
        !this.upgrading &&
        this.writeBuffer.length
      ) {
        debug$3("flushing %d packets in socket", this.writeBuffer.length);
        this.transport.send(this.writeBuffer);
        // keep track of current length of writeBuffer
        // splice writeBuffer and callbackBuffer on `drain`
        this.prevBufferLen = this.writeBuffer.length;
        this.emit("flush");
      }
    }

    /**
     * Sends a message.
     *
     * @param {String} message.
     * @param {Function} callback function.
     * @param {Object} options.
     * @return {Socket} for chaining.
     * @api public
     */
    write(msg, options, fn) {
      this.sendPacket("message", msg, options, fn);
      return this;
    }

    send(msg, options, fn) {
      this.sendPacket("message", msg, options, fn);
      return this;
    }

    /**
     * Sends a packet.
     *
     * @param {String} packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} callback function.
     * @api private
     */
    sendPacket(type, data, options, fn) {
      if ("function" === typeof data) {
        fn = data;
        data = undefined;
      }

      if ("function" === typeof options) {
        fn = options;
        options = null;
      }

      if ("closing" === this.readyState || "closed" === this.readyState) {
        return;
      }

      options = options || {};
      options.compress = false !== options.compress;

      const packet = {
        type: type,
        data: data,
        options: options
      };
      this.emit("packetCreate", packet);
      this.writeBuffer.push(packet);
      if (fn) this.once("flush", fn);
      this.flush();
    }

    /**
     * Closes the connection.
     *
     * @api private
     */
    close() {
      const self = this;

      if ("opening" === this.readyState || "open" === this.readyState) {
        this.readyState = "closing";

        if (this.writeBuffer.length) {
          this.once("drain", function() {
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

      function close() {
        self.onClose("forced close");
        debug$3("socket closing - telling transport to close");
        self.transport.close();
      }

      function cleanupAndClose() {
        self.removeListener("upgrade", cleanupAndClose);
        self.removeListener("upgradeError", cleanupAndClose);
        close();
      }

      function waitForUpgrade() {
        // wait for upgrade to finish since we can't send packets while pausing a transport
        self.once("upgrade", cleanupAndClose);
        self.once("upgradeError", cleanupAndClose);
      }

      return this;
    }

    /**
     * Called upon transport error
     *
     * @api private
     */
    onError(err) {
      debug$3("socket error %j", err);
      Socket.priorWebsocketSuccess = false;
      this.emit("error", err);
      this.onClose("transport error", err);
    }

    /**
     * Called upon transport close.
     *
     * @api private
     */
    onClose(reason, desc) {
      if (
        "opening" === this.readyState ||
        "open" === this.readyState ||
        "closing" === this.readyState
      ) {
        debug$3('socket close with reason: "%s"', reason);
        const self = this;

        // clear timers
        clearTimeout(this.pingIntervalTimer);
        clearTimeout(this.pingTimeoutTimer);

        // stop event from firing again for transport
        this.transport.removeAllListeners("close");

        // ensure transport won't stay open
        this.transport.close();

        // ignore further transport communication
        this.transport.removeAllListeners();

        // set ready state
        this.readyState = "closed";

        // clear session id
        this.id = null;

        // emit close event
        this.emit("close", reason, desc);

        // clean buffers after, so users can still
        // grab the buffers on `close` event
        self.writeBuffer = [];
        self.prevBufferLen = 0;
      }
    }

    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} server upgrades
     * @api private
     *
     */
    filterUpgrades(upgrades) {
      const filteredUpgrades = [];
      let i = 0;
      const j = upgrades.length;
      for (; i < j; i++) {
        if (~this.transports.indexOf(upgrades[i]))
          filteredUpgrades.push(upgrades[i]);
      }
      return filteredUpgrades;
    }
  }

  Socket.priorWebsocketSuccess = false;

  /**
   * Protocol version.
   *
   * @api public
   */

  Socket.protocol = lib$1.protocol; // this is an int

  function clone(obj) {
    const o = {};
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        o[i] = obj[i];
      }
    }
    return o;
  }

  var socket = Socket;

  var lib$2 = (uri, opts) => new socket(uri, opts);

  /**
   * Expose deps for legacy compatibility
   * and standalone browser access.
   */

  var Socket_1 = socket;
  var protocol = socket.protocol; // this is an int
  var Transport$1 = transport;
  var transports$1 = transports;
  var parser = lib$1;
  lib$2.Socket = Socket_1;
  lib$2.protocol = protocol;
  lib$2.Transport = Transport$1;
  lib$2.transports = transports$1;
  lib$2.parser = parser;

  var isBinary_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.hasBinary = exports.isBinary = void 0;
  const withNativeArrayBuffer = typeof ArrayBuffer === "function";
  const isView = (obj) => {
      return typeof ArrayBuffer.isView === "function"
          ? ArrayBuffer.isView(obj)
          : obj.buffer instanceof ArrayBuffer;
  };
  const toString = Object.prototype.toString;
  const withNativeBlob = typeof Blob === "function" ||
      (typeof Blob !== "undefined" &&
          toString.call(Blob) === "[object BlobConstructor]");
  const withNativeFile = typeof File === "function" ||
      (typeof File !== "undefined" &&
          toString.call(File) === "[object FileConstructor]");
  /**
   * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
   *
   * @private
   */
  function isBinary(obj) {
      return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
          (withNativeBlob && obj instanceof Blob) ||
          (withNativeFile && obj instanceof File));
  }
  exports.isBinary = isBinary;
  function hasBinary(obj, toJSON) {
      if (!obj || typeof obj !== "object") {
          return false;
      }
      if (Array.isArray(obj)) {
          for (let i = 0, l = obj.length; i < l; i++) {
              if (hasBinary(obj[i])) {
                  return true;
              }
          }
          return false;
      }
      if (isBinary(obj)) {
          return true;
      }
      if (obj.toJSON &&
          typeof obj.toJSON === "function" &&
          arguments.length === 1) {
          return hasBinary(obj.toJSON(), true);
      }
      for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
              return true;
          }
      }
      return false;
  }
  exports.hasBinary = hasBinary;
  });

  unwrapExports(isBinary_1);
  var isBinary_2 = isBinary_1.hasBinary;
  var isBinary_3 = isBinary_1.isBinary;

  var binary = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.reconstructPacket = exports.deconstructPacket = void 0;

  /**
   * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
   *
   * @param {Object} packet - socket.io event packet
   * @return {Object} with deconstructed packet and list of buffers
   * @public
   */
  function deconstructPacket(packet) {
      const buffers = [];
      const packetData = packet.data;
      const pack = packet;
      pack.data = _deconstructPacket(packetData, buffers);
      pack.attachments = buffers.length; // number of binary 'attachments'
      return { packet: pack, buffers: buffers };
  }
  exports.deconstructPacket = deconstructPacket;
  function _deconstructPacket(data, buffers) {
      if (!data)
          return data;
      if (isBinary_1.isBinary(data)) {
          const placeholder = { _placeholder: true, num: buffers.length };
          buffers.push(data);
          return placeholder;
      }
      else if (Array.isArray(data)) {
          const newData = new Array(data.length);
          for (let i = 0; i < data.length; i++) {
              newData[i] = _deconstructPacket(data[i], buffers);
          }
          return newData;
      }
      else if (typeof data === "object" && !(data instanceof Date)) {
          const newData = {};
          for (const key in data) {
              if (data.hasOwnProperty(key)) {
                  newData[key] = _deconstructPacket(data[key], buffers);
              }
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
   * @public
   */
  function reconstructPacket(packet, buffers) {
      packet.data = _reconstructPacket(packet.data, buffers);
      packet.attachments = undefined; // no longer useful
      return packet;
  }
  exports.reconstructPacket = reconstructPacket;
  function _reconstructPacket(data, buffers) {
      if (!data)
          return data;
      if (data && data._placeholder) {
          return buffers[data.num]; // appropriate buffer (should be natural order anyway)
      }
      else if (Array.isArray(data)) {
          for (let i = 0; i < data.length; i++) {
              data[i] = _reconstructPacket(data[i], buffers);
          }
      }
      else if (typeof data === "object") {
          for (const key in data) {
              if (data.hasOwnProperty(key)) {
                  data[key] = _reconstructPacket(data[key], buffers);
              }
          }
      }
      return data;
  }
  });

  unwrapExports(binary);
  var binary_1 = binary.reconstructPacket;
  var binary_2 = binary.deconstructPacket;

  var dist = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Decoder = exports.Encoder = exports.PacketType = exports.protocol = void 0;



  const debug = browser("socket.io-parser");
  /**
   * Protocol version.
   *
   * @public
   */
  exports.protocol = 5;
  var PacketType;
  (function (PacketType) {
      PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
      PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
      PacketType[PacketType["EVENT"] = 2] = "EVENT";
      PacketType[PacketType["ACK"] = 3] = "ACK";
      PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
      PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
      PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
  })(PacketType = exports.PacketType || (exports.PacketType = {}));
  /**
   * A socket.io Encoder instance
   */
  class Encoder {
      /**
       * Encode a packet as a single string if non-binary, or as a
       * buffer sequence, depending on packet type.
       *
       * @param {Object} obj - packet object
       */
      encode(obj) {
          debug("encoding packet %j", obj);
          if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
              if (isBinary_1.hasBinary(obj)) {
                  obj.type =
                      obj.type === PacketType.EVENT
                          ? PacketType.BINARY_EVENT
                          : PacketType.BINARY_ACK;
                  return this.encodeAsBinary(obj);
              }
          }
          return [this.encodeAsString(obj)];
      }
      /**
       * Encode packet as string.
       */
      encodeAsString(obj) {
          // first is type
          let str = "" + obj.type;
          // attachments if we have them
          if (obj.type === PacketType.BINARY_EVENT ||
              obj.type === PacketType.BINARY_ACK) {
              str += obj.attachments + "-";
          }
          // if we have a namespace other than `/`
          // we append it followed by a comma `,`
          if (obj.nsp && "/" !== obj.nsp) {
              str += obj.nsp + ",";
          }
          // immediately followed by the id
          if (null != obj.id) {
              str += obj.id;
          }
          // json data
          if (null != obj.data) {
              str += JSON.stringify(obj.data);
          }
          debug("encoded %j as %s", obj, str);
          return str;
      }
      /**
       * Encode packet as 'buffer sequence' by removing blobs, and
       * deconstructing packet into object with placeholders and
       * a list of buffers.
       */
      encodeAsBinary(obj) {
          const deconstruction = binary.deconstructPacket(obj);
          const pack = this.encodeAsString(deconstruction.packet);
          const buffers = deconstruction.buffers;
          buffers.unshift(pack); // add packet info to beginning of data list
          return buffers; // write all the buffers
      }
  }
  exports.Encoder = Encoder;
  /**
   * A socket.io Decoder instance
   *
   * @return {Object} decoder
   */
  class Decoder extends componentEmitter {
      constructor() {
          super();
      }
      /**
       * Decodes an encoded packet string into packet JSON.
       *
       * @param {String} obj - encoded packet
       */
      add(obj) {
          let packet;
          if (typeof obj === "string") {
              packet = this.decodeString(obj);
              if (packet.type === PacketType.BINARY_EVENT ||
                  packet.type === PacketType.BINARY_ACK) {
                  // binary packet's json
                  this.reconstructor = new BinaryReconstructor(packet);
                  // no attachments, labeled binary but no binary data to follow
                  if (packet.attachments === 0) {
                      super.emit("decoded", packet);
                  }
              }
              else {
                  // non-binary full packet
                  super.emit("decoded", packet);
              }
          }
          else if (isBinary_1.isBinary(obj) || obj.base64) {
              // raw binary data
              if (!this.reconstructor) {
                  throw new Error("got binary data when not reconstructing a packet");
              }
              else {
                  packet = this.reconstructor.takeBinaryData(obj);
                  if (packet) {
                      // received final buffer
                      this.reconstructor = null;
                      super.emit("decoded", packet);
                  }
              }
          }
          else {
              throw new Error("Unknown type: " + obj);
          }
      }
      /**
       * Decode a packet String (JSON data)
       *
       * @param {String} str
       * @return {Object} packet
       */
      decodeString(str) {
          let i = 0;
          // look up type
          const p = {
              type: Number(str.charAt(0)),
          };
          if (PacketType[p.type] === undefined) {
              throw new Error("unknown packet type " + p.type);
          }
          // look up attachments if type binary
          if (p.type === PacketType.BINARY_EVENT ||
              p.type === PacketType.BINARY_ACK) {
              const start = i + 1;
              while (str.charAt(++i) !== "-" && i != str.length) { }
              const buf = str.substring(start, i);
              if (buf != Number(buf) || str.charAt(i) !== "-") {
                  throw new Error("Illegal attachments");
              }
              p.attachments = Number(buf);
          }
          // look up namespace (if any)
          if ("/" === str.charAt(i + 1)) {
              const start = i + 1;
              while (++i) {
                  const c = str.charAt(i);
                  if ("," === c)
                      break;
                  if (i === str.length)
                      break;
              }
              p.nsp = str.substring(start, i);
          }
          else {
              p.nsp = "/";
          }
          // look up id
          const next = str.charAt(i + 1);
          if ("" !== next && Number(next) == next) {
              const start = i + 1;
              while (++i) {
                  const c = str.charAt(i);
                  if (null == c || Number(c) != c) {
                      --i;
                      break;
                  }
                  if (i === str.length)
                      break;
              }
              p.id = Number(str.substring(start, i + 1));
          }
          // look up json data
          if (str.charAt(++i)) {
              const payload = tryParse(str.substr(i));
              if (Decoder.isPayloadValid(p.type, payload)) {
                  p.data = payload;
              }
              else {
                  throw new Error("invalid payload");
              }
          }
          debug("decoded %s as %j", str, p);
          return p;
      }
      static isPayloadValid(type, payload) {
          switch (type) {
              case PacketType.CONNECT:
                  return typeof payload === "object";
              case PacketType.DISCONNECT:
                  return payload === undefined;
              case PacketType.CONNECT_ERROR:
                  return typeof payload === "string" || typeof payload === "object";
              case PacketType.EVENT:
              case PacketType.BINARY_EVENT:
                  return Array.isArray(payload) && typeof payload[0] === "string";
              case PacketType.ACK:
              case PacketType.BINARY_ACK:
                  return Array.isArray(payload);
          }
      }
      /**
       * Deallocates a parser's resources
       */
      destroy() {
          if (this.reconstructor) {
              this.reconstructor.finishedReconstruction();
          }
      }
  }
  exports.Decoder = Decoder;
  function tryParse(str) {
      try {
          return JSON.parse(str);
      }
      catch (e) {
          return false;
      }
  }
  /**
   * A manager of a binary event's 'buffer sequence'. Should
   * be constructed whenever a packet of type BINARY_EVENT is
   * decoded.
   *
   * @param {Object} packet
   * @return {BinaryReconstructor} initialized reconstructor
   */
  class BinaryReconstructor {
      constructor(packet) {
          this.packet = packet;
          this.buffers = [];
          this.reconPack = packet;
      }
      /**
       * Method to be called when binary data received from connection
       * after a BINARY_EVENT packet.
       *
       * @param {Buffer | ArrayBuffer} binData - the raw binary data received
       * @return {null | Object} returns null if more binary data is expected or
       *   a reconstructed packet object if all buffers have been received.
       */
      takeBinaryData(binData) {
          this.buffers.push(binData);
          if (this.buffers.length === this.reconPack.attachments) {
              // done with buffer list
              const packet = binary.reconstructPacket(this.reconPack, this.buffers);
              this.finishedReconstruction();
              return packet;
          }
          return null;
      }
      /**
       * Cleans up binary packet reconstruction variables.
       */
      finishedReconstruction() {
          this.reconPack = null;
          this.buffers = [];
      }
  }
  });

  unwrapExports(dist);
  var dist_1 = dist.Decoder;
  var dist_2 = dist.Encoder;
  var dist_3 = dist.PacketType;
  var dist_4 = dist.protocol;

  var on_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.on = void 0;
  function on(obj, ev, fn) {
      obj.on(ev, fn);
      return function subDestroy() {
          obj.off(ev, fn);
      };
  }
  exports.on = on;
  });

  unwrapExports(on_1);
  var on_2 = on_1.on;

  var socket$1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Socket = void 0;



  const debug = browser("socket.io-client:socket");
  /**
   * Internal events.
   * These events can't be emitted by the user.
   */
  const RESERVED_EVENTS = Object.freeze({
      connect: 1,
      connect_error: 1,
      disconnect: 1,
      disconnecting: 1,
      // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
      newListener: 1,
      removeListener: 1,
  });
  class Socket extends componentEmitter {
      /**
       * `Socket` constructor.
       *
       * @public
       */
      constructor(io, nsp, opts) {
          super();
          this.receiveBuffer = [];
          this.sendBuffer = [];
          this.ids = 0;
          this.acks = {};
          this.flags = {};
          this.io = io;
          this.nsp = nsp;
          this.ids = 0;
          this.acks = {};
          this.receiveBuffer = [];
          this.sendBuffer = [];
          this.connected = false;
          this.disconnected = true;
          this.flags = {};
          if (opts && opts.auth) {
              this.auth = opts.auth;
          }
          if (this.io._autoConnect)
              this.open();
      }
      /**
       * Subscribe to open, close and packet events
       *
       * @private
       */
      subEvents() {
          if (this.subs)
              return;
          const io = this.io;
          this.subs = [
              on_1.on(io, "open", this.onopen.bind(this)),
              on_1.on(io, "packet", this.onpacket.bind(this)),
              on_1.on(io, "error", this.onerror.bind(this)),
              on_1.on(io, "close", this.onclose.bind(this)),
          ];
      }
      /**
       * Whether the Socket will try to reconnect when its Manager connects or reconnects
       */
      get active() {
          return !!this.subs;
      }
      /**
       * "Opens" the socket.
       *
       * @public
       */
      connect() {
          if (this.connected)
              return this;
          this.subEvents();
          if (!this.io["_reconnecting"])
              this.io.open(); // ensure open
          if ("open" === this.io._readyState)
              this.onopen();
          return this;
      }
      /**
       * Alias for connect()
       */
      open() {
          return this.connect();
      }
      /**
       * Sends a `message` event.
       *
       * @return self
       * @public
       */
      send(...args) {
          args.unshift("message");
          this.emit.apply(this, args);
          return this;
      }
      /**
       * Override `emit`.
       * If the event is in `events`, it's emitted normally.
       *
       * @param ev - event name
       * @return self
       * @public
       */
      emit(ev, ...args) {
          if (RESERVED_EVENTS.hasOwnProperty(ev)) {
              throw new Error('"' + ev + '" is a reserved event name');
          }
          args.unshift(ev);
          const packet = {
              type: dist.PacketType.EVENT,
              data: args,
          };
          packet.options = {};
          packet.options.compress = this.flags.compress !== false;
          // event ack callback
          if ("function" === typeof args[args.length - 1]) {
              debug("emitting packet with ack id %d", this.ids);
              this.acks[this.ids] = args.pop();
              packet.id = this.ids++;
          }
          const isTransportWritable = this.io.engine &&
              this.io.engine.transport &&
              this.io.engine.transport.writable;
          const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
          if (discardPacket) {
              debug("discard packet as the transport is not currently writable");
          }
          else if (this.connected) {
              this.packet(packet);
          }
          else {
              this.sendBuffer.push(packet);
          }
          this.flags = {};
          return this;
      }
      /**
       * Sends a packet.
       *
       * @param packet
       * @private
       */
      packet(packet) {
          packet.nsp = this.nsp;
          this.io._packet(packet);
      }
      /**
       * Called upon engine `open`.
       *
       * @private
       */
      onopen() {
          debug("transport is open - connecting");
          if (typeof this.auth == "function") {
              this.auth((data) => {
                  this.packet({ type: dist.PacketType.CONNECT, data });
              });
          }
          else {
              this.packet({ type: dist.PacketType.CONNECT, data: this.auth });
          }
      }
      /**
       * Called upon engine or manager `error`.
       *
       * @param err
       * @private
       */
      onerror(err) {
          if (!this.connected) {
              super.emit("connect_error", err);
          }
      }
      /**
       * Called upon engine `close`.
       *
       * @param reason
       * @private
       */
      onclose(reason) {
          debug("close (%s)", reason);
          this.connected = false;
          this.disconnected = true;
          delete this.id;
          super.emit("disconnect", reason);
      }
      /**
       * Called with socket packet.
       *
       * @param packet
       * @private
       */
      onpacket(packet) {
          const sameNamespace = packet.nsp === this.nsp;
          if (!sameNamespace)
              return;
          switch (packet.type) {
              case dist.PacketType.CONNECT:
                  if (packet.data && packet.data.sid) {
                      const id = packet.data.sid;
                      this.onconnect(id);
                  }
                  else {
                      super.emit("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                  }
                  break;
              case dist.PacketType.EVENT:
                  this.onevent(packet);
                  break;
              case dist.PacketType.BINARY_EVENT:
                  this.onevent(packet);
                  break;
              case dist.PacketType.ACK:
                  this.onack(packet);
                  break;
              case dist.PacketType.BINARY_ACK:
                  this.onack(packet);
                  break;
              case dist.PacketType.DISCONNECT:
                  this.ondisconnect();
                  break;
              case dist.PacketType.CONNECT_ERROR:
                  const err = new Error(packet.data.message);
                  // @ts-ignore
                  err.data = packet.data.data;
                  super.emit("connect_error", err);
                  break;
          }
      }
      /**
       * Called upon a server event.
       *
       * @param packet
       * @private
       */
      onevent(packet) {
          const args = packet.data || [];
          debug("emitting event %j", args);
          if (null != packet.id) {
              debug("attaching ack callback to event");
              args.push(this.ack(packet.id));
          }
          if (this.connected) {
              this.emitEvent(args);
          }
          else {
              this.receiveBuffer.push(Object.freeze(args));
          }
      }
      emitEvent(args) {
          if (this._anyListeners && this._anyListeners.length) {
              const listeners = this._anyListeners.slice();
              for (const listener of listeners) {
                  listener.apply(this, args);
              }
          }
          super.emit.apply(this, args);
      }
      /**
       * Produces an ack callback to emit with an event.
       *
       * @private
       */
      ack(id) {
          const self = this;
          let sent = false;
          return function (...args) {
              // prevent double callbacks
              if (sent)
                  return;
              sent = true;
              debug("sending ack %j", args);
              self.packet({
                  type: dist.PacketType.ACK,
                  id: id,
                  data: args,
              });
          };
      }
      /**
       * Called upon a server acknowlegement.
       *
       * @param packet
       * @private
       */
      onack(packet) {
          const ack = this.acks[packet.id];
          if ("function" === typeof ack) {
              debug("calling ack %s with %j", packet.id, packet.data);
              ack.apply(this, packet.data);
              delete this.acks[packet.id];
          }
          else {
              debug("bad ack %s", packet.id);
          }
      }
      /**
       * Called upon server connect.
       *
       * @private
       */
      onconnect(id) {
          debug("socket connected with id %s", id);
          this.id = id;
          this.connected = true;
          this.disconnected = false;
          super.emit("connect");
          this.emitBuffered();
      }
      /**
       * Emit buffered events (received and emitted).
       *
       * @private
       */
      emitBuffered() {
          this.receiveBuffer.forEach((args) => this.emitEvent(args));
          this.receiveBuffer = [];
          this.sendBuffer.forEach((packet) => this.packet(packet));
          this.sendBuffer = [];
      }
      /**
       * Called upon server disconnect.
       *
       * @private
       */
      ondisconnect() {
          debug("server disconnect (%s)", this.nsp);
          this.destroy();
          this.onclose("io server disconnect");
      }
      /**
       * Called upon forced client/server side disconnections,
       * this method ensures the manager stops tracking us and
       * that reconnections don't get triggered for this.
       *
       * @private
       */
      destroy() {
          if (this.subs) {
              // clean subscriptions to avoid reconnections
              this.subs.forEach((subDestroy) => subDestroy());
              this.subs = undefined;
          }
          this.io["_destroy"](this);
      }
      /**
       * Disconnects the socket manually.
       *
       * @return self
       * @public
       */
      disconnect() {
          if (this.connected) {
              debug("performing disconnect (%s)", this.nsp);
              this.packet({ type: dist.PacketType.DISCONNECT });
          }
          // remove socket from pool
          this.destroy();
          if (this.connected) {
              // fire events
              this.onclose("io client disconnect");
          }
          return this;
      }
      /**
       * Alias for disconnect()
       *
       * @return self
       * @public
       */
      close() {
          return this.disconnect();
      }
      /**
       * Sets the compress flag.
       *
       * @param compress - if `true`, compresses the sending data
       * @return self
       * @public
       */
      compress(compress) {
          this.flags.compress = compress;
          return this;
      }
      /**
       * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
       * ready to send messages.
       *
       * @returns self
       * @public
       */
      get volatile() {
          this.flags.volatile = true;
          return this;
      }
      /**
       * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
       * callback.
       *
       * @param listener
       * @public
       */
      onAny(listener) {
          this._anyListeners = this._anyListeners || [];
          this._anyListeners.push(listener);
          return this;
      }
      /**
       * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
       * callback. The listener is added to the beginning of the listeners array.
       *
       * @param listener
       * @public
       */
      prependAny(listener) {
          this._anyListeners = this._anyListeners || [];
          this._anyListeners.unshift(listener);
          return this;
      }
      /**
       * Removes the listener that will be fired when any event is emitted.
       *
       * @param listener
       * @public
       */
      offAny(listener) {
          if (!this._anyListeners) {
              return this;
          }
          if (listener) {
              const listeners = this._anyListeners;
              for (let i = 0; i < listeners.length; i++) {
                  if (listener === listeners[i]) {
                      listeners.splice(i, 1);
                      return this;
                  }
              }
          }
          else {
              this._anyListeners = [];
          }
          return this;
      }
      /**
       * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
       * e.g. to remove listeners.
       *
       * @public
       */
      listenersAny() {
          return this._anyListeners || [];
      }
  }
  exports.Socket = Socket;
  });

  unwrapExports(socket$1);
  var socket_1 = socket$1.Socket;

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

  var manager = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Manager = void 0;






  const debug = browser("socket.io-client:manager");
  class Manager extends componentEmitter {
      constructor(uri, opts) {
          super();
          this.nsps = {};
          this.subs = [];
          if (uri && "object" === typeof uri) {
              opts = uri;
              uri = undefined;
          }
          opts = opts || {};
          opts.path = opts.path || "/socket.io";
          this.opts = opts;
          this.reconnection(opts.reconnection !== false);
          this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
          this.reconnectionDelay(opts.reconnectionDelay || 1000);
          this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
          this.randomizationFactor(opts.randomizationFactor || 0.5);
          this.backoff = new backo2({
              min: this.reconnectionDelay(),
              max: this.reconnectionDelayMax(),
              jitter: this.randomizationFactor(),
          });
          this.timeout(null == opts.timeout ? 20000 : opts.timeout);
          this._readyState = "closed";
          this.uri = uri;
          const _parser = opts.parser || dist;
          this.encoder = new _parser.Encoder();
          this.decoder = new _parser.Decoder();
          this._autoConnect = opts.autoConnect !== false;
          if (this._autoConnect)
              this.open();
      }
      reconnection(v) {
          if (!arguments.length)
              return this._reconnection;
          this._reconnection = !!v;
          return this;
      }
      reconnectionAttempts(v) {
          if (v === undefined)
              return this._reconnectionAttempts;
          this._reconnectionAttempts = v;
          return this;
      }
      reconnectionDelay(v) {
          var _a;
          if (v === undefined)
              return this._reconnectionDelay;
          this._reconnectionDelay = v;
          (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
          return this;
      }
      randomizationFactor(v) {
          var _a;
          if (v === undefined)
              return this._randomizationFactor;
          this._randomizationFactor = v;
          (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
          return this;
      }
      reconnectionDelayMax(v) {
          var _a;
          if (v === undefined)
              return this._reconnectionDelayMax;
          this._reconnectionDelayMax = v;
          (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
          return this;
      }
      timeout(v) {
          if (!arguments.length)
              return this._timeout;
          this._timeout = v;
          return this;
      }
      /**
       * Starts trying to reconnect if reconnection is enabled and we have not
       * started reconnecting yet
       *
       * @private
       */
      maybeReconnectOnOpen() {
          // Only try to reconnect if it's the first time we're connecting
          if (!this._reconnecting &&
              this._reconnection &&
              this.backoff.attempts === 0) {
              // keeps reconnection from firing twice for the same reconnection loop
              this.reconnect();
          }
      }
      /**
       * Sets the current transport `socket`.
       *
       * @param {Function} fn - optional, callback
       * @return self
       * @public
       */
      open(fn) {
          debug("readyState %s", this._readyState);
          if (~this._readyState.indexOf("open"))
              return this;
          debug("opening %s", this.uri);
          this.engine = lib$2(this.uri, this.opts);
          const socket = this.engine;
          const self = this;
          this._readyState = "opening";
          this.skipReconnect = false;
          // emit `open`
          const openSubDestroy = on_1.on(socket, "open", function () {
              self.onopen();
              fn && fn();
          });
          // emit `error`
          const errorSub = on_1.on(socket, "error", (err) => {
              debug("error");
              self.cleanup();
              self._readyState = "closed";
              super.emit("error", err);
              if (fn) {
                  fn(err);
              }
              else {
                  // Only do this if there is no fn to handle the error
                  self.maybeReconnectOnOpen();
              }
          });
          if (false !== this._timeout) {
              const timeout = this._timeout;
              debug("connect attempt will timeout after %d", timeout);
              if (timeout === 0) {
                  openSubDestroy(); // prevents a race condition with the 'open' event
              }
              // set timer
              const timer = setTimeout(() => {
                  debug("connect attempt timed out after %d", timeout);
                  openSubDestroy();
                  socket.close();
                  socket.emit("error", new Error("timeout"));
              }, timeout);
              this.subs.push(function subDestroy() {
                  clearTimeout(timer);
              });
          }
          this.subs.push(openSubDestroy);
          this.subs.push(errorSub);
          return this;
      }
      /**
       * Alias for open()
       *
       * @return self
       * @public
       */
      connect(fn) {
          return this.open(fn);
      }
      /**
       * Called upon transport open.
       *
       * @private
       */
      onopen() {
          debug("open");
          // clear old subs
          this.cleanup();
          // mark as open
          this._readyState = "open";
          super.emit("open");
          // add new subs
          const socket = this.engine;
          this.subs.push(on_1.on(socket, "ping", this.onping.bind(this)), on_1.on(socket, "data", this.ondata.bind(this)), on_1.on(socket, "error", this.onerror.bind(this)), on_1.on(socket, "close", this.onclose.bind(this)), on_1.on(this.decoder, "decoded", this.ondecoded.bind(this)));
      }
      /**
       * Called upon a ping.
       *
       * @private
       */
      onping() {
          super.emit("ping");
      }
      /**
       * Called with data.
       *
       * @private
       */
      ondata(data) {
          this.decoder.add(data);
      }
      /**
       * Called when parser fully decodes a packet.
       *
       * @private
       */
      ondecoded(packet) {
          super.emit("packet", packet);
      }
      /**
       * Called upon socket error.
       *
       * @private
       */
      onerror(err) {
          debug("error", err);
          super.emit("error", err);
      }
      /**
       * Creates a new socket for the given `nsp`.
       *
       * @return {Socket}
       * @public
       */
      socket(nsp, opts) {
          let socket = this.nsps[nsp];
          if (!socket) {
              socket = new socket$1.Socket(this, nsp, opts);
              this.nsps[nsp] = socket;
          }
          return socket;
      }
      /**
       * Called upon a socket close.
       *
       * @param socket
       * @private
       */
      _destroy(socket) {
          const nsps = Object.keys(this.nsps);
          for (const nsp of nsps) {
              const socket = this.nsps[nsp];
              if (socket.active) {
                  debug("socket %s is still active, skipping close", nsp);
                  return;
              }
          }
          this._close();
      }
      /**
       * Writes a packet.
       *
       * @param packet
       * @private
       */
      _packet(packet) {
          debug("writing packet %j", packet);
          if (packet.query && packet.type === 0)
              packet.nsp += "?" + packet.query;
          const encodedPackets = this.encoder.encode(packet);
          for (let i = 0; i < encodedPackets.length; i++) {
              this.engine.write(encodedPackets[i], packet.options);
          }
      }
      /**
       * Clean up transport subscriptions and packet buffer.
       *
       * @private
       */
      cleanup() {
          debug("cleanup");
          this.subs.forEach((subDestroy) => subDestroy());
          this.subs.length = 0;
          this.decoder.destroy();
      }
      /**
       * Close the current socket.
       *
       * @private
       */
      _close() {
          debug("disconnect");
          this.skipReconnect = true;
          this._reconnecting = false;
          if ("opening" === this._readyState) {
              // `onclose` will not fire because
              // an open event never happened
              this.cleanup();
          }
          this.backoff.reset();
          this._readyState = "closed";
          if (this.engine)
              this.engine.close();
      }
      /**
       * Alias for close()
       *
       * @private
       */
      disconnect() {
          return this._close();
      }
      /**
       * Called upon engine close.
       *
       * @private
       */
      onclose(reason) {
          debug("onclose");
          this.cleanup();
          this.backoff.reset();
          this._readyState = "closed";
          super.emit("close", reason);
          if (this._reconnection && !this.skipReconnect) {
              this.reconnect();
          }
      }
      /**
       * Attempt a reconnection.
       *
       * @private
       */
      reconnect() {
          if (this._reconnecting || this.skipReconnect)
              return this;
          const self = this;
          if (this.backoff.attempts >= this._reconnectionAttempts) {
              debug("reconnect failed");
              this.backoff.reset();
              super.emit("reconnect_failed");
              this._reconnecting = false;
          }
          else {
              const delay = this.backoff.duration();
              debug("will wait %dms before reconnect attempt", delay);
              this._reconnecting = true;
              const timer = setTimeout(() => {
                  if (self.skipReconnect)
                      return;
                  debug("attempting reconnect");
                  super.emit("reconnect_attempt", self.backoff.attempts);
                  // check again for the case socket closed in above events
                  if (self.skipReconnect)
                      return;
                  self.open((err) => {
                      if (err) {
                          debug("reconnect attempt error");
                          self._reconnecting = false;
                          self.reconnect();
                          super.emit("reconnect_error", err);
                      }
                      else {
                          debug("reconnect success");
                          self.onreconnect();
                      }
                  });
              }, delay);
              this.subs.push(function subDestroy() {
                  clearTimeout(timer);
              });
          }
      }
      /**
       * Called upon successful reconnect.
       *
       * @private
       */
      onreconnect() {
          const attempt = this.backoff.attempts;
          this._reconnecting = false;
          this.backoff.reset();
          super.emit("reconnect", attempt);
      }
  }
  exports.Manager = Manager;
  });

  unwrapExports(manager);
  var manager_1 = manager.Manager;

  var build = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Socket = exports.io = exports.Manager = exports.protocol = void 0;



  Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket$1.Socket; } });
  const debug = browser("socket.io-client");
  /**
   * Module exports.
   */
  module.exports = exports = lookup;
  /**
   * Managers cache.
   */
  const cache = (exports.managers = {});
  function lookup(uri, opts) {
      if (typeof uri === "object") {
          opts = uri;
          uri = undefined;
      }
      opts = opts || {};
      const parsed = url_1.url(uri);
      const source = parsed.source;
      const id = parsed.id;
      const path = parsed.path;
      const sameNamespace = cache[id] && path in cache[id]["nsps"];
      const newConnection = opts.forceNew ||
          opts["force new connection"] ||
          false === opts.multiplex ||
          sameNamespace;
      let io;
      if (newConnection) {
          debug("ignoring socket cache for %s", source);
          io = new manager.Manager(source, opts);
      }
      else {
          if (!cache[id]) {
              debug("new io instance for %s", source);
              cache[id] = new manager.Manager(source, opts);
          }
          io = cache[id];
      }
      if (parsed.query && !opts.query) {
          opts.query = parsed.query;
      }
      return io.socket(parsed.path, opts);
  }
  exports.io = lookup;
  /**
   * Protocol version.
   *
   * @public
   */

  Object.defineProperty(exports, "protocol", { enumerable: true, get: function () { return dist.protocol; } });
  /**
   * `connect`.
   *
   * @param {String} uri
   * @public
   */
  exports.connect = lookup;
  /**
   * Expose constructors for standalone build.
   *
   * @public
   */
  var manager_2 = manager;
  Object.defineProperty(exports, "Manager", { enumerable: true, get: function () { return manager_2.Manager; } });
  });

  var ioClient = unwrapExports(build);
  var build_1 = build.Socket;
  var build_2 = build.io;
  var build_3 = build.Manager;
  var build_4 = build.protocol;
  var build_5 = build.managers;
  var build_6 = build.connect;

  var SIXTY_PER_SEC = 1000 / 60;
  var LOOP_SLOW_THRESH = 0.3;
  var LOOP_SLOW_COUNT = 10;
  /**
   * Scheduler class
   *
   */

  var Scheduler =
  /*#__PURE__*/
  function () {
    /**
     * schedule a function to be called
     *
     * @param {Object} options the options
     * @param {Function} options.tick the function to be called
     * @param {Number} options.period number of milliseconds between each invocation, not including the function's execution time
     * @param {Number} options.delay number of milliseconds to add when delaying or hurrying the execution
     */
    function Scheduler(options) {
      _classCallCheck(this, Scheduler);

      this.options = Object.assign({
        tick: null,
        period: SIXTY_PER_SEC,
        delay: SIXTY_PER_SEC / 3
      }, options);
      this.nextExecTime = null;
      this.requestedDelay = 0;
      this.delayCounter = 0; // mixin for EventEmitter

      var eventEmitter$1 = new eventEmitter();
      this.on = eventEmitter$1.on;
      this.once = eventEmitter$1.once;
      this.removeListener = eventEmitter$1.removeListener;
      this.emit = eventEmitter$1.emit;
    } // in same cases, setTimeout is ignored by the browser,
    // this is known to happen during the first 100ms of a touch event
    // on android chrome.  Double-check the game loop using requestAnimationFrame


    _createClass(Scheduler, [{
      key: "nextTickChecker",
      value: function nextTickChecker() {
        var currentTime = new Date().getTime();

        if (currentTime > this.nextExecTime) {
          this.delayCounter++;
          this.callTick();
          this.nextExecTime = currentTime + this.options.stepPeriod;
        }

        window.requestAnimationFrame(this.nextTickChecker.bind(this));
      }
    }, {
      key: "nextTick",
      value: function nextTick() {
        var stepStartTime = new Date().getTime();

        if (stepStartTime > this.nextExecTime + this.options.period * LOOP_SLOW_THRESH) {
          this.delayCounter++;
        } else this.delayCounter = 0;

        this.callTick();
        this.nextExecTime = stepStartTime + this.options.period + this.requestedDelay;
        this.requestedDelay = 0;
        setTimeout(this.nextTick.bind(this), this.nextExecTime - new Date().getTime());
      }
    }, {
      key: "callTick",
      value: function callTick() {
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

    }, {
      key: "start",
      value: function start() {
        setTimeout(this.nextTick.bind(this));
        if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(this.nextTickChecker.bind(this));
        return this;
      }
      /**
       * delay next execution
       */

    }, {
      key: "delayTick",
      value: function delayTick() {
        this.requestedDelay += this.options.delay;
      }
      /**
       * hurry the next execution
       */

    }, {
      key: "hurryTick",
      value: function hurryTick() {
        this.requestedDelay -= this.options.delay;
      }
    }]);

    return Scheduler;
  }();

  var SyncStrategy =
  /*#__PURE__*/
  function () {
    function SyncStrategy(clientEngine, inputOptions) {
      _classCallCheck(this, SyncStrategy);

      this.clientEngine = clientEngine;
      this.gameEngine = clientEngine.gameEngine;
      this.needFirstSync = true;
      this.options = Object.assign({}, inputOptions);
      this.gameEngine.on('client__postStep', this.syncStep.bind(this));
      this.gameEngine.on('client__syncReceived', this.collectSync.bind(this));
      this.requiredSyncs = [];
      this.SYNC_APPLIED = 'SYNC_APPLIED';
      this.STEP_DRIFT_THRESHOLDS = {
        onServerSync: {
          MAX_LEAD: 1,
          MAX_LAG: 3
        },
        // max step lead/lag allowed after every server sync
        onEveryStep: {
          MAX_LEAD: 7,
          MAX_LAG: 8
        },
        // max step lead/lag allowed at every step
        clientReset: 20 // if we are behind this many steps, just reset the step counter

      };
    } // collect a sync and its events
    // maintain a "lastSync" member which describes the last sync we received from
    // the server.  the lastSync object contains:
    //  - syncObjects: all events in the sync indexed by the id of the object involved
    //  - syncSteps: all events in the sync indexed by the step on which they occurred
    //  - objCount
    //  - eventCount
    //  - stepCount


    _createClass(SyncStrategy, [{
      key: "collectSync",
      value: function collectSync(e) {
        // on first connect we need to wait for a full world update
        if (this.needFirstSync) {
          if (!e.fullUpdate) return;
        } else {
          // TODO: there is a problem below in the case where the client is 10 steps behind the server,
          // and the syncs that arrive are always in the future and never get processed.  To address this
          // we may need to store more than one sync.
          // ignore syncs which are older than the latest
          if (this.lastSync && this.lastSync.stepCount && this.lastSync.stepCount > e.stepCount) return;
        } // before we overwrite the last sync, check if it was a required sync
        // syncs that create or delete objects are saved because they must be applied.


        if (this.lastSync && this.lastSync.required) {
          this.requiredSyncs.push(this.lastSync);
        } // build new sync object


        var lastSync = this.lastSync = {
          stepCount: e.stepCount,
          fullUpdate: e.fullUpdate,
          syncObjects: {},
          syncSteps: {}
        };
        e.syncEvents.forEach(function (sEvent) {
          // keep a reference of events by object id
          if (sEvent.objectInstance) {
            var objectId = sEvent.objectInstance.id;
            if (!lastSync.syncObjects[objectId]) lastSync.syncObjects[objectId] = [];
            lastSync.syncObjects[objectId].push(sEvent);
          } // keep a reference of events by step


          var stepCount = sEvent.stepCount;
          var eventName = sEvent.eventName;

          if (eventName === 'objectDestroy' || eventName === 'objectCreate') {
            lastSync.required = true;
          }

          if (!lastSync.syncSteps[stepCount]) lastSync.syncSteps[stepCount] = {};
          if (!lastSync.syncSteps[stepCount][eventName]) lastSync.syncSteps[stepCount][eventName] = [];
          lastSync.syncSteps[stepCount][eventName].push(sEvent);
        });
        var eventCount = e.syncEvents.length;
        var objCount = Object.keys(lastSync.syncObjects).length;
        var stepCount = Object.keys(lastSync.syncSteps).length;
        this.gameEngine.trace.debug(function () {
          return "sync contains ".concat(objCount, " objects ").concat(eventCount, " events ").concat(stepCount, " steps");
        });
      } // add an object to our world

    }, {
      key: "addNewObject",
      value: function addNewObject(objId, newObj, options) {
        var curObj = new newObj.constructor(this.gameEngine, {
          id: objId
        }); // enforce object implementations of syncTo

        if (!curObj.__proto__.hasOwnProperty('syncTo')) {
          throw "GameObject of type ".concat(curObj.class, " does not implement the syncTo() method, which must copy the netscheme");
        }

        curObj.syncTo(newObj); //this.gameEngine.addObjectToWorld(curObj);

        if (this.clientEngine.options.verbose) console.log("adding new object ".concat(curObj));
        return curObj;
      } // sync to step, by applying bending, and applying the latest sync

    }, {
      key: "syncStep",
      value: function syncStep(stepDesc) {
        var _this = this;

        // apply incremental bending
        this.gameEngine.world.forEachObject(function (id, o) {
          if (typeof o.applyIncrementalBending === 'function') {
            o.applyIncrementalBending(stepDesc);
            o.refreshToPhysics();
          }
        }); // apply all pending required syncs

        var _loop = function _loop() {
          var requiredStep = _this.requiredSyncs[0].stepCount; // if we haven't reached the corresponding step, it's too soon to apply syncs

          if (requiredStep > _this.gameEngine.world.stepCount) return {
            v: void 0
          };

          _this.gameEngine.trace.trace(function () {
            return "applying a required sync ".concat(requiredStep);
          });

          _this.applySync(_this.requiredSyncs.shift(), true);
        };

        while (this.requiredSyncs.length) {
          var _ret = _loop();

          if (_typeof(_ret) === "object") return _ret.v;
        } // apply the sync and delete it on success


        if (this.lastSync) {
          var rc = this.applySync(this.lastSync, false);
          if (rc === this.SYNC_APPLIED) this.lastSync = null;
        }
      }
    }]);

    return SyncStrategy;
  }();

  var defaults = {
    clientStepHold: 6,
    localObjBending: 1.0,
    // amount of bending towards position of sync object
    remoteObjBending: 1.0,
    // amount of bending towards position of sync object
    bendingIncrements: 6,
    // the bending should be applied increments (how many steps for entire bend)
    reflect: false
  };

  var InterpolateStrategy =
  /*#__PURE__*/
  function (_SyncStrategy) {
    _inherits(InterpolateStrategy, _SyncStrategy);

    function InterpolateStrategy(clientEngine, inputOptions) {
      var _this;

      _classCallCheck(this, InterpolateStrategy);

      var options = Object.assign({}, defaults, inputOptions);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(InterpolateStrategy).call(this, clientEngine, options));
      _this.gameEngine.ignoreInputs = true; // client side engine ignores inputs

      _this.gameEngine.ignorePhysics = true; // client side engine ignores physics

      _this.STEP_DRIFT_THRESHOLDS = {
        onServerSync: {
          MAX_LEAD: -8,
          MAX_LAG: 16
        },
        // max step lead/lag allowed after every server sync
        onEveryStep: {
          MAX_LEAD: -4,
          MAX_LAG: 24
        },
        // max step lead/lag allowed at every step
        clientReset: 40 // if we are behind this many steps, just reset the step counter

      };
      return _this;
    } // apply a new sync


    _createClass(InterpolateStrategy, [{
      key: "applySync",
      value: function applySync(sync, required) {
        var _this2 = this;

        // if sync is in the past we cannot interpolate to it
        if (!required && sync.stepCount <= this.gameEngine.world.stepCount) {
          return this.SYNC_APPLIED;
        }

        this.gameEngine.trace.debug(function () {
          return 'interpolate applying sync';
        }); //
        //    scan all the objects in the sync
        //
        // 1. if the object exists locally, sync to the server object
        // 2. if the object is new, just create it
        //

        this.needFirstSync = false;
        var world = this.gameEngine.world;

        var _arr = Object.keys(sync.syncObjects);

        var _loop = function _loop() {
          var ids = _arr[_i];
          // TODO: we are currently taking only the first event out of
          // the events that may have arrived for this object
          var ev = sync.syncObjects[ids][0];
          var curObj = world.objects[ev.objectInstance.id];

          if (curObj) {
            // case 1: this object already exists locally
            _this2.gameEngine.trace.trace(function () {
              return "object before syncTo: ".concat(curObj.toString());
            });

            curObj.saveState();
            curObj.syncTo(ev.objectInstance);

            _this2.gameEngine.trace.trace(function () {
              return "object after syncTo: ".concat(curObj.toString(), " synced to step[").concat(ev.stepCount, "]");
            });
          } else {
            // case 2: object does not exist.  create it now
            _this2.addNewObject(ev.objectInstance.id, ev.objectInstance);
          }
        };

        for (var _i = 0; _i < _arr.length; _i++) {
          _loop();
        } //
        // bend back to original state
        //


        var _arr2 = Object.keys(world.objects);

        var _loop2 = function _loop2() {
          var objId = _arr2[_i2];
          var obj = world.objects[objId];
          var isLocal = obj.playerId == _this2.gameEngine.playerId; // eslint-disable-line eqeqeq

          var bending = isLocal ? _this2.options.localObjBending : _this2.options.remoteObjBending;
          obj.bendToCurrentState(bending, _this2.gameEngine.worldSettings, isLocal, _this2.options.bendingIncrements);
          if (typeof obj.refreshRenderObject === 'function') obj.refreshRenderObject();

          _this2.gameEngine.trace.trace(function () {
            return "object[".concat(objId, "] ").concat(obj.bendingToString());
          });
        };

        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
          _loop2();
        } // destroy objects
        // TODO: use world.forEachObject((id, ob) => {});
        // TODO: identical code is in InterpolateStrategy


        var _arr3 = Object.keys(world.objects);

        var _loop3 = function _loop3() {
          var objId = _arr3[_i3];
          var objEvents = sync.syncObjects[objId]; // if this was a full sync, and we did not get a corresponding object,
          // remove the local object

          if (sync.fullUpdate && !objEvents && objId < _this2.gameEngine.options.clientIDSpace) {
            _this2.gameEngine.removeObjectFromWorld(objId);

            return "continue";
          }

          if (!objEvents || objId >= _this2.gameEngine.options.clientIDSpace) return "continue"; // if we got an objectDestroy event, destroy the object

          objEvents.forEach(function (e) {
            if (e.eventName === 'objectDestroy') _this2.gameEngine.removeObjectFromWorld(objId);
          });
        };

        for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
          var _ret = _loop3();

          if (_ret === "continue") continue;
        }

        return this.SYNC_APPLIED;
      }
    }]);

    return InterpolateStrategy;
  }(SyncStrategy);

  var defaults$1 = {
    syncsBufferLength: 5,
    maxReEnactSteps: 60,
    // maximum number of steps to re-enact
    RTTEstimate: 2,
    // estimate the RTT as two steps (for updateRate=6, that's 200ms)
    extrapolate: 2,
    // player performs method "X" which means extrapolate to match server time. that 100 + (0..100)
    localObjBending: 0.1,
    // amount of bending towards position of sync object
    remoteObjBending: 0.6,
    // amount of bending towards position of sync object
    bendingIncrements: 10 // the bending should be applied increments (how many steps for entire bend)

  };

  var ExtrapolateStrategy =
  /*#__PURE__*/
  function (_SyncStrategy) {
    _inherits(ExtrapolateStrategy, _SyncStrategy);

    function ExtrapolateStrategy(clientEngine, inputOptions) {
      var _this;

      _classCallCheck(this, ExtrapolateStrategy);

      var options = Object.assign({}, defaults$1, inputOptions);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(ExtrapolateStrategy).call(this, clientEngine, options));
      _this.lastSync = null;
      _this.recentInputs = {};

      _this.gameEngine.on('client__processInput', _this.clientInputSave.bind(_assertThisInitialized(_this)));

      _this.STEP_DRIFT_THRESHOLDS = {
        onServerSync: {
          MAX_LEAD: 2,
          MAX_LAG: 3
        },
        // max step lead/lag allowed after every server sync
        onEveryStep: {
          MAX_LEAD: 7,
          MAX_LAG: 4
        },
        // max step lead/lag allowed at every step
        clientReset: 40 // if we are behind this many steps, just reset the step counter

      };
      return _this;
    } // keep a buffer of inputs so that we can replay them on extrapolation


    _createClass(ExtrapolateStrategy, [{
      key: "clientInputSave",
      value: function clientInputSave(inputEvent) {
        // if no inputs have been stored for this step, create an array
        if (!this.recentInputs[inputEvent.input.step]) {
          this.recentInputs[inputEvent.input.step] = [];
        }

        this.recentInputs[inputEvent.input.step].push(inputEvent.input);
      } // clean up the input buffer

    }, {
      key: "cleanRecentInputs",
      value: function cleanRecentInputs(lastServerStep) {
        var _arr = Object.keys(this.recentInputs);

        for (var _i = 0; _i < _arr.length; _i++) {
          var input = _arr[_i];

          if (this.recentInputs[input][0].step <= lastServerStep) {
            delete this.recentInputs[input];
          }
        }
      } // apply a new sync

    }, {
      key: "applySync",
      value: function applySync(sync, required) {
        var _this2 = this;

        // if sync is in the future, we are not ready to apply yet.
        if (!required && sync.stepCount > this.gameEngine.world.stepCount) {
          return null;
        }

        this.gameEngine.trace.debug(function () {
          return 'extrapolate applying sync';
        }); //
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
        var world = this.gameEngine.world;
        var serverStep = sync.stepCount;

        var _arr2 = Object.keys(sync.syncObjects);

        var _loop = function _loop() {
          var ids = _arr2[_i2];
          // TODO: we are currently taking only the first event out of
          // the events that may have arrived for this object
          var ev = sync.syncObjects[ids][0];
          var curObj = world.objects[ev.objectInstance.id];

          var localShadowObj = _this2.gameEngine.findLocalShadow(ev.objectInstance);

          if (localShadowObj) {
            // case 1: this object has a local shadow object on the client
            _this2.gameEngine.trace.debug(function () {
              return "object ".concat(ev.objectInstance.id, " replacing local shadow ").concat(localShadowObj.id);
            });

            if (!world.objects.hasOwnProperty(ev.objectInstance.id)) {
              var newObj = _this2.addNewObject(ev.objectInstance.id, ev.objectInstance, {
                visible: false
              });

              newObj.saveState(localShadowObj);
            }

            _this2.gameEngine.removeObjectFromWorld(localShadowObj.id);
          } else if (curObj) {
            // case 2: this object already exists locally
            _this2.gameEngine.trace.trace(function () {
              return "object before syncTo: ".concat(curObj.toString());
            });

            curObj.saveState();
            curObj.syncTo(ev.objectInstance);

            _this2.gameEngine.trace.trace(function () {
              return "object after syncTo: ".concat(curObj.toString(), " synced to step[").concat(ev.stepCount, "]");
            });
          } else {
            // case 3: object does not exist.  create it now
            _this2.addNewObject(ev.objectInstance.id, ev.objectInstance);
          }
        };

        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
          _loop();
        } //
        // reenact the steps that we want to extrapolate forwards
        //


        this.gameEngine.trace.debug(function () {
          return "extrapolate re-enacting steps from [".concat(serverStep, "] to [").concat(world.stepCount, "]");
        });

        if (serverStep < world.stepCount - this.options.maxReEnactSteps) {
          serverStep = world.stepCount - this.options.maxReEnactSteps;
          this.gameEngine.trace.info(function () {
            return "too many steps to re-enact.  Starting from [".concat(serverStep, "] to [").concat(world.stepCount, "]");
          });
        }

        var clientStep = world.stepCount;

        for (world.stepCount = serverStep; world.stepCount < clientStep;) {
          if (this.recentInputs[world.stepCount]) {
            this.recentInputs[world.stepCount].forEach(function (inputDesc) {
              // only movement inputs are re-enacted
              if (!inputDesc.options || !inputDesc.options.movement) return;

              _this2.gameEngine.trace.trace(function () {
                return "extrapolate re-enacting movement input[".concat(inputDesc.messageIndex, "]: ").concat(inputDesc.input);
              });

              _this2.gameEngine.processInput(inputDesc, _this2.gameEngine.playerId);
            });
          } // run the game engine step in "reenact" mode


          this.gameEngine.step(true);
        }

        this.cleanRecentInputs(serverStep); //
        // bend back to original state
        //

        var _arr3 = Object.keys(world.objects);

        var _loop2 = function _loop2() {
          var objId = _arr3[_i3];
          // shadow objects are not bent
          if (objId >= _this2.gameEngine.options.clientIDSpace) return "continue"; // TODO: using == instead of === because of string/number mismatch
          //       These values should always be strings (which contain a number)
          //       Reminder: the reason we use a string is that these
          //       values are sometimes used as object keys

          var obj = world.objects[objId];
          var isLocal = obj.playerId == _this2.gameEngine.playerId; // eslint-disable-line eqeqeq

          var bending = isLocal ? _this2.options.localObjBending : _this2.options.remoteObjBending;
          obj.bendToCurrentState(bending, _this2.gameEngine.worldSettings, isLocal, _this2.options.bendingIncrements);
          if (typeof obj.refreshRenderObject === 'function') obj.refreshRenderObject();

          _this2.gameEngine.trace.trace(function () {
            return "object[".concat(objId, "] ").concat(obj.bendingToString());
          });
        };

        for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
          var _ret = _loop2();

          if (_ret === "continue") continue;
        } // trace object state after sync


        var _arr4 = Object.keys(world.objects);

        var _loop3 = function _loop3() {
          var objId = _arr4[_i4];

          _this2.gameEngine.trace.trace(function () {
            return "object after extrapolate replay: ".concat(world.objects[objId].toString());
          });
        };

        for (var _i4 = 0; _i4 < _arr4.length; _i4++) {
          _loop3();
        } // destroy objects
        // TODO: use world.forEachObject((id, ob) => {});
        // TODO: identical code is in InterpolateStrategy


        var _arr5 = Object.keys(world.objects);

        var _loop4 = function _loop4() {
          var objId = _arr5[_i5];
          var objEvents = sync.syncObjects[objId]; // if this was a full sync, and we did not get a corresponding object,
          // remove the local object

          if (sync.fullUpdate && !objEvents && objId < _this2.gameEngine.options.clientIDSpace) {
            _this2.gameEngine.removeObjectFromWorld(objId);

            return "continue";
          }

          if (!objEvents || objId >= _this2.gameEngine.options.clientIDSpace) return "continue"; // if we got an objectDestroy event, destroy the object

          objEvents.forEach(function (e) {
            if (e.eventName === 'objectDestroy') _this2.gameEngine.removeObjectFromWorld(objId);
          });
        };

        for (var _i5 = 0; _i5 < _arr5.length; _i5++) {
          var _ret2 = _loop4();

          if (_ret2 === "continue") continue;
        }

        return this.SYNC_APPLIED;
      }
    }]);

    return ExtrapolateStrategy;
  }(SyncStrategy);

  var defaults$2 = {
    worldBufferLength: 60,
    clientStepLag: 0
  };

  var FrameSyncStrategy =
  /*#__PURE__*/
  function (_SyncStrategy) {
    _inherits(FrameSyncStrategy, _SyncStrategy);

    function FrameSyncStrategy(clientEngine, inputOptions) {
      var _this;

      _classCallCheck(this, FrameSyncStrategy);

      var options = Object.assign({}, defaults$2, inputOptions);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(FrameSyncStrategy).call(this, clientEngine, options));
      _this.gameEngine = _this.clientEngine.gameEngine;
      return _this;
    } // apply a new sync


    _createClass(FrameSyncStrategy, [{
      key: "applySync",
      value: function applySync(sync, required) {
        var _this2 = this;

        this.needFirstSync = false;
        this.gameEngine.trace.debug(function () {
          return 'framySync applying sync';
        });
        var world = this.gameEngine.world;

        var _arr = Object.keys(sync.syncObjects);

        for (var _i = 0; _i < _arr.length; _i++) {
          var ids = _arr[_i];
          var ev = sync.syncObjects[ids][0];
          var curObj = world.objects[ev.objectInstance.id];

          if (curObj) {
            curObj.syncTo(ev.objectInstance);
          } else {
            this.addNewObject(ev.objectInstance.id, ev.objectInstance);
          }
        } // destroy objects


        var _arr2 = Object.keys(world.objects);

        var _loop = function _loop() {
          var objId = _arr2[_i2];
          var objEvents = sync.syncObjects[objId]; // if this was a full sync, and we did not get a corresponding object,
          // remove the local object

          if (sync.fullUpdate && !objEvents && objId < _this2.gameEngine.options.clientIDSpace) {
            _this2.gameEngine.removeObjectFromWorld(objId);

            return "continue";
          }

          if (!objEvents || objId >= _this2.gameEngine.options.clientIDSpace) return "continue"; // if we got an objectDestroy event, destroy the object

          objEvents.forEach(function (e) {
            if (e.eventName === 'objectDestroy') _this2.gameEngine.removeObjectFromWorld(objId);
          });
        };

        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
          var _ret = _loop();

          if (_ret === "continue") continue;
        }

        return this.SYNC_APPLIED;
      }
    }]);

    return FrameSyncStrategy;
  }(SyncStrategy);

  var strategies = {
    extrapolate: ExtrapolateStrategy,
    interpolate: InterpolateStrategy,
    frameSync: FrameSyncStrategy
  };

  var Synchronizer = // create a synchronizer instance
  function Synchronizer(clientEngine, options) {
    _classCallCheck(this, Synchronizer);

    this.clientEngine = clientEngine;
    this.options = options || {};

    if (!strategies.hasOwnProperty(this.options.sync)) {
      throw new Error("ERROR: unknown synchronzation strategy ".concat(this.options.sync));
    }

    this.syncStrategy = new strategies[this.options.sync](this.clientEngine, this.options);
  };

  var MAX_UINT_16 = 0xFFFF;
  /**
   * The Serializer is responsible for serializing the game world and its
   * objects on the server, before they are sent to each client.  On the client side the
   * Serializer deserializes these objects.
   *
   */

  var Serializer =
  /*#__PURE__*/
  function () {
    function Serializer() {
      _classCallCheck(this, Serializer);

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


    _createClass(Serializer, [{
      key: "addCustomType",
      value: function addCustomType(customType) {
        this.customTypes[customType.type] = customType;
      }
      /**
       * Checks if type can be assigned by value.
       * @param {String} type Type to Checks
       * @return {Boolean} True if type can be assigned
       */

    }, {
      key: "registerClass",

      /**
       * Registers a new class with the serializer, so it may be deserialized later
       * @param {Function} classObj reference to the class (not an instance!)
       * @param {String} classId Unit specifying a class ID
       */
      value: function registerClass(classObj, classId) {
        // if no classId is specified, hash one from the class name
        classId = classId ? classId : Utils.hashStr(classObj.name);

        if (this.registeredClasses[classId]) {
          console.error("Serializer: accidental override of classId ".concat(classId, " when registering class"), classObj);
        }

        this.registeredClasses[classId] = classObj;
      }
    }, {
      key: "deserialize",
      value: function deserialize(dataBuffer, byteOffset) {
        byteOffset = byteOffset ? byteOffset : 0;
        var localByteOffset = 0;
        var dataView = new DataView(dataBuffer);
        var objectClassId = dataView.getUint8(byteOffset + localByteOffset); // todo if classId is 0 - take care of dynamic serialization.

        var objectClass = this.registeredClasses[objectClassId];

        if (objectClass == null) {
          console.error('Serializer: Found a class which was not registered.  Please use serializer.registerClass() to register all serialized classes.');
        }

        localByteOffset += Uint8Array.BYTES_PER_ELEMENT; // advance the byteOffset after the classId
        // create de-referenced instance of the class. gameEngine and id will be 'tacked on' later at the sync strategies

        var obj = new objectClass(null, {
          id: null
        });
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(objectClass.netScheme).sort()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var property = _step.value;
            var read = this.readDataView(dataView, byteOffset + localByteOffset, objectClass.netScheme[property]);
            obj[property] = read.data;
            localByteOffset += read.bufferSize;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return {
          obj: obj,
          byteOffset: localByteOffset
        };
      }
    }, {
      key: "writeDataView",
      value: function writeDataView(dataView, value, bufferOffset, netSchemProp) {
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
            var strLen = value.length;
            dataView.setUint16(bufferOffset, strLen);
            var localBufferOffset = 2;

            for (var i = 0; i < strLen; i++) {
              dataView.setUint16(bufferOffset + localBufferOffset + i * 2, value.charCodeAt(i));
            }
          }
        } else if (netSchemProp.type === BaseTypes.TYPES.CLASSINSTANCE) {
          value.serialize(this, {
            dataBuffer: dataView.buffer,
            bufferOffset: bufferOffset
          });
        } else if (netSchemProp.type === BaseTypes.TYPES.LIST) {
          var _localBufferOffset = 0; // a list is comprised of the number of items followed by the items

          dataView.setUint16(bufferOffset + _localBufferOffset, value.length);
          _localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var item = _step2.value;

              // TODO: inelegant, currently doesn't support list of lists
              if (netSchemProp.itemType === BaseTypes.TYPES.CLASSINSTANCE) {
                var serializedObj = item.serialize(this, {
                  dataBuffer: dataView.buffer,
                  bufferOffset: bufferOffset + _localBufferOffset
                });
                _localBufferOffset += serializedObj.bufferOffset;
              } else if (netSchemProp.itemType === BaseTypes.TYPES.STRING) {
                //   MAX_UINT_16 is a reserved (length) value which indicates string hasn't changed
                if (item === null) {
                  dataView.setUint16(bufferOffset + _localBufferOffset, MAX_UINT_16);
                  _localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
                } else {
                  var _strLen = item.length;
                  dataView.setUint16(bufferOffset + _localBufferOffset, _strLen);
                  _localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;

                  for (var _i = 0; _i < _strLen; _i++) {
                    dataView.setUint16(bufferOffset + _localBufferOffset + _i * 2, item.charCodeAt(_i));
                  }

                  _localBufferOffset += Uint16Array.BYTES_PER_ELEMENT * _strLen;
                }
              } else {
                this.writeDataView(dataView, item, bufferOffset + _localBufferOffset, {
                  type: netSchemProp.itemType
                });
                _localBufferOffset += this.getTypeByteSize(netSchemProp.itemType);
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        } else if (this.customTypes[netSchemProp.type]) {
          // this is a custom data property which needs to define its own write method
          this.customTypes[netSchemProp.type].writeDataView(dataView, value, bufferOffset);
        } else {
          console.error("No custom property ".concat(netSchemProp.type, " found!"));
        }
      }
    }, {
      key: "readDataView",
      value: function readDataView(dataView, bufferOffset, netSchemProp) {
        var data, bufferSize;

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
          var length = dataView.getUint16(bufferOffset);
          var localBufferOffset = Uint16Array.BYTES_PER_ELEMENT;
          bufferSize = localBufferOffset;

          if (length === MAX_UINT_16) {
            data = null;
          } else {
            var a = [];

            for (var i = 0; i < length; i++) {
              a[i] = dataView.getUint16(bufferOffset + localBufferOffset + i * 2);
            }

            data = String.fromCharCode.apply(null, a);
            bufferSize += length * Uint16Array.BYTES_PER_ELEMENT;
          }
        } else if (netSchemProp.type === BaseTypes.TYPES.CLASSINSTANCE) {
          var deserializeData = this.deserialize(dataView.buffer, bufferOffset);
          data = deserializeData.obj;
          bufferSize = deserializeData.byteOffset;
        } else if (netSchemProp.type === BaseTypes.TYPES.LIST) {
          var _localBufferOffset2 = 0;
          var items = [];
          var itemCount = dataView.getUint16(bufferOffset + _localBufferOffset2);
          _localBufferOffset2 += Uint16Array.BYTES_PER_ELEMENT;

          for (var x = 0; x < itemCount; x++) {
            var read = this.readDataView(dataView, bufferOffset + _localBufferOffset2, {
              type: netSchemProp.itemType
            });
            items.push(read.data);
            _localBufferOffset2 += read.bufferSize;
          }

          data = items;
          bufferSize = _localBufferOffset2;
        } else if (this.customTypes[netSchemProp.type] != null) {
          // this is a custom data property which needs to define its own read method
          data = this.customTypes[netSchemProp.type].readDataView(dataView, bufferOffset);
        } else {
          console.error("No custom property ".concat(netSchemProp.type, " found!"));
        }

        return {
          data: data,
          bufferSize: bufferSize
        };
      }
    }, {
      key: "getTypeByteSize",
      value: function getTypeByteSize(type) {
        switch (type) {
          case BaseTypes.TYPES.FLOAT32:
            {
              return Float32Array.BYTES_PER_ELEMENT;
            }

          case BaseTypes.TYPES.INT32:
            {
              return Int32Array.BYTES_PER_ELEMENT;
            }

          case BaseTypes.TYPES.INT16:
            {
              return Int16Array.BYTES_PER_ELEMENT;
            }

          case BaseTypes.TYPES.INT8:
            {
              return Int8Array.BYTES_PER_ELEMENT;
            }

          case BaseTypes.TYPES.UINT8:
            {
              return Uint8Array.BYTES_PER_ELEMENT;
            }
          // not one of the basic properties

          default:
            {
              if (type === undefined) {
                throw 'netScheme property declared without type attribute!';
              } else if (this.customTypes[type] === null) {
                throw "netScheme property ".concat(type, " undefined! Did you forget to add it to the serializer?");
              } else {
                return this.customTypes[type].BYTES_PER_ELEMENT;
              }
            }
        }
      }
    }], [{
      key: "typeCanAssign",
      value: function typeCanAssign(type) {
        return type !== BaseTypes.TYPES.CLASSINSTANCE && type !== BaseTypes.TYPES.LIST;
      }
    }]);

    return Serializer;
  }();

  /**
   * Measures network performance between the client and the server
   * Represents both the client and server portions of NetworkMonitor
   */

  var NetworkMonitor =
  /*#__PURE__*/
  function () {
    function NetworkMonitor(server) {
      _classCallCheck(this, NetworkMonitor);

      // server-side keep game name
      if (server) {
        this.server = server;
        this.gameName = Object.getPrototypeOf(server.gameEngine).constructor.name;
      } // mixin for EventEmitter


      var eventEmitter$1 = new eventEmitter();
      this.on = eventEmitter$1.on;
      this.once = eventEmitter$1.once;
      this.removeListener = eventEmitter$1.removeListener;
      this.emit = eventEmitter$1.emit;
    } // client


    _createClass(NetworkMonitor, [{
      key: "registerClient",
      value: function registerClient(clientEngine) {
        this.queryIdCounter = 0;
        this.RTTQueries = {};
        this.movingRTTAverage = 0;
        this.movingRTTAverageFrame = [];
        this.movingFPSAverageSize = clientEngine.options.healthCheckRTTSample;
        this.clientEngine = clientEngine;
        clientEngine.socket.on('RTTResponse', this.onReceivedRTTQuery.bind(this));
        setInterval(this.sendRTTQuery.bind(this), clientEngine.options.healthCheckInterval);
      }
    }, {
      key: "sendRTTQuery",
      value: function sendRTTQuery() {
        // todo implement cleanup of older timestamp
        this.RTTQueries[this.queryIdCounter] = new Date().getTime();
        this.clientEngine.socket.emit('RTTQuery', this.queryIdCounter);
        this.queryIdCounter++;
      }
    }, {
      key: "onReceivedRTTQuery",
      value: function onReceivedRTTQuery(queryId) {
        var RTT = new Date().getTime() - this.RTTQueries[queryId];
        this.movingRTTAverageFrame.push(RTT);

        if (this.movingRTTAverageFrame.length > this.movingFPSAverageSize) {
          this.movingRTTAverageFrame.shift();
        }

        this.movingRTTAverage = this.movingRTTAverageFrame.reduce(function (a, b) {
          return a + b;
        }) / this.movingRTTAverageFrame.length;
        this.emit('RTTUpdate', {
          RTT: RTT,
          RTTAverage: this.movingRTTAverage
        });
      } // server

    }, {
      key: "registerPlayerOnServer",
      value: function registerPlayerOnServer(socket) {
        socket.on('RTTQuery', this.respondToRTTQuery.bind(this, socket));

        if (this.server && this.server.options.countConnections) {
          http.get("http://ping.games-eu.lance.gg:2000/".concat(this.gameName)).on('error', function () {});
        }
      }
    }, {
      key: "respondToRTTQuery",
      value: function respondToRTTQuery(socket, queryId) {
        socket.emit('RTTResponse', queryId);
      }
    }]);

    return NetworkMonitor;
  }();

  var NetworkedEventFactory =
  /*#__PURE__*/
  function () {
    function NetworkedEventFactory(serializer, eventName, options) {
      _classCallCheck(this, NetworkedEventFactory);

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


    _createClass(NetworkedEventFactory, [{
      key: "create",
      value: function create(payload) {
        var networkedEvent = new Serializable();
        networkedEvent.classId = Utils.hashStr(this.eventName);
        networkedEvent.eventName = this.eventName;

        if (this.netScheme) {
          networkedEvent.netScheme = Object.assign({}, this.netScheme); // copy properties from the networkedEvent instance to its ad-hoc netsScheme

          var _arr = Object.keys(this.netScheme);

          for (var _i = 0; _i < _arr.length; _i++) {
            var property = _arr[_i];
            networkedEvent[property] = payload[property];
          }
        }

        return networkedEvent;
      }
    }]);

    return NetworkedEventFactory;
  }();

  /**
   * Defines a collection of NetworkEvents to be transmitted over the wire
   */

  var NetworkedEventCollection =
  /*#__PURE__*/
  function (_Serializable) {
    _inherits(NetworkedEventCollection, _Serializable);

    _createClass(NetworkedEventCollection, null, [{
      key: "netScheme",
      get: function get() {
        return {
          events: {
            type: BaseTypes.TYPES.LIST,
            itemType: BaseTypes.TYPES.CLASSINSTANCE
          }
        };
      }
    }]);

    function NetworkedEventCollection(events) {
      var _this;

      _classCallCheck(this, NetworkedEventCollection);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(NetworkedEventCollection).call(this));
      _this.events = events || [];
      return _this;
    }

    return NetworkedEventCollection;
  }(Serializable);

  var NetworkTransmitter =
  /*#__PURE__*/
  function () {
    function NetworkTransmitter(serializer, world) {
      var _this = this;

      _classCallCheck(this, NetworkTransmitter);

      this.serializer = serializer;
      this.world = world;
      this.registeredEvents = [];
      this.networkedEventCollection = {};
      this.serializer.registerClass(NetworkedEventCollection);
      this.registerNetworkedEventFactory('objectUpdate', {
        netScheme: {
          stepCount: {
            type: BaseTypes.TYPES.INT32
          },
          objectInstance: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          }
        }
      });
      this.registerNetworkedEventFactory('objectCreate', {
        netScheme: {
          stepCount: {
            type: BaseTypes.TYPES.INT32
          },
          objectInstance: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          }
        }
      });
      this.registerNetworkedEventFactory('objectDestroy', {
        netScheme: {
          stepCount: {
            type: BaseTypes.TYPES.INT32
          },
          objectInstance: {
            type: BaseTypes.TYPES.CLASSINSTANCE
          }
        }
      });
      this.registerNetworkedEventFactory('syncHeader', {
        netScheme: {
          stepCount: {
            type: BaseTypes.TYPES.INT32
          },
          fullUpdate: {
            type: BaseTypes.TYPES.UINT8
          }
        }
      });

      world.onAddGroup = function (name) {
        _this.networkedEventCollection[name] = new NetworkedEventCollection();
      };

      world.onRemoveGroup = function (name) {
        delete _this.networkedEventCollection[name];
      };
    }

    _createClass(NetworkTransmitter, [{
      key: "registerNetworkedEventFactory",
      value: function registerNetworkedEventFactory(eventName, options) {
        options = Object.assign({}, options);
        var classHash = Utils.hashStr(eventName);

        var networkedEventPrototype = function networkedEventPrototype() {};

        networkedEventPrototype.prototype.classId = classHash;
        networkedEventPrototype.prototype.eventName = eventName;
        networkedEventPrototype.netScheme = options.netScheme;
        this.serializer.registerClass(networkedEventPrototype, classHash);
        this.registeredEvents[eventName] = new NetworkedEventFactory(this.serializer, eventName, options);
      }
    }, {
      key: "addNetworkedEvent",
      value: function addNetworkedEvent(roomName, eventName, payload) {
        if (!this.registeredEvents[eventName]) {
          console.error("NetworkTransmitter: no such event ".concat(eventName));
          return null;
        }

        if (!this.networkedEventCollection[roomName]) {
          return null;
        }

        var stagedNetworkedEvent = this.registeredEvents[eventName].create(payload);
        this.networkedEventCollection[roomName].events.push(stagedNetworkedEvent);
        return stagedNetworkedEvent;
      }
    }, {
      key: "serializePayload",
      value: function serializePayload(roomName) {
        if (!this.networkedEventCollection[roomName]) {
          return null;
        }

        if (this.networkedEventCollection[roomName].events.length === 0) return null;
        var dataBuffer = this.networkedEventCollection[roomName].serialize(this.serializer);
        return dataBuffer;
      }
    }, {
      key: "deserializePayload",
      value: function deserializePayload(payload) {
        return this.serializer.deserialize(payload.dataBuffer).obj;
      }
    }, {
      key: "clearPayload",
      value: function clearPayload(roomName) {
        this.networkedEventCollection[roomName].events = [];
      }
    }]);

    return NetworkTransmitter;
  }();

  // or better yet, it should be configurable in the GameEngine instead of ServerEngine+ClientEngine

  var GAME_UPS = 60; // default number of game steps per second

  var STEP_DELAY_MSEC = 12; // if forward drift detected, delay next execution by this amount

  var STEP_HURRY_MSEC = 8; // if backward drift detected, hurry next execution by this amount

  /**
   * The client engine is the singleton which manages the client-side
   * process, starting the game engine, listening to network messages,
   * starting client steps, and handling world updates which arrive from
   * the server.
   * Normally, a game will implement its own sub-class of ClientEngine, and may
   * override the constructor {@link ClientEngine#constructor} and the methods
   * {@link ClientEngine#start} and {@link ClientEngine#connect}
   */

  var ClientEngine =
  /*#__PURE__*/
  function () {
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
    function ClientEngine(gameEngine, io, inputOptions, Renderer) {
      _classCallCheck(this, ClientEngine);

      this.options = Object.assign({
        autoConnect: true,
        healthCheckInterval: 1000,
        healthCheckRTTSample: 10,
        stepPeriod: 1000 / GAME_UPS,
        scheduler: 'render-schedule',
        serverURL: null,
        showLatency: false
      }, inputOptions);
      this.io = io || ioClient;
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
      this.outboundMessages = []; // create the renderer

      this.renderer = this.gameEngine.renderer = new Renderer(gameEngine, this); // step scheduler

      this.scheduler = null;
      this.lastStepTime = 0;
      this.correction = 0;

      if (this.options.standaloneMode !== true) {
        this.configureSynchronization();
      } // create a buffer of delayed inputs (fifo)


      if (inputOptions && inputOptions.delayInputCount) {
        this.delayedInputs = [];

        for (var i = 0; i < inputOptions.delayInputCount; i++) {
          this.delayedInputs[i] = [];
        }
      }

      this.gameEngine.emit('client__init');
    } // configure the Synchronizer singleton


    _createClass(ClientEngine, [{
      key: "configureSynchronization",
      value: function configureSynchronization() {
        // the reflect syncronizer is just interpolate strategy,
        // configured to show server syncs
        var syncOptions = this.options.syncOptions;

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

    }, {
      key: "connect",
      value: function connect() {
        var _this = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (this.gameEngine.standalone) {
          this.socket = this.io;
        } else {
          this.socket = this.io(options);
        }

        this.networkMonitor.registerClient(this);
        this.socket.on('playerJoined', function (playerData) {
          _this.gameEngine.playerId = playerData.playerId;
          _this.messageIndex = _this.gameEngine.playerId;
        });
        this.socket.on('worldUpdate', function (worldData) {
          _this.inboundMessages.push(worldData);
        });
        this.socket.on('roomUpdate', function (roomData) {
          _this.gameEngine.emit('client__roomUpdate', roomData);
        });
        var startTime;

        if (this.options.showLatency) {
          setInterval(function () {
            startTime = Date.now();

            _this.socket.emit('_ping');
          }, 2000);
        }

        this.socket.on('_pong', function () {
          var latency = Date.now() - startTime;
          if (_this.onLatency) _this.onLatency(latency);
        });

        if (this.gameEngine.standalone) {
          this.io.connection();
        }
      }
    }, {
      key: "updateObjectData",
      value: function updateObjectData(data) {
        var logic = this.gameEngine.world.getObject(data);

        if (logic) {
          if (!logic) return null;
          if (!logic.data) logic.data = {};

          for (var key in data) {
            if (key == 'id') continue;
            logic.data[key] = data[key];
          }

          this.gameEngine.emit('client__objectUpdate', {
            object: logic,
            data: data
          });
        }

        return !!logic;
      }
      /**
       * Start the client engine, setting up the game loop, rendering loop and renderer.
       *
       * @return {Promise} Resolves once the Renderer has been initialized, and the game is
       * ready to connect
       */

    }, {
      key: "start",
      value: function start() {
        var _this2 = this;

        this.stopped = false;
        this.resolved = false; // initialize the renderer
        // the render loop waits for next animation frame

        if (!this.renderer) alert('ERROR: game has not defined a renderer');

        var renderLoop = function renderLoop(timestamp) {
          if (_this2.stopped) {
            _this2.renderer.stop();

            return;
          }

          _this2.lastTimestamp = _this2.lastTimestamp || timestamp;

          _this2.renderer.draw(timestamp, timestamp - _this2.lastTimestamp);

          _this2.lastTimestamp = timestamp;
          window.requestAnimationFrame(renderLoop);
        };

        return this.renderer.init().then(function () {
          _this2.gameEngine.start();

          _this2.networkTransmitter = new NetworkTransmitter(_this2.serializer, _this2.gameEngine.world);

          if (_this2.options.scheduler === 'fixed') {
            // schedule and start the game loop
            _this2.scheduler = new Scheduler({
              period: _this2.options.stepPeriod,
              tick: _this2.step.bind(_this2),
              delay: STEP_DELAY_MSEC
            });

            _this2.scheduler.start();
          }

          if (typeof window !== 'undefined') window.requestAnimationFrame(renderLoop);

          if (_this2.options.autoConnect && _this2.options.standaloneMode !== true) {
            return _this2.connect().catch(function (error) {
              _this2.stopped = true;
              throw error;
            });
          }
        }).then(function () {
          return new Promise(function (resolve, reject) {
            _this2.resolveGame = resolve;

            if (_this2.socket) {
              _this2.socket.on('disconnect', function () {
                if (!_this2.resolved && !_this2.stopped) {
                  if (_this2.options.verbose) console.log('disconnected by server...'); //this.stopped = true;

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

    }, {
      key: "disconnect",
      value: function disconnect() {
        if (!this.stopped) {
          this.socket.disconnect();
          this.stopped = true;
        }
      } // check if client step is too far ahead (leading) or too far
      // behing (lagging) the server step

    }, {
      key: "checkDrift",
      value: function checkDrift(checkType) {
        if (!this.gameEngine.highestServerStep) return;
        var thresholds = this.synchronizer.syncStrategy.STEP_DRIFT_THRESHOLDS;
        var maxLead = thresholds[checkType].MAX_LEAD;
        var maxLag = thresholds[checkType].MAX_LAG;
        var clientStep = this.gameEngine.world.stepCount;
        var serverStep = this.gameEngine.highestServerStep;

        if (clientStep > serverStep + maxLead) {
          this.gameEngine.trace.warn(function () {
            return "step drift ".concat(checkType, ". [").concat(clientStep, " > ").concat(serverStep, " + ").concat(maxLead, "] Client is ahead of server.  Delaying next step.");
          });
          if (this.scheduler) this.scheduler.delayTick();
          this.lastStepTime += STEP_DELAY_MSEC;
          this.correction += STEP_DELAY_MSEC;
        } else if (serverStep > clientStep + maxLag) {
          this.gameEngine.trace.warn(function () {
            return "step drift ".concat(checkType, ". [").concat(serverStep, " > ").concat(clientStep, " + ").concat(maxLag, "] Client is behind server.  Hurrying next step.");
          });
          if (this.scheduler) this.scheduler.hurryTick();
          this.lastStepTime -= STEP_HURRY_MSEC;
          this.correction -= STEP_HURRY_MSEC;
        }
      } // execute a single game step.  This is normally called by the Renderer
      // at each draw event.

    }, {
      key: "step",
      value: function step(t, dt, physicsOnly) {
        if (!this.resolved) {
          var result = this.gameEngine.getPlayerGameOverResult();

          if (result) {
            this.resolved = true;
            this.resolveGame(result); // simulation can continue...
            // call disconnect to quit
          }
        } // physics only case


        if (physicsOnly) {
          this.gameEngine.step(false, t, dt, physicsOnly);
          return;
        } // first update the trace state


        this.gameEngine.trace.setStep(this.gameEngine.world.stepCount + 1); // skip one step if requested

        if (this.skipOneStep === true) {
          this.skipOneStep = false;
          return;
        }

        this.gameEngine.emit('client__preStep');

        while (this.inboundMessages.length > 0) {
          this.handleInboundMessage(this.inboundMessages.pop());
          this.checkDrift('onServerSync');
        } // check for server/client step drift without update


        this.checkDrift('onEveryStep'); // perform game engine step

        if (this.options.standaloneMode !== true) {
          this.handleOutboundInput();
        }

        this.applyDelayedInputs();
        this.gameEngine.step(false, t, dt);
        this.gameEngine.emit('client__postStep', {
          dt: dt
        });

        if (this.options.standaloneMode !== true && this.gameEngine.trace.length && this.socket) {
          // socket might not have been initialized at this point
          this.socket.emit('trace', JSON.stringify(this.gameEngine.trace.rotate()));
        }
      } // apply a user input on the client side

    }, {
      key: "doInputLocal",
      value: function doInputLocal(message) {
        // some synchronization strategies (interpolate) ignore inputs on client side
        if (this.gameEngine.ignoreInputs) {
          return;
        }

        var inputEvent = {
          input: message.data,
          playerId: this.gameEngine.playerId
        };
        this.gameEngine.emit('client__processInput', inputEvent);
        this.gameEngine.emit('processInput', inputEvent);
        this.gameEngine.processInput(message.data, this.gameEngine.playerId, false);
      } // apply user inputs which have been queued in order to create
      // an artificial delay

    }, {
      key: "applyDelayedInputs",
      value: function applyDelayedInputs() {
        if (!this.delayedInputs) {
          return;
        }

        var that = this;
        var delayed = this.delayedInputs.shift();

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

    }, {
      key: "sendInput",
      value: function sendInput(input, inputOptions) {
        var _this3 = this;

        var inputEvent = {
          command: 'move',
          data: {
            messageIndex: this.messageIndex,
            step: this.gameEngine.world.stepCount,
            input: input,
            options: inputOptions
          }
        };
        this.gameEngine.trace.info(function () {
          return "USER INPUT[".concat(_this3.messageIndex, "]: ").concat(input, " ").concat(inputOptions ? JSON.stringify(inputOptions) : '{}');
        }); // if we delay input application on client, then queue it
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
      } // handle a message that has been received from the server

    }, {
      key: "handleInboundMessage",
      value: function handleInboundMessage(syncData) {
        var _this4 = this;

        var syncEvents = this.networkTransmitter.deserializePayload(syncData).events;
        var syncHeader = syncEvents.find(function (e) {
          return e.eventName === 'syncHeader';
        }); // emit that a snapshot has been received

        if (!this.gameEngine.highestServerStep || syncHeader.stepCount > this.gameEngine.highestServerStep) this.gameEngine.highestServerStep = syncHeader.stepCount;
        this.gameEngine.emit('client__syncReceived', {
          syncEvents: syncEvents,
          stepCount: syncHeader.stepCount,
          fullUpdate: syncHeader.fullUpdate
        });
        this.gameEngine.trace.info(function () {
          return "========== inbound world update ".concat(syncHeader.stepCount, " ==========");
        }); // finally update the stepCount

        if (syncHeader.stepCount > this.gameEngine.world.stepCount + this.synchronizer.syncStrategy.STEP_DRIFT_THRESHOLDS.clientReset) {
          this.gameEngine.trace.info(function () {
            return "========== world step count updated from ".concat(_this4.gameEngine.world.stepCount, " to  ").concat(syncHeader.stepCount, " ==========");
          });
          this.gameEngine.emit('client__stepReset', {
            oldStep: this.gameEngine.world.stepCount,
            newStep: syncHeader.stepCount
          });
          this.gameEngine.world.stepCount = syncHeader.stepCount;
        }
      } // emit an input to the authoritative server

    }, {
      key: "handleOutboundInput",
      value: function handleOutboundInput() {
        for (var x = 0; x < this.outboundMessages.length; x++) {
          this.socket.emit(this.outboundMessages[x].command, this.outboundMessages[x].data);
        }

        this.outboundMessages = [];
      }
    }]);

    return ClientEngine;
  }();

  // based on http://keycode.info/
  // keyboard handling
  var keyCodeTable = {
    3: 'break',
    8: 'backspace',
    // backspace / delete
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

  var inverse = function inverse(obj) {
    var newObj = {};

    for (var key in obj) {
      var val = obj[key];
      newObj[val] = key;
    }

    return newObj;
  };

  var inverseKeyCodeTable = inverse(keyCodeTable);
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

  var KeyboardControls =
  /*#__PURE__*/
  function () {
    function KeyboardControls(clientEngine, eventEmitter) {
      var _this = this;

      _classCallCheck(this, KeyboardControls);

      this.clientEngine = clientEngine;
      this.gameEngine = clientEngine.gameEngine;
      this.setupListeners(); // keep a reference for key press state

      this.keyState = {}; // a list of bound keys and their corresponding actions

      this.boundKeys = {};
      this.stop = false;
      this.eventEmitter = eventEmitter;
      this.gameEngine.on('client__preStep', function () {
        var _arr = Object.keys(_this.boundKeys);

        for (var _i = 0; _i < _arr.length; _i++) {
          var keyName = _arr[_i];

          if (_this.keyState[keyName] && _this.keyState[keyName].isDown) {
            var _this$boundKeys$keyNa = _this.boundKeys[keyName].options,
                repeat = _this$boundKeys$keyNa.repeat,
                method = _this$boundKeys$keyNa.method; // handle repeat press

            if (repeat || _this.keyState[keyName].count == 0) {
              // callback to get live parameters if function
              var parameters = _this.boundKeys[keyName].parameters;

              if (typeof parameters === "function") {
                parameters = parameters();
              } // todo movement is probably redundant


              var inputOptions = Object.assign({
                movement: true
              }, parameters || {});

              if (method) {
                method(_this.boundKeys[keyName]);
              } else {
                _this.clientEngine.sendInput(_this.boundKeys[keyName].actionName, inputOptions);
              }

              _this.keyState[keyName].count++;
            }
          }
        }
      });
    }

    _createClass(KeyboardControls, [{
      key: "setupListeners",
      value: function setupListeners() {
        var _this2 = this;

        document.addEventListener('keydown', function (e) {
          _this2.onKeyChange(e, true);
        });
        document.addEventListener('keyup', function (e) {
          _this2.onKeyChange(e, false);
        });
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

    }, {
      key: "bindKey",
      value: function bindKey(keys, actionName, options, parameters) {
        var _this3 = this;

        if (!Array.isArray(keys)) keys = [keys];
        var keyOptions = Object.assign({
          repeat: false
        }, options);
        keys.forEach(function (keyName) {
          _this3.boundKeys[keyName] = {
            actionName: actionName,
            options: keyOptions,
            parameters: parameters
          };
        });
      }
    }, {
      key: "applyKeyDown",
      value: function applyKeyDown(name) {
        var code = inverseKeyCodeTable[name];
        var e = new Event('keydown');
        e.keyCode = code;
        this.onKeyChange(e, true);
      }
    }, {
      key: "applyKeyUp",
      value: function applyKeyUp(name) {
        var code = inverseKeyCodeTable[name];
        var e = new Event('keyup');
        e.keyCode = code;
        this.onKeyChange(e, false);
      }
    }, {
      key: "applyKeyPress",
      value: function applyKeyPress(name) {
        var _this4 = this;

        this.applyKeyDown(name);
        setTimeout(function () {
          _this4.applyKeyUp(name);
        }, 200);
      } // todo implement unbindKey

    }, {
      key: "onKeyChange",
      value: function onKeyChange(e, isDown) {
        e = e || window.event;
        var keyName = keyCodeTable[e.keyCode];
        var isStopped = this.stop;
        if (isDown) this.clientEngine.keyChange.next(keyName);
        if (isStopped) return;

        if (keyName && this.boundKeys[keyName]) {
          if (this.keyState[keyName] == null) {
            this.keyState[keyName] = {
              count: 0
            };
          }

          this.keyState[keyName].isDown = isDown; // key up, reset press count

          if (!isDown) this.keyState[keyName].count = 0; // keep reference to the last key pressed to avoid duplicates

          this.lastKeyPressed = isDown ? e.keyCode : null; // this.renderer.onKeyChange({ keyName, isDown });

          e.preventDefault();
        }
      }
    }]);

    return KeyboardControls;
  }();

  var singleton = null;
  var TIME_RESET_THRESHOLD = 100;
  /**
   * The Renderer is the component which must *draw* the game on the client.
   * It will be instantiated once on each client, and must implement the draw
   * method.  The draw method will be invoked on every iteration of the browser's
   * render loop.
   */

  var Renderer =
  /*#__PURE__*/
  function () {
    _createClass(Renderer, null, [{
      key: "getInstance",
      value: function getInstance() {
        return singleton;
      }
      /**
      * Constructor of the Renderer singleton.
      * @param {GameEngine} gameEngine - Reference to the GameEngine instance.
      * @param {ClientEngine} clientEngine - Reference to the ClientEngine instance.
      */

    }]);

    function Renderer(gameEngine, clientEngine) {
      var _this = this;

      _classCallCheck(this, Renderer);

      this.gameEngine = gameEngine;
      this.clientEngine = clientEngine;
      this.gameEngine.on('client__stepReset', function () {
        _this.doReset = true;
      });
      gameEngine.on('objectAdded', this.addObject.bind(this));
      gameEngine.on('objectDestroyed', this.removeObject.bind(this)); // the singleton renderer has been created

      singleton = this;
    }
    /**
     * Initialize the renderer.
     * @return {Promise} Resolves when renderer is ready.
    */


    _createClass(Renderer, [{
      key: "init",
      value: function init() {
        if (typeof window === 'undefined' || !document) {
          console.log('renderer invoked on server side.');
        }

        this.gameEngine.emit('client__rendererReady');
        return Promise.resolve(); // eslint-disable-line new-cap
      }
    }, {
      key: "reportSlowFrameRate",
      value: function reportSlowFrameRate() {
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

    }, {
      key: "draw",
      value: function draw(t, dt) {
        this.gameEngine.emit('client__draw');
        if (this.clientEngine.options.scheduler === 'render-schedule') this.runClientStep(t);
      }
      /**
       * The main draw function.  This method is called at high frequency,
       * at the rate of the render loop.  Typically this is 60Hz, in WebVR 90Hz.
       *
       * @param {Number} t - current time
       * @param {Number} dt - time elapsed since last draw
       */

    }, {
      key: "runClientStep",
      value: function runClientStep(t) {
        var p = this.clientEngine.options.stepPeriod;
        var dt = 0; // reset step time if we passed a threshold

        if (this.doReset || t > this.clientEngine.lastStepTime + TIME_RESET_THRESHOLD) {
          this.doReset = false;
          this.clientEngine.lastStepTime = t - p / 2;
          this.clientEngine.correction = p / 2;
        } // catch-up missed steps


        while (t > this.clientEngine.lastStepTime + p) {
          this.clientEngine.step(this.clientEngine.lastStepTime + p, p + this.clientEngine.correction);
          this.clientEngine.lastStepTime += p;
          this.clientEngine.correction = 0;
        } // if not ready for a real step yet, return
        // this might happen after catch up above


        if (t < this.clientEngine.lastStepTime) {
          dt = t - this.clientEngine.lastStepTime + this.clientEngine.correction;
          if (dt < 0) dt = 0;
          this.clientEngine.correction = this.clientEngine.lastStepTime - t;
          this.clientEngine.step(t, dt, true);
          return;
        } // render-controlled step


        dt = t - this.clientEngine.lastStepTime + this.clientEngine.correction;
        this.clientEngine.lastStepTime += p;
        this.clientEngine.correction = this.clientEngine.lastStepTime - t;
        this.clientEngine.step(t, dt);
      }
      /**
       * Handle the addition of a new object to the world.
       * @param {Object} obj - The object to be added.
       */

    }, {
      key: "addObject",
      value: function addObject(obj) {}
      /**
       * Handle the removal of an old object from the world.
       * @param {Object} obj - The object to be removed.
       */

    }, {
      key: "removeObject",
      value: function removeObject(obj) {}
      /**
       * Called when clientEngine has stopped, time to clean up
       */

    }, {
      key: "stop",
      value: function stop() {}
    }]);

    return Renderer;
  }();

  /* global THREE */
  var FRAME_HISTORY_SIZE = 20;
  var MAX_SLOW_FRAMES = 10;
  var networkedPhysics = {
    schema: {
      traceLevel: {
        default: 4
      }
    },
    init: function init() {
      // TODO: Sometimes an object is "simple".  For example it uses
      //       existing AFrame assets (an OBJ file and a material)
      //       in this case, we can auto-generate the DOM element,
      //       setting the quaternion, position, material, game-object-id
      //       and obj-model.  Same goes for objects which use primitive
      //       geometric objects.  Remember to also remove them.
      this.CAMERA_OFFSET_VEC = new THREE.Vector3(0, 5, -10);
      this.frameRateHistory = [];

      for (var i = 0; i < FRAME_HISTORY_SIZE; i++) {
        this.frameRateHistory.push(false);
      }

      this.frameRateTest = 1000 / 60 * 1.2; // capture the chase camera if available

      var chaseCameras = document.getElementsByClassName('chaseCamera');
      if (chaseCameras) this.cameraEl = chaseCameras[0];
    },
    tick: function tick(t, dt) {
      var _this = this;

      if (!this.gameEngine) return;
      this.renderer.tick(t, dt);
      var frh = this.frameRateHistory;
      frh.push(dt > this.frameRateTest);
      frh.shift();
      var slowFrames = frh.filter(function (x) {
        return x;
      });

      if (slowFrames.length > MAX_SLOW_FRAMES) {
        this.frameRateHistory = frh.map(function (x) {
          return false;
        });
        this.renderer.reportSlowFrameRate();
      } // for each object in the world, update the a-frame element


      this.gameEngine.world.forEachObject(function (id, o) {
        var el = o.renderEl;

        if (el) {
          var q = o.quaternion;
          var p = o.position;
          el.setAttribute('position', "".concat(p.x, " ").concat(p.y, " ").concat(p.z));
          el.object3D.quaternion.set(q.x, q.y, q.z, q.w); // if a chase camera is configured, update it

          if (_this.cameraEl && _this.gameEngine.playerId === o.playerId) {
            var camera = _this.cameraEl.object3D.children[0];

            var relativeCameraOffset = _this.CAMERA_OFFSET_VEC.clone();

            var cameraOffset = relativeCameraOffset.applyMatrix4(o.renderEl.object3D.matrixWorld);
            camera.position.copy(cameraOffset);
            camera.lookAt(o.renderEl.object3D.position);
          }
        }
      });
    },
    // NOTE: webpack generated incorrect code if you use arrow notation below
    //       it sets "this" to "undefined"
    setGlobals: function setGlobals(gameEngine, renderer) {
      this.gameEngine = gameEngine;
      this.renderer = renderer;
    }
  };

  /**
   * The A-Frame Renderer
   */

  var AFrameRenderer =
  /*#__PURE__*/
  function (_Renderer) {
    _inherits(AFrameRenderer, _Renderer);

    /**
    * Constructor of the Renderer singleton.
    * @param {GameEngine} gameEngine - Reference to the GameEngine instance.
    * @param {ClientEngine} clientEngine - Reference to the ClientEngine instance.
    */
    function AFrameRenderer(gameEngine, clientEngine) {
      var _this;

      _classCallCheck(this, AFrameRenderer);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(AFrameRenderer).call(this, gameEngine, clientEngine)); // set up the networkedPhysics as an A-Frame system

      networkedPhysics.setGlobals(gameEngine, _assertThisInitialized(_this));
      AFRAME.registerSystem('networked-physics', networkedPhysics);
      return _this;
    }

    _createClass(AFrameRenderer, [{
      key: "reportSlowFrameRate",
      value: function reportSlowFrameRate() {
        this.gameEngine.emit('client__slowFrameRate');
      }
      /**
       * Initialize the renderer.
       * @return {Promise} Resolves when renderer is ready.
      */

    }, {
      key: "init",
      value: function init() {
        var p = _get(_getPrototypeOf(AFrameRenderer.prototype), "init", this).call(this);

        var sceneElArray = document.getElementsByTagName('a-scene');

        if (sceneElArray.length !== 1) {
          throw new Error('A-Frame scene element not found');
        }

        this.scene = sceneElArray[0];
        this.gameEngine.on('objectRemoved', function (o) {
          o.renderObj.remove();
        });
        return p; // eslint-disable-line new-cap
      }
      /**
       * In AFrame, we set the draw method (which is called at requestAnimationFrame)
       * to a NO-OP. See tick() instead
       */

    }, {
      key: "draw",
      value: function draw() {}
    }, {
      key: "tick",
      value: function tick(t, dt) {
        _get(_getPrototypeOf(AFrameRenderer.prototype), "draw", this).call(this, t, dt);
      }
    }]);

    return AFrameRenderer;
  }(Renderer);

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

  var ServerEngine =
  /*#__PURE__*/
  function () {
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
    function ServerEngine(io, gameEngine, world, options) {
      _classCallCheck(this, ServerEngine);

      this.World = world;
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
      this.connectedPlayers = {};
      this.playerInputQueues = {};
      this.objMemory = {};
      io.on('connection', this.onPlayerConnected.bind(this));
      this.gameEngine.on('objectAdded', this.onObjectAdded.bind(this));
      this.gameEngine.on('objectDestroyed', this.onObjectDestroyed.bind(this));
      return this;
    } // start the ServerEngine


    _createClass(ServerEngine, [{
      key: "start",
      value: function start() {
        this.gameEngine.start();
        this.networkTransmitter = new NetworkTransmitter(this.serializer, this.gameEngine.world);
        this.gameEngine.emit('server__init');
        var schedulerConfig = {
          tick: this.step.bind(this),
          period: 1000 / this.options.stepRate,
          delay: 4
        };
        this.scheduler = new Scheduler(schedulerConfig).start();
      } // every server step starts here

    }, {
      key: "step",
      value: function step() {
        var _this = this;

        // first update the trace state
        this.gameEngine.trace.setStep(this.gameEngine.world.stepCount + 1);
        this.gameEngine.emit('server__preStep', this.gameEngine.world.stepCount + 1);
        this.serverTime = new Date().getTime();
        this.World.send(); // for each player, replay all the inputs in the oldest step

        var _arr = Object.keys(this.playerInputQueues);

        var _loop = function _loop() {
          var playerId = _arr[_i];
          var inputQueue = _this.playerInputQueues[playerId];
          var queueSteps = Object.keys(inputQueue);
          var minStep = Math.min.apply(null, queueSteps); // check that there are inputs for this step,
          // and that we have reached/passed this step

          if (queueSteps.length > 0 && minStep <= _this.gameEngine.world.stepCount) {
            inputQueue[minStep].forEach(function (input) {
              _this.gameEngine.emit('server__processInput', {
                input: input,
                playerId: playerId
              });

              _this.gameEngine.emit('processInput', {
                input: input,
                playerId: playerId
              });

              _this.gameEngine.processInput(input, playerId, true);
            });
            delete inputQueue[minStep];
          }
        };

        for (var _i = 0; _i < _arr.length; _i++) {
          _loop();
        } // run the game engine step


        this.gameEngine.step(false, this.serverTime / 1000); // synchronize the state to all clients
        //Object.keys(this.rooms).map(this.syncStateToClients.bind(this));

        this.gameEngine.world.groups.forEach(function (group) {
          _this.syncStateToClients(group);
        }); // remove memory-objects which no longer exist

        var _arr2 = Object.keys(this.objMemory);

        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
          var objId = _arr2[_i2];

          if (!(objId in this.gameEngine.world.objects)) {
            delete this.objMemory[objId];
          }
        } // step is done on the server side


        this.gameEngine.emit('server__postStep', this.gameEngine.world.stepCount);

        if (this.gameEngine.trace.length) {
          var traceData = this.gameEngine.trace.rotate();
          var traceString = '';
          traceData.forEach(function (t) {
            traceString += "[".concat(t.time.toISOString(), "]").concat(t.step, ">").concat(t.data, "\n");
          });
          fs.appendFile("".concat(this.options.tracesPath, "server.trace"), traceString, function (err) {
            if (err) throw err;
          });
        }
      }
    }, {
      key: "syncStateToClients",
      value: function syncStateToClients(room) {
        var world = this.gameEngine.world; // update clients only at the specified step interval, as defined in options
        // or if this room needs to sync
        //const room = this.rooms[roomName];

        var roomName = room.groupName;

        if (room.requestImmediateSync || this.gameEngine.world.stepCount % this.options.updateRate === 0) {
          //const roomPlayers = Object.keys(this.connectedPlayers)
          //   .filter(p => this.connectedPlayers[p].roomName === roomName);
          // if at least one player is new, we should send a full payload
          var roomPlayers = world.getObjectsOfGroup(roomName);
          var diffUpdate = true;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = roomPlayers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _player = _step.value;
              if (_player._roomName != roomName) continue;

              if (_player.state === 'new') {
                _player.state = 'synced';
                diffUpdate = false;
              }
            } // also, one in N syncs is a full update, or a special request

          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          if (room.syncCounter++ % this.options.fullSyncRate === 0 || room.requestFullSync) diffUpdate = false;
          this.networkTransmitter.addNetworkedEvent(roomName, 'syncHeader', {
            stepCount: world.stepCount,
            fullUpdate: Number(!diffUpdate)
          });
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = roomPlayers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _player2 = _step2.value;
              if (_player2._roomName != roomName) continue;
              if (_player2.tick) _player2.tick();
              this.serializeUpdate(roomName, _player2, {
                diffUpdate: diffUpdate
              });
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          var payload = this.networkTransmitter.serializePayload(roomName);

          if (payload) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = roomPlayers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var player = _step3.value;

                if (player._socket && player._roomName == roomName) {
                  player._socket.emit('worldUpdate', payload);
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }

          this.networkTransmitter.clearPayload(roomName);
          room.requestImmediateSync = false;
          room.requestFullSync = false;
        }
      }
    }, {
      key: "serializeObject",
      value: function serializeObject(player, schemeRules) {
        var deepSerialize = function deepSerialize(val, schemeParams, schemeQuery) {
          if (val == undefined) return;
          var groups = {
            update: {},
            all: {}
          };
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = schemeParams[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var prop = _step4.value;
              var value = val[prop];
              var originVal = val.getPrev(prop);

              if (value == undefined || typeof value == 'number' || typeof value == 'string') {
                if (originVal != val[prop]) {
                  groups['update'][prop] = value;
                }

                groups['all'][prop] = value;
                val.setPrev(prop, value);
              } else if (prop.broadcast) {
                var newVal = deepSerialize(val[prop], prop.broadcast, schemeQuery);

                for (var keyGroup in newVal.groups) {
                  groups[keyGroup][prop] = newVal.groups[keyGroup];
                }

                val[prop] = newVal.origin;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          return {
            groups: groups,
            origin: val
          };
        };

        var update = {};
        var all = {};
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = schemeRules[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var rule = _step5.value;

            var _deepSerialize = deepSerialize(player, rule.params, rule.query),
                groups = _deepSerialize.groups;

            update = _objectSpread({}, update, groups.update);
            all = _objectSpread({}, all, groups.all);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        return {
          update: update,
          all: all
        };
      } // create a serialized package of the game world
      // TODO: this process could be made much much faster if the buffer creation and
      //       size calculation are done in a single phase, along with string pruning.

    }, {
      key: "serializeUpdate",
      value: function serializeUpdate(roomName, object, options) {
        var world = this.gameEngine.world;
        var diffUpdate = Boolean(options && options.diffUpdate);
        var objId = object.id;
        var obj = world.objects[objId];
        var prevObject = this.objMemory[objId]; // if the object (in serialized form) hasn't changed, move on

        if (diffUpdate) {
          var s = obj.serialize(this.serializer);
          if (prevObject && Utils.arrayBuffersEqual(s.dataBuffer, prevObject)) return;else this.objMemory[objId] = s.dataBuffer; // prune strings which haven't changed

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

    }, {
      key: "createRoom",
      value: function createRoom(roomName, options) {
        this.gameEngine.world.addGroup(roomName, options);
      }
      /**
       * Assign an object to a room
       *
       * @param {Object} obj - the object to move
       * @param {String} roomName - the target room
       */

    }, {
      key: "assignObjectToRoom",
      value: function assignObjectToRoom(obj, roomName) {
        obj._roomName = roomName;
        obj.$state = 'newInRoom';
        this.gameEngine.world.addObjectInGroup(obj, roomName);
      }
      /**
       * Assign a player to a room
       *
       * @param {Number} playerId - the playerId
       * @param {String} roomName - the target room
       */

    }, {
      key: "assignPlayerToRoom",
      value: function assignPlayerToRoom(playerId, roomName) {}
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
      // handle the object creation

    }, {
      key: "onObjectAdded",
      value: function onObjectAdded(obj) {
        // obj._roomName = obj._roomName || this.DEFAULT_ROOM_NAME;

        /* this.networkTransmitter.addNetworkedEvent('objectCreate', {
             stepCount: this.gameEngine.world.stepCount,
             objectInstance: obj
         });*/
        if (this.options.updateOnObjectCreation) ;
      } // handle the object creation

    }, {
      key: "onObjectDestroyed",
      value: function onObjectDestroyed(_ref) {
        var object = _ref.object,
            groups = _ref.groups;
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = groups[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var room = _step6.value;
            this.networkTransmitter.addNetworkedEvent(room, 'objectDestroy', {
              stepCount: this.gameEngine.world.stepCount,
              objectInstance: object
            });
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
    }, {
      key: "getPlayerId",
      value: function getPlayerId(socket) {} // handle new player connection

    }, {
      key: "onPlayerConnected",
      value: function onPlayerConnected(socket) {
        var that = this; // save player

        /*this.connectedPlayers[socket.id] = {
            socket: socket,
            state: 'new',
            roomName: this.DEFAULT_ROOM_NAME
        };*/

        var playerId = this.getPlayerId(socket);

        if (!playerId) {
          playerId = Utils.generateUID();
        }

        socket.playerId = playerId;
        socket.lastHandledInput = null;
        socket.joinTime = new Date().getTime();
        this.resetIdleTimeout(socket);
        var playerEvent = {
          id: socket.id,
          playerId: playerId,
          joinTime: socket.joinTime,
          disconnectTime: 0
        };
        this.gameEngine.emit('server__playerJoined', playerEvent);
        this.gameEngine.emit('playerJoined', playerEvent);
        socket.emit('playerJoined', playerEvent);
        socket.on('disconnect', function () {
          playerEvent.disconnectTime = new Date().getTime();
          that.onPlayerDisconnected(socket.id, playerId);
          that.gameEngine.emit('server__playerDisconnected', playerEvent);
          that.gameEngine.emit('playerDisconnected', playerEvent);
        }); // todo rename, use number instead of name

        socket.on('move', function (data) {
          that.onReceivedInput(data, socket);
        });
        socket.on('_ping', function () {
          socket.emit('_pong');
        }); // we got a packet of trace data, write it out to a side-file

        socket.on('trace', function (traceData) {
          traceData = JSON.parse(traceData);
          var traceString = '';
          traceData.forEach(function (t) {
            traceString += "[".concat(t.time, "]").concat(t.step, ">").concat(t.data, "\n");
          });
          fs.appendFile("".concat(that.options.tracesPath, "client.").concat(playerId, ".trace"), traceString, function (err) {
            if (err) throw err;
          });
        });
        this.networkMonitor.registerPlayerOnServer(socket);
        return playerId;
      } // handle player timeout

    }, {
      key: "onPlayerTimeout",
      value: function onPlayerTimeout(socket) {
        console.log("Client timed out after ".concat(this.options.timeoutInterval, " seconds"), socket.id);
        socket.disconnect();
      } // handle player dis-connection

    }, {
      key: "onPlayerDisconnected",
      value: function onPlayerDisconnected(socketId, playerId) {
        //delete this.connectedPlayers[socketId];
        this.World.disconnectUser(playerId); //console.log('Client disconnected');
      } // resets the idle timeout for a given player

    }, {
      key: "resetIdleTimeout",
      value: function resetIdleTimeout(socket) {
        var _this2 = this;

        if (socket.idleTimeout) clearTimeout(socket.idleTimeout);

        if (this.options.timeoutInterval > 0) {
          socket.idleTimeout = setTimeout(function () {
            _this2.onPlayerTimeout(socket);
          }, this.options.timeoutInterval * 1000);
        }
      } // add an input to the input-queue for the specific player
      // each queue is key'd by step, because there may be multiple inputs
      // per step

    }, {
      key: "queueInputForPlayer",
      value: function queueInputForPlayer(data, playerId) {
        // create an input queue for this player, if one doesn't already exist
        if (!this.playerInputQueues.hasOwnProperty(playerId)) this.playerInputQueues[playerId] = {};
        var queue = this.playerInputQueues[playerId]; // create an array of inputs for this step, if one doesn't already exist

        if (!queue[data.step]) queue[data.step] = []; // add the input to the player's queue

        queue[data.step].push(data);
      } // an input has been received from a client, queue it for next step

    }, {
      key: "onReceivedInput",
      value: function onReceivedInput(data, socket) {
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

    }, {
      key: "gameStatus",
      value: function gameStatus() {
        var gameStatus = {
          numPlayers: Object.keys(this.connectedPlayers).length,
          upTime: 0,
          cpuLoad: 0,
          memoryLoad: 0,
          players: {}
        };

        var _arr3 = Object.keys(this.connectedPlayers);

        for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
          var p = _arr3[_i3];
          gameStatus.players[p] = {
            frameRate: 0
          };
        }

        return JSON.stringify(gameStatus);
      }
    }]);

    return ServerEngine;
  }();

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
//# sourceMappingURL=lance-gg.js.map
