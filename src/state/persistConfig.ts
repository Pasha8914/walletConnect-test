import storage from 'redux-persist/lib/storage'
import { createTransform } from 'redux-persist'

import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'

import { omit } from 'utils'
import { rootReducer } from './reducers'

type State = ReturnType<typeof rootReducer>

const BLACKLISTED_KEYS: string[] = []
const PERSISTED_KEYS: string[] = ['user']

const PERSISTED_IGNORED_KEYS: Record<string, string[]> = {}

const blacklistTransformer = createTransform(null, (state: State, stateKey: string | number) => {
  if (PERSISTED_IGNORED_KEYS[stateKey]) {
    return omit(state, PERSISTED_IGNORED_KEYS[stateKey])
  }
  return state
})

const persistConfig = {
  key: 'Leverage',
  storage,
  debug: true,
  version: 0.1,
  whitelist: PERSISTED_KEYS,
  blacklist: BLACKLISTED_KEYS,
  transforms: [blacklistTransformer],
  stateReconciler: autoMergeLevel2,
}

export { persistConfig }
