import { AbstractProvider } from 'services/provider/@types'
import { SupportedChainId } from './chains'
import { walletConnect } from 'services/connectors'

interface WalletInfo {
  connector: (chainId: SupportedChainId, rpcUrl: string) => AbstractProvider | Promise<AbstractProvider>
  name: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export enum Providers {
  METAMASK = 'METAMASK',
  WALLET_CONNECT = 'WALLET_CONNECT',
}

export const SUPPORTED_WALLETS: Record<Providers, WalletInfo> = {
  [Providers.METAMASK]: {
    connector: () => window.ethereum as AbstractProvider,
    name: 'Injected',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  [Providers.WALLET_CONNECT]: {
    connector: (chainId: SupportedChainId) => walletConnect(chainId),
    name: 'WalletConnect',
    description: 'Wallet connect.',
    href: null,
    color: '#010101',
    primary: true,
  },
}
