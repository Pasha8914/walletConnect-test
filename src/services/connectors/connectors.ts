import { AbstractWalletProvider } from 'services'
import { SupportedChainId } from 'constants/chains'
import { Providers, SUPPORTED_WALLETS } from 'constants/wallet'

export async function getWalletProvider(key: Providers, chainId: SupportedChainId, rpcUrl: string) {
  const wallet = SUPPORTED_WALLETS[key]

  const provider = await wallet.connector(chainId, rpcUrl)
  return new AbstractWalletProvider({ provider, providerName: key })
}
