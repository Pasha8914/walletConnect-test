import { useMemo } from 'react'

import { useChangeNetwork, useCreateTransaction, useWalletProvider } from 'hooks/wallet'
import { useAddress, useChainId, useInitProvider, useIsConnected, useLogout, useSetChainId } from 'state/user/hooks'

import { toWei } from 'utils/crypto'

import { Providers } from 'constants/wallet'
import { SupportedChainId } from 'constants/chains'

function App() {
  const address = useAddress()
  const chainId = useChainId()
  const isConnected = useIsConnected()
  const changeAppNetwork = useSetChainId()

  const logout = useLogout()
  const initProvider = useInitProvider()
  const changeNetwork = useChangeNetwork()
  const createTransaction = useCreateTransaction()

  const walletProvider = useWalletProvider()
  const isSendDisabled = useMemo(() => {
    return !address || !isConnected
  }, [address, isConnected])

  const setupWalletConnect = async () => {
    await initProvider(Providers.WALLET_CONNECT)
  }

  const send = async () => {
    await createTransaction({
      amount: toWei('0.001')._hex,
      to: '0x27E82Ba6AfEbf3Eee3A8E1613C2Af5987929a546',
    })
  }

  const switchChain = (_chainId: SupportedChainId) => async () => {
    if (!walletProvider) {
      return
    }
    await changeNetwork(_chainId, walletProvider)
    changeAppNetwork(_chainId)
  }

  return (
    <div>
      Chain id - {chainId}
      <div>
        <button onClick={setupWalletConnect}>connect</button>
        <button disabled={isSendDisabled} onClick={send}>
          send
        </button>
        <button onClick={logout}>logout</button>
      </div>
      <div>
        <button onClick={switchChain(SupportedChainId.POLYGON)} disabled={!walletProvider}>
          Polygon
        </button>
        <button onClick={switchChain(SupportedChainId.MAINNET)} disabled={!walletProvider}>
          Mainnet
        </button>
      </div>
    </div>
  )
}

export default App
