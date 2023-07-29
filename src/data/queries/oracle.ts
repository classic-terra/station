import { useMemo } from "react"
import { useQuery } from "react-query"
import { compareIs, compareIsDenomIBC } from "utils/coin"
import { toPrice } from "utils/num"
import { queryKey, RefetchOptions } from "../query"
import { useLCDClient } from "./lcdClient"
import { Coins } from "@terraclassic-community/terra.js"

export const useExchangeRates = () => {
  const lcd = useLCDClient()
  const isClassic = true

  return useQuery(
    [queryKey.oracle.exchangeRates, isClassic],
    async () => {
      if (isClassic) return await lcd.oracle.exchangeRates()
    },
    { ...RefetchOptions.DEFAULT }
  )
}

/* helpers */
type Prices = Record<Denom, Price>
export const useMemoizedPrices = (currency: Denom) => {
  const isClassic = true
  const { data: exchangeRates, ...state } = useExchangeRates()

  const prices = useMemo((): Prices | undefined => {
    if (!isClassic) return { uluna: 1 }

    if (!exchangeRates) return
    const base = toPrice(getAmount(exchangeRates, currency, "1"))

    return {
      uluna: base,
      ...sortCoins(exchangeRates, currency).reduce((acc, { amount, denom }) => {
        const price = toPrice(Number(base) / Number(amount))
        return { ...acc, [denom]: price }
      }, {}),
    }
  }, [currency, exchangeRates, isClassic])

  return { data: prices, ...state }
}

export const sortCoins = (
  coins: Coins,
  currency?: string,
  sorter?: (a: CoinData, b: CoinData) => number
) => {
  return sortByDenom(coins.toData(), currency, sorter)
}

export const sortByDenom = <T extends { denom: Denom }>(
  coins: T[],
  currency = "",
  sorter?: (a: T, b: T) => number
) =>
  coins.sort(
    (a, b) =>
      compareIs("uluna")(a.denom, b.denom) ||
      compareIs("uusd")(a.denom, b.denom) ||
      compareIs(currency)(a.denom, b.denom) ||
      compareIsDenomIBC(a.denom, b.denom) ||
      (sorter?.(a, b) ?? 0)
  )

export const getAmount = (
  coins: { denom: string; amount: string }[] | Coins,
  denom: Denom,
  fallback = "0"
) => {
  return (
    (Array.isArray(coins)
      ? coins.find((c) => c.denom === denom)?.amount
      : coins.get(denom)?.amount.toString()) ?? fallback
  )
}
