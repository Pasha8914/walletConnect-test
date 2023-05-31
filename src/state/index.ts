import { configureStore } from '@reduxjs/toolkit'

import { persistReducer, persistStore } from 'redux-persist'

import { rootReducer } from './reducers'
import { persistConfig } from './persistConfig'

type State = ReturnType<typeof rootReducer>

const persistedReducer = persistReducer<State>(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return [...getDefaultMiddleware({ serializableCheck: false })]
  },
})

if (module.hot) {
  module.hot.accept('./reducers', () => {
    // This fetch the new state of the above reducers.
    // eslint-disable-next-line
    const reducers = require('./reducers').rootReducer
    store.replaceReducer(persistReducer<State>(persistConfig, reducers))
  })
}

const persistor = persistStore(store)

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { persistor, store }
