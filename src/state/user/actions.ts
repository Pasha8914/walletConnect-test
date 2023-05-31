import { createAction } from '@reduxjs/toolkit'

import { Providers } from 'constants/wallet'

export const updateConnecting = createAction('user/updateConnecting')
export const setConnecting = createAction<boolean>('user/setConnecting')
export const updateAddress = createAction<{ address: string }>('user/updateAddress')

export const updateChainId = createAction<{ chainId: SupportedChainId }>('user/updateChainId')
export const updateProviderName = createAction<{ providerName: Providers | undefined }>('user/updateProviderName')

// clear state
export const userClearGas = createAction('user/userClearGas')
export const userClearState = createAction('user/clearState')
