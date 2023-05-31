import { BigNumber, utils, BigNumberish } from 'ethers'

import { numbers } from 'constants/variables'

export function toWei(value: BigNumberish, uintName: BigNumberish = 'ether') {
  if (!value) {
    return BigNumber.from('0')
  }
  return utils.parseUnits(value.toString(), uintName)
}

export function hexToNumber(hex: string) {
  return BigNumber.from(hex).toNumber()
}

// @ts-expect-error for set unitName init value
export function fromWei(balance: BigNumberish, unitName?: string | BigNumberish = numbers.ETH_DECIMALS) {
  return utils.formatUnits(String(balance), unitName)
}

export function toChecksumAddress(value: any): string {
  try {
    return utils.getAddress(value)
  } catch {
    return ''
  }
}
