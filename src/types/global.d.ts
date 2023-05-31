import { ExternalMetamaskProvider } from 'services/provider/@types'

declare global {
  interface Window {
    ethereum: ExternalMetamaskProvider
  }
}
