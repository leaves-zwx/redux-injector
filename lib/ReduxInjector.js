'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.entries(reducers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            value = _step$value[1];

        combinedReducers[key] = combineReducersRecurse(value);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
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
