// <reference types="react-scripts" />
// <reference types="webpack-env" />
interface Window {
  web3?: Record<string, unknown>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum SupportedChainId {
  MAINNET = 1,
  POLYGON = 137,
}

declare module '*.png'
declare module '*.svg'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.webp'
