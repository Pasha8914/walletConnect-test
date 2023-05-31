import { BigNumber } from 'ethers'

import { ProviderAccounts } from 'eip1193-provider'
import { Listener } from '@ethersproject/abstract-provider'

export type Address = string

export type Params = {
  to: string
  data: string
  gas?: string
  from: string
  type?: string
  value: string
  nonce?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
}

export type WalletMethod =
  | 'wallet_addEthereumChain'
  | 'wallet_switchEthereumChain'
  | 'eth_call'
  | 'eth_sendTransaction'
  | 'eth_requestAccounts'
  | 'eth_chainId'
  | 'eth_getTransactionReceipt'
  | 'eth_getTransactionByHash'
  | 'eth_getBalance'
  | 'personal_sign'
  | 'eth_signTypedData_v4'
  | 'eth_signTypedData_v3'

export type CustomMethodParams =
  | Record<string, string | string[] | number | Record<string, unknown>>[]
  | string
  | string[]

export interface SendRequestParams {
  method: WalletMethod
  params?: Params[] | CustomMethodParams
}

export type OldRequestParams = {
  from: string
} & SendRequestParams

export interface ContractRequestParams {
  to: string
  gas: string
  from: string
  methodName: string
  data?: string
  value?: number
}

export type TransactionStatus = 'success' | 'fail' | 'pending'

export type TxLog = {
  address: string
  blockHash: string
  blockNumber: string
  data: string
  logIndex: string
  removed: boolean
  topics: string[]
  transactionHash: string
  transactionIndex: string
}

export type TxLogs = TxLog[]

export interface TransactionResult {
  timestamp: number
  transactionHash: string
  transactionIndex: string
  blockNumber: number
  blockHash: string
  cumulativeGasUsed: BigNumber
  gasUsed: BigNumber
  contractAddress: string
  logs: TxLogs
  logsBloom: string
  status: string
  effectiveGasPrice: BigNumber
}

export interface TransactionByHash {
  from: string
  gas: string
  gasPrice: string
  hash: string
  input: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  nonce: number
  r: string
  s: string
  to: string
  transactionIndex: number | null
  type: string
  v: string
  value: string
  data: string
}

export type Transaction = {
  value: string
} & TransactionResult

export interface TransactionReceipt {
  status: TransactionStatus
  transactionError?: string
  transactionResult: TransactionResult
}

export interface GetBalanceParams {
  address: string
}

export interface WaitForTxReceiptParams {
  txHash: string
  minConfirmation?: number
  attempt?: number
  callback?: CallableFunction
}

export interface BatchRequestParams {
  txs: Params[]
  callback?: (params: Array<Promise<unknown>>) => void
}

export interface OnListenerParams {
  method: string
  callback: Listener
}

export type ProviderOptions = {
  providerName: string
  callRetryAttempt?: number
  version?: ProviderVersions
  provider: AbstractProvider
}

type ProviderVersions = 'new' | 'old'

type SendAsyncParams = {
  id: number
  jsonrpc: string
} & OldRequestParams

export type AbstractProvider = ExternalProvider & ExtendedProvider
export type ExternalProvider = ExternalMetamaskProvider

export type ExtendedProvider = {
  disconnect: () => Promise<void>
  isChainChangeDisabled?: boolean
  injectedRequest?: () => Promise<string[]>
  enable: () => Promise<ProviderAccounts>
  close?: () => Promise<void>
  request: <T>(params: SendRequestParams) => Promise<T>
  on: (method: string, callback?: CallableFunction) => void
  removeListener: (method: string, callback?: CallableFunction) => void
  sendAsync: (params: SendAsyncParams, callback: CallableFunction) => void
}

// need for ethers
export type ExternalMetamaskProvider = {
  host?: string
  path?: string
  isStatus?: boolean
  isMetaMask?: boolean
  request: <T>(request: { method: string; params?: never[] }) => Promise<T>
  send: <T>(request: { method: string; params?: never[] }, callback: (error: Error, response: T) => void) => void
  sendAsync: <T>(request: { method: string; params?: never[] }, callback: (error: Error, response: T) => void) => void
}

export type SetupProviderResponse = { address: Address; chainId: number }

export interface ProviderInstance {
  provider?: AbstractProvider

  setupProvider: () => Promise<SetupProviderResponse>
  sendRequest: (params: SendRequestParams) => Promise<TransactionResult>
  getBalance: (params: GetBalanceParams) => Promise<string>
  waitForTxReceipt: (params: WaitForTxReceiptParams) => Promise<Transaction>
  batchRequest: <T>(params: BatchRequestParams) => Promise<T[]>
  getChainId: () => Promise<number>

  on: (params: OnListenerParams) => void
  off: (params: OnListenerParams) => void
}
