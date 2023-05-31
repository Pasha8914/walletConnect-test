import { createReducer } from '@reduxjs/toolkit'

import { Providers } from 'constants/wallet'
import { SupportedChainId } from 'constants/chains'

import {
  setConnecting,
  updateAddress,
  updateChainId,
  userClearState,
  updateConnecting,
  updateProviderName,
} from './actions'

export interface ApplicationState {
  readonly address: string
  readonly isConnected: boolean
  readonly providerName?: Providers
  readonly chainId: SupportedChainId
}

const initialState: ApplicationState = {
  address: '',
  isConnected: false,
  providerName: undefined,
  chainId: SupportedChainId.MAINNET,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateChainId, (state, { payload }) => {
      state.chainId = payload.chainId
    })
    .addCase(updateAddress, (state, action) => {
      state.address = action.payload.address
    })
    .addCase(updateConnecting, (state) => {
      state.isConnected = !state.isConnected
    })
    .addCase(setConnecting, (state, action) => {
      state.isConnected = action.payload
    })
    .addCase(updateProviderName, (state, action) => {
      state.providerName = action.payload.providerName
    })

    .addCase(userClearState, () => initialState),
)
