import { createStore as createReduxStore, combineReducers } from 'redux';
import { set, has } from 'lodash';

let store = {};
let combine = combineReducers;
let createStore = createReduxStore;

export function combineReducersRecurse(reducers) {
  // If this is a leaf or already combined.
  if (typeof reducers === 'function') {
    return reducers;
  }

  // If this is an object of functions, combine reducers.
  if (typeof reducers === 'object') {
    let combinedReducers = {};
    for (let [key, value] of Object.entries(reducers)) {
      combinedReducers[key] = combineReducersRecurse(value);
    }
    return combine(combinedReducers);
  }

  // If we get here we have an invalid item in the reducer path.
  throw new Error({
    message: 'Invalid item in reducer tree',
    item: reducers
  });
}

export function createInjectStore(initialReducers, ...args) {
  // If last item is an object, it is overrides.
  if (typeof args[args.length - 1] === 'object') {
    const overrides = args.pop();
    // Allow overriding the combineReducers function such as with redux-immutable.
    if (overrides.hasOwnProperty('combineReducers') && typeof overrides.combineReducers === 'function') {
      combine = overrides.combineReducers;
    }
    // Allow overriding the combineReducers function such as with redux-injector
    if (overrides.hasOwnProperty('createStore') && typeof overrides.createStore === 'function') {
      createStore = overrides.createStore;
    }
  }

  store = createStore(
    combineReducersRecurse(initialReducers),
    ...args
  );

  store.injectedReducers = initialReducers;

  return store;
}

export function injectReducer(key, reducer, force = false) {
  // If already set, do nothing.
  if (has(store.injectedReducers, key) || force) return;

  set(store.injectedReducers, key, reducer);
  store.replaceReducer(combineReducersRecurse(store.injectedReducers));
}
