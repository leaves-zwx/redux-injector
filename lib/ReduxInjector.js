'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.combineReducersRecurse = combineReducersRecurse;
exports.createInjectStore = createInjectStore;
exports.injectReducer = injectReducer;

var _redux = require('redux');

var _lodash = require('lodash');

var store = {};
var combine = _redux.combineReducers;
var createStore = _redux.createStore;

function combineReducersRecurse(reducers) {
  // If this is a leaf or already combined.
  if (typeof reducers === 'function') {
    return reducers;
  }

  // If this is an object of functions, combine reducers.
  if ((typeof reducers === 'undefined' ? 'undefined' : _typeof(reducers)) === 'object') {
    var combinedReducers = {};
    for (var key in reducers) {
      combinedReducers[key] = combineReducersRecurse(reducers[key]);
    }
    return combine(combinedReducers);
  }

  // If we get here we have an invalid item in the reducer path.
  throw new Error({
    message: 'Invalid item in reducer tree',
    item: reducers
  });
}

function createInjectStore(initialReducers) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  // If last item is an object, it is overrides.
  if (_typeof(args[args.length - 1]) === 'object') {
    var overrides = args.pop();
    // Allow overriding the combineReducers function such as with redux-immutable.
    if (overrides.hasOwnProperty('combineReducers') && typeof overrides.combineReducers === 'function') {
      combine = overrides.combineReducers;
    }
    // Allow overriding the combineReducers function such as with redux-injector
    if (overrides.hasOwnProperty('createStore') && typeof overrides.createStore === 'function') {
      createStore = overrides.createStore;
    }
  }

  store = createStore.apply(undefined, [combineReducersRecurse(initialReducers)].concat(args));

  store.injectedReducers = initialReducers;

  return store;
}

function injectReducer(key, reducer) {
  var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  // If already set, do nothing.
  if ((0, _lodash.has)(store.injectedReducers, key) || force) return;

  (0, _lodash.set)(store.injectedReducers, key, reducer);
  store.replaceReducer(combineReducersRecurse(store.injectedReducers));
}
