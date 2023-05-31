import { useCallback, useEffect, useMemo, useState } from 'react'

import { useChainId, useProviderName } from 'state/user/hooks'

import { RPC_LIST } from 'constants/chains'
import { Providers } from 'constants/wallet'
import { AbstractWalletProvider, getWalletProvider } from 'services'

export function useWalletProvider() {
  const [provider, setProvider] = useState<AbstractWalletProvider | undefined>()

  const chainId = useChainId()
  const providerName = useProviderName()

  const rpcUrl = useMemo(() => RPC_LIST[chainId], [chainId])
  const fetchProvider = useCallback(async () => {
    if (providerName) {
      const _provider = await getWalletProvider(providerName, chainId, rpcUrl)
      setProvider(_provider)
    }
  }, [providerName, rpcUrl])

  useEffect(() => {
    fetchProvider()
  }, [providerName, rpcUrl])

  return provider
}

export function useSetupProvider() {
  return useCallback(
    async (providerName: Providers, _chainId: SupportedChainId, rpcUrl: string) => {
      try {
        const provider = await getWalletProvider(providerName, _chainId, rpcUrl)

        return await provider.setupProvider()
      } catch (err) {
        throw new Error(err.message)
      }
    },
    [getWalletProvider],
  )
}
