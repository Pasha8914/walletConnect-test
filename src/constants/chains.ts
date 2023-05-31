export enum SupportedChainId {
  MAINNET = 1,
  POLYGON = 137,
}

interface L1ChainInfo {
  readonly docs: string
  readonly explorer: string
  readonly infoLink: string
  readonly label: string
  readonly symbol: string
  readonly name: string
  readonly shortName: string
  readonly network: string
  readonly blockDuration: number
}

type ChainInfo = { readonly [SupportedChainId: number]: L1ChainInfo }

// @ts-ignore
export const CHAIN_INFO: ChainInfo = {
  [SupportedChainId.MAINNET]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Mainnet',
    symbol: 'ETH',
    name: 'Ethereum',
    shortName: 'eth',
    network: 'Mainnet',
    blockDuration: 12000,
  },
  [SupportedChainId.POLYGON]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Matic',
    symbol: 'MATIC',
    name: 'Polygon',
    shortName: 'MATIC',
    network: 'Polygon',
    blockDuration: 12000,
  },
}

export const ADD_NETWORK_LIST: { [chainId in SupportedChainId]?: any } = {
  [SupportedChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrls: ['https://ethereum-mainnet-rpc.allthatnode.com/'],
    blockExplorerUrls: [CHAIN_INFO[SupportedChainId.MAINNET].explorer],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [SupportedChainId.POLYGON]: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    rpcUrls: ['https://polygon.llamarpc.com'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: [CHAIN_INFO[SupportedChainId.POLYGON].explorer],
  },
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const RPC_LIST: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://eth.llamarpc.com',
  [SupportedChainId.POLYGON]: 'https://polygon.llamarpc.com',
}
