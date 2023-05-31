import { useCallback } from 'react'

import { ADD_NETWORK_LIST } from 'constants/chains'

import { AbstractWalletProvider } from 'services'

export function useChangeNetwork() {
  return useCallback(async (chainId: SupportedChainId, provider: AbstractWalletProvider) => {
    try {
      const params = [{ chainId: ADD_NETWORK_LIST[chainId].chainId }]

      await provider.sendRequest({ method: 'wallet_switchEthereumChain', params })
    } catch (e) {
      if (e.code === 4902 || e.message.includes('wallet_addEthereumChain')) {
        await provider.sendRequest({
          method: 'wallet_addEthereumChain',
          params: [ADD_NETWORK_LIST[chainId]],
        })
      }
    }
  }, [])
}
