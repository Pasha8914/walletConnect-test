import { useCallback, useMemo } from 'react'

import { useChangeNetwork, useSetupProvider, useWalletProvider } from 'hooks/wallet'

import { AppState } from 'state'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { Providers } from 'constants/wallet'
import { RPC_LIST, SupportedChainId } from 'constants/chains'

import { toChecksumAddress } from 'utils'
import { getWalletProvider } from 'services'

import { setConnecting, updateAddress, updateChainId, userClearState, updateProviderName } from './actions'

// action creator
export function useInitProvider() {
  const _chainId = useChainId()

  const setChainId = useSetChainId()
  const setAddress = useChangeAddress()
  const setConnection = useSetConnection()

  const onSetup = useSetupProvider()
  const changeNetwork = useChangeNetwork()
  const onUpdateProvider = useUpdateProviderName()

  const onClearState = useClearState()

  const rpcUrl = useMemo(() => RPC_LIST[_chainId], [_chainId])

  return useCallback(
    async (providerName: Providers) => {
      try {
        const { address, chainId } = await onSetup(providerName, _chainId, rpcUrl)

        onUpdateProvider(providerName)
        setAddress(address)

        console.info('useInitProvider chainId', chainId)
        console.info('useInitProvider _chainId', _chainId)

        if (chainId !== _chainId) {
          const _provider = await getWalletProvider(providerName, _chainId, RPC_LIST[_chainId])
          await changeNetwork(_chainId, _provider)
        }
        setConnection(true)

        return { address, chainId, providerName }
      } catch (err) {
        onClearState()
        throw err
      }
    },
    [_chainId, rpcUrl, _chainId, onSetup, setChainId, setAddress, onUpdateProvider],
  )
}

// actions
export function useSetChainId(): (chainId: number) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (chainId: number) => {
      if (Object.values(SupportedChainId).includes(chainId)) {
        dispatch(updateChainId({ chainId }))
      }
    },
    [dispatch],
  )
}

export function useLogout() {
  const walletProvider = useWalletProvider()

  const onClearState = useClearState()

  return useCallback(async () => {
    if (walletProvider?.provider.disconnect) {
      await walletProvider.provider.disconnect()
    }
    onClearState()
  }, [onClearState, walletProvider])
}

export function useSetConnection() {
  const dispatch = useAppDispatch()

  return useCallback(
    (isConnected: boolean) => {
      dispatch(setConnecting(isConnected))
    },
    [dispatch],
  )
}

// settings
export function useChangeAddress(): (address: string) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    async (address: string) => {
      dispatch(updateAddress({ address: toChecksumAddress(address) }))
    },
    [dispatch],
  )
}

export function useUpdateProviderName() {
  const dispatch = useAppDispatch()

  return useCallback(
    (providerName: Providers | undefined) => {
      dispatch(updateProviderName({ providerName }))
    },
    [dispatch],
  )
}

export function useClearState() {
  const dispatch = useAppDispatch()
  return useCallback(() => {
    dispatch(userClearState())
  }, [dispatch])
}

// selectors
export function useIsConnected() {
  return useAppSelector((state: AppState) => state.user.isConnected)
}

export function useAddress() {
  return useAppSelector((state: AppState) => state.user.address)
}

export function useChainId() {
  return useAppSelector((state: AppState) => state.user.chainId)
}

export function useProviderName() {
  return useAppSelector((state: AppState) => state.user.providerName)
}
