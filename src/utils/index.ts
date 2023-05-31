import { debounce, isEmpty, isEqual, omit } from 'lodash'

export * from './crypto'

export function promisify<T>(promise: (params: (error?: any) => void) => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    promise(reject).then(resolve).catch(reject)
  })
}
export { debounce, isEmpty, isEqual, omit }
