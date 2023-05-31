import { Fragment, useCallback, useEffect } from 'react'

import { useWalletProvider } from 'hooks/wallet'

import { useAppDispatch } from 'state/hooks'
import {
  useLogout,
  useAddress,
  useChainId,
  useSetChainId,
  useIsConnected,
  useInitProvider,
  useProviderName,
  useSetConnection,
  useChangeAddress,
} from 'state/user/hooks'

import { Providers } from 'constants/wallet'
import { hexToNumber, toChecksumAddress } from 'utils'

type Props = {
  children: JSX.Element
}

const EtherProvider = (props: Props) => {
  const dispatch = useAppDispatch()

  const address = useAddress()
  const chainId = useChainId()

  // ToDo make provider class
  const provider = useWalletProvider()
  const isConnected = useIsConnected()
  const providerName = useProviderName()

  const setChainId = useSetChainId()
  const setAddress = useChangeAddress()
  const setConnection = useSetConnection()

  const onClearState = useLogout()
  const initProvider = useInitProvider()

  useEffect(() => {
    if (isConnected && providerName) {
      onIsConnectedChanged()
    }

    if (!providerName) {
      setConnection(false)
    }
  }, [])

  const onIsConnectedChanged = useCallback(async () => {
    try {
      if (!providerName) {
        return
      }

      const newConnection = await initProvider(providerName)
      if (!newConnection) {
        return
      }

      setChainId(newConnection.chainId)
    } catch (err) {
      setConnection(false)
    }
  }, [isConnected, address, providerName, chainId])

  const onDisconnect = useCallback(() => {
    const providersToClear = [Providers.WALLET_CONNECT]
    if (providerName && providersToClear.includes(providerName)) {
      onClearState()
    }
  }, [providerName])

  const onAccountChange = useCallback(
    async ([account]: string[]) => {
      // https://github.com/MetaMask/metamask-extension/issues/10125
      if (account) {
        if (isConnected) {
          const checkSumAddress = toChecksumAddress(account)
          setAddress(checkSumAddress)
        }
      } else {
        onClearState()
      }
    },
    [isConnected, onClearState, setAddress, dispatch, address],
  )

  const onChainChange = useCallback(
    async (chainId: string) => {
      console.info('onChainChange etherProvider container', chainId)
      setChainId(hexToNumber(chainId))
    },
    [setChainId],
  )

  useEffect(() => {
    if (!provider?.provider) {
      return
    }

    if (isConnected) {
      provider.on({ method: 'disconnect', callback: onDisconnect })
      provider.on({ method: 'chainChanged', callback: onChainChange })
      provider.on({ method: 'accountsChanged', callback: onAccountChange })
    }

    return () => {
      provider.off({ method: 'disconnect', callback: onDisconnect })
      provider.off({ method: 'chainChanged', callback: onChainChange })
      provider.off({ method: 'accountsChanged', callback: onAccountChange })
    }
  }, [onAccountChange, onChainChange, provider?.provider, isConnected])

  return <Fragment>{props.children}</Fragment>
}

export default EtherProvider
