import { hexValue } from '@ethersproject/bytes'

import { toChecksumAddress } from 'utils'
import { Providers } from 'constants/wallet'
import { numbers } from 'constants/variables'

import {
  Params,
  Transaction,
  ProviderOptions,
  OldRequestParams,
  ProviderInstance,
  OnListenerParams,
  GetBalanceParams,
  AbstractProvider,
  SendRequestParams,
  TransactionResult,
  TransactionByHash,
  BatchRequestParams,
  SetupProviderResponse,
  WaitForTxReceiptParams,
} from './@types'

const changeChainAvailable: string[] = [Providers.METAMASK]
// TODO create type & constants for RPC methods
export class AbstractWalletProvider implements ProviderInstance {
  protected readonly config: { callRetryAttempt: number }

  public version: string
  public address: string
  public chainId: number
  public providerName: string
  public provider: AbstractProvider

  public constructor(options: ProviderOptions) {
    this.address = ''
    this.version = 'new'
    this.chainId = 1

    this.config = {
      callRetryAttempt: 15,
    }

    this.provider = options.provider
    this.providerName = options.providerName
  }

  public async setupProvider(): Promise<SetupProviderResponse> {
    if (!this.provider) {
      throw new Error('Please, connect your wallet to the browser')
    }

    try {
      await this.checkVersion()

      return await this.initProvider()
    } catch (err) {
      throw new Error(`Provider method setupProvider has error: ${err.message}`)
    }
  }

  public getIsChangeChainAvailable(): boolean {
    return changeChainAvailable.includes(this.providerName)
  }

  public checkProviderName(name: string): boolean {
    return this.providerName === name
  }

  public async sendRequest<T>(params: SendRequestParams): Promise<T> {
    try {
      const args = this.prepareRequest(params)

      if (this.version === 'old') {
        return await this.sendAsync<T>({ ...args, from: this.address })
      }

      return await this.provider.request<T>(args)
    } catch (err) {
      if (err?.code) {
        throw {
          code: err.code,
          message: `Provider method sendRequest has error: ${err.message}`,
        }
      } else {
        throw new Error(`Provider method sendRequest has error: ${err.message}`)
      }
    }
  }

  public async getBalance({ address }: GetBalanceParams): Promise<string> {
    const { callRetryAttempt } = this.config

    try {
      const params = {
        method: 'eth_getBalance' as const,
        params: [address, 'latest'],
      }

      return await this.repeatRequestUntilResult<string>(params, callRetryAttempt)
    } catch (err) {
      throw new Error(`Provider method getBalance has error: ${err.message}`)
    }
  }

  public async waitForTxReceipt(params: WaitForTxReceiptParams): Promise<Transaction> {
    const { callRetryAttempt } = this.config

    try {
      const multiplier = 10

      const receiptParams = {
        method: 'eth_getTransactionReceipt' as const,
        params: [params.txHash],
      }

      const txParams = {
        method: 'eth_getTransactionByHash' as const,
        params: [params.txHash],
      }

      const totalAttempt = callRetryAttempt * multiplier
      const [receipt, transaction] = await Promise.all([
        this.repeatRequestUntilResult<TransactionResult>(receiptParams, totalAttempt),
        this.repeatRequestUntilResult<TransactionByHash>(txParams, totalAttempt),
      ])

      return Object.assign(receipt, { value: transaction.value })
    } catch (err) {
      throw new Error(`Provider method waitForTxReceipt has error: ${err.message}`)
    }
  }

  public async batchRequest<T>({ txs, callback }: BatchRequestParams): Promise<T[]> {
    try {
      const txsPromisesBucket = []

      const EVERY_SECOND = 2

      for (const [index, params] of txs.entries()) {
        const txPromise = this.sendRequest<T>({
          method: 'eth_sendTransaction',
          params: [params],
        })

        await this.sleep(numbers.SECOND)

        if (index % EVERY_SECOND === numbers.ZERO && index !== numbers.ZERO) {
          await txPromise
        }

        txsPromisesBucket.push(txPromise)
      }

      if (typeof callback === 'function') {
        callback(txsPromisesBucket)
      }

      return await Promise.all(txsPromisesBucket)
    } catch (err) {
      throw new Error(err.message)
    }
  }

  public async getChainId(): Promise<number> {
    try {
      const result = await this.sendRequest<string>({ method: 'eth_chainId' })
      return Number(result)
    } catch (err) {
      throw new Error(`Provider method checkNetworkVersion has error: ${err.message}`)
    }
  }

  public on({ method, callback }: OnListenerParams): void {
    try {
      if (typeof this.provider.on === 'function') {
        this.provider.on(method, callback)
      }
    } catch (err) {
      throw new Error(`Provider method on has error: ${err.message}`)
    }
  }

  public off({ method, callback }: OnListenerParams): void {
    try {
      if (typeof this.provider.removeListener === 'function') {
        this.provider.removeListener(method, callback)
      }
    } catch (err) {
      throw new Error(`Provider method off has error: ${err.message}`)
    }
  }

  private async initProvider(): Promise<SetupProviderResponse> {
    try {
      let address: string | null

      if (this.version === 'old') {
        ;[address] = await this.provider.enable()
      } else if (this.provider?.injectedRequest) {
        ;[address] = await this.provider.injectedRequest() // for wallet connect
      } else {
        ;[address] = await this.sendRequest<string[]>({ method: 'eth_requestAccounts' })
      }

      if (address == null) {
        throw new Error('Locked provider')
      }

      address = toChecksumAddress(address)

      this.address = address
      this.chainId = await this.getChainId()

      return { address, chainId: this.chainId }
    } catch (err) {
      throw new Error(`Provider method initProvider has error: ${err.message}`)
    }
  }

  private async sleep(time: number): Promise<void> {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  private async sendAsync<T>({ method, params, from }: OldRequestParams): Promise<T> {
    const SPOA = 77
    const POA = 99
    const XDAI = 99

    switch (this.chainId) {
      case SPOA:
      case POA:
      case XDAI:
        from = ''
        break
    }

    return await new Promise((resolve, reject) => {
      const callback = (err: Error, response: { error: Error; result: T }): void => {
        if (err.message !== '' || response.error.message !== '') {
          reject(err)
        }

        resolve(response.result)
      }

      this.provider.sendAsync(
        {
          from,
          method,
          params,
          jsonrpc: '2.0',
          id: this.generateId(),
        },
        callback,
      )
    })
  }

  private onNetworkChanged({ id }: { id: number }): void {
    if (!isNaN(id)) {
      this.chainId = id
    }
  }

  private onAccountsChanged(accounts: string[]): void {
    const [account] = accounts

    if (account !== '') {
      this.address = account
    }
  }

  private checkVersion(): void {
    if (typeof this.provider.request === 'function') {
      this.version = 'new'
    } else {
      this.version = 'old'
    }
  }

  private prepareRequest({ method, params }: SendRequestParams) {
    switch (method) {
      case 'eth_call':
      case 'eth_sendTransaction': {
        if (params instanceof Array) {
          const [args] = params
          if (args instanceof Object) {
            //TODO fix SendRequestParams

            return { method, params: [this.hexlifyParams(args as Params)] }
          }
        }
        break
      }
    }

    return { method, params }
  }

  private hexlifyParams(params: Params | Record<string, string>) {
    const result = Object.assign({}, params)

    const numericParams: Array<keyof Params> = [
      'gas',
      'type',
      'nonce',
      'value',
      'gasPrice',
      'maxFeePerGas',
      'maxPriorityFeePerGas',
    ]

    numericParams.forEach((key) => {
      const value = params[key]
      if (value) {
        result[key] = hexValue(value)
      }
    })

    return result
  }

  private async repeatRequestUntilResult<T>(
    params: SendRequestParams,
    totalAttempts: number,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    retryAttempt = 1,
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      const iteration = async (): Promise<void> => {
        try {
          const result = await this.sendRequest<T>(params)

          if (!result) {
            if (retryAttempt <= totalAttempts) {
              retryAttempt++
              setTimeout(() => {
                // eslint-disable-next-line no-void
                void iteration()
              }, numbers.SECOND * retryAttempt)
            } else {
              return reject(new Error('Tx not minted'))
            }
          } else {
            resolve(result)
          }
        } catch (err) {
          reject(err)
        }
      }

      // eslint-disable-next-line no-void
      void iteration()
    })
  }

  private generateId(): number {
    const base = 10
    const exponent = 3

    const date = Date.now() * Math.pow(base, exponent)
    const extra = Math.floor(Math.random() * Math.pow(base, exponent))
    return date + extra
  }
}
