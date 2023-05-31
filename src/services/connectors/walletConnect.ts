import Provider from '@walletconnect/ethereum-provider'
import { RequestArguments } from '@walletconnect/ethereum-provider/dist/types/types'

import { SupportedChainId } from 'constants/chains'

import { AbstractProvider } from 'services/provider/@types'

console.log('process.env', process.env)
const projectId = process.env.REACT_APP_PROJECT_ID
const chainIds = [SupportedChainId.MAINNET, SupportedChainId.POLYGON]

class WalletConnector {
  public provider: Provider | undefined
  public chainId: SupportedChainId = SupportedChainId.MAINNET

  public async setupProvider(chainId: SupportedChainId) {
    try {
      console.log('projectId', projectId)
      if (!projectId) {
        throw new Error('projectId is required')
      }
      this.provider = await Provider.init({
        projectId,
        showQrModal: true,
        chains: [chainId, ...chainIds.filter((chain) => chain !== chainId)],
      })

      // @ts-ignore
      this.provider.injectedRequest = this.injectedRequest
      this.provider.request = this.request

      this.provider.on('chainChanged', (chainId: string) => {
        if (!this.provider) {
          return
        }

        const signerChainId = this.provider.signer.namespaces.eip155.defaultChain
        if (Number(chainId) !== Number(this.provider.chainId)) {
          console.log('chainChanged, new chainId is - ', chainId)
          this.provider.signer.setDefaultChain(`eip155:${chainId}`)
        } else if (Number(signerChainId) !== Number(chainId)) {
          console.log([this.provider.signer.namespaces.eip155.defaultChain, chainId])
          this.provider.signer.setDefaultChain(`eip155:${chainId}`)
        }
      })
      return this.provider
    } catch (err) {
      throw new Error(`WalletConnect: ${err.message}`)
    }
  }

  private injectedRequest = async () => {
    if (!this.provider) {
      throw new Error('Please init provider')
    }
    try {
      await this.provider.connect({
        chains: [this.provider.chainId, ...chainIds.filter((chain) => chain !== this.provider?.chainId)],
      })
      return this.provider.accounts
    } catch (err) {
      this.provider.disconnect()
      throw err
    }
  }

  public request = async <T = unknown>(args: RequestArguments): Promise<T> => {
    try {
      if (!this.provider) {
        throw new Error('Please init provider')
      }

      console.log('request', { args, chainId: this.provider.chainId, provider: this.provider })
      const result = await this.provider.signer.request(args, `eip155:${this.provider.chainId}`)
      console.log('result', result)
      return result as T
    } catch (err) {
      throw err
    }
  }
}

const connector = new WalletConnector()

async function getProvider(chainId: SupportedChainId): Promise<AbstractProvider> {
  if (!connector.provider?.session) {
    await connector.setupProvider(chainId)
  }
  if (connector.provider?.chainId !== chainId) {
    console.log('PROVIDER CHAIN_ID', { provider: connector.provider?.chainId, argChainId: chainId })
  }
  return connector.provider as unknown as AbstractProvider
}

export default getProvider
