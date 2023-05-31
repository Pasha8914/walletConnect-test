import { useCallback, useMemo } from 'react'

import { useWalletProvider } from 'hooks/wallet'

import { useAddress, useChainId } from 'state/user/hooks'

import { RPC_LIST } from 'constants/chains'

import { Params } from 'services/provider/@types'
import { AbstractWalletProvider } from 'services/provider'

export type CreateTransactionParams = {
  to: string
  gas?: string
  amount?: string
  calldata?: string
}

export function useCreateTransaction() {
  const address = useAddress()
  const chainId = useChainId()
  const walletProvider = useWalletProvider()

  const rpcUrl = useMemo(() => RPC_LIST[chainId], [chainId])
  const sendTx = useCallback(async (_walletProvider: AbstractWalletProvider, _params: Params) => {
    try {
      return await _walletProvider.sendRequest<string>({
        method: 'eth_sendTransaction',
        params: [{ ..._params }],
      })
    } catch (err) {
      // https://github.com/MetaMask/metamask-extension/issues/13341
      throw err
    }
  }, [])

  return useCallback(
    async ({ to, gas, amount = '0x0', calldata = '0x0' }: CreateTransactionParams): Promise<string> => {
      try {
        if (!walletProvider) {
          throw new Error('Please connect the wallet')
        }
        const txHash = await sendTx(walletProvider, {
          to,
          gas,
          from: address,
          data: calldata,
          value: amount,
        })
        return txHash
      } catch (err) {
        console.error('CREATE TX', err.message)
        throw err
      }
    },
    [address, sendTx, chainId, rpcUrl, walletProvider],
  )
}
