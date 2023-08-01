import { useCallback, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import {
  AccAddress,
  MsgFundCommunityPool,
} from "@terraclassic-community/feather.js"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { useTnsAddress } from "data/external/tns"
import { Card, Grid } from "components/layout"
import { Form, FormItem, FormWarning, Input } from "components/form"
import Tx, { getInitialGasDenom } from "../Tx"
import { toAmount } from "@terra-money/terra-utils"
import { CoinInput, getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import { useNativeDenoms } from "../../data/token"
import { getAmount } from "../../utils/coin"
import { useExchangeRates } from "../../data/queries/coingecko"

interface TxValues {
  recipient?: string // AccAddress | TNS
  address?: AccAddress // hidden input
  input?: number
  memo?: string
}

interface AssetType {
  denom: string
  balance: string
  icon: string
  symbol: string
  price: number
  chains: string[]
}

const FundCommunityPoolForm = ({ chainID }: { chainID: string }) => {
  const { t } = useTranslation()
  const connectedAddress = useAddress()
  const bankBalance = useBankBalance()
  const balances = useBankBalance()
  const { data: prices } = useExchangeRates()
  const readNativeDenom = useNativeDenoms()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, setError, handleSubmit, reset } =
    form
  const { formState } = form
  const { errors } = formState
  const { recipient, input } = watch()

  const availableAssets = useMemo(
    () =>
      Object.values(
        (balances ?? []).reduce((acc, { denom, amount, chain }) => {
          const data = readNativeDenom(denom)
          if (acc[data.token]) {
            acc[data.token].balance = `${
              parseInt(acc[data.token].balance) + parseInt(amount)
            }`
            acc[data.token].chains.push(chain)
            return acc as Record<string, AssetType>
          } else {
            return {
              ...acc,
              [data.token]: {
                denom: data.token,
                balance: amount,
                icon: data.icon,
                symbol: data.symbol,
                price: prices?.[data.token]?.price ?? 0,
                chains: [chain],
              },
            } as Record<string, AssetType>
          }
        }, {} as Record<string, AssetType>)
      ).sort(
        (a, b) => b.price * parseInt(b.balance) - a.price * parseInt(a.balance)
      ),
    [balances, readNativeDenom, prices]
  )
  const defaultAsset = availableAssets[0].denom
  const decimals = defaultAsset ? readNativeDenom(defaultAsset).decimals : 6
  const amount = toAmount(input, { decimals })
  const token = readNativeDenom(defaultAsset).token
  const balance = getAmount(bankBalance, token)

  /* resolve recipient */
  const { data: resolvedAddress, ...tnsState } = useTnsAddress(recipient ?? "")

  useEffect(() => {
    if (!recipient) {
      setValue("address", connectedAddress)
      setValue("recipient", connectedAddress)
    }
  }, [form, recipient, connectedAddress, setValue])

  // validate(tns): not found
  const invalid =
    recipient?.endsWith(".ust") && !tnsState.isLoading && !resolvedAddress
      ? t("Address not found")
      : ""

  const disabled =
    invalid || (tnsState.isLoading && t("Searching for address..."))

  useEffect(() => {
    if (invalid) setError("recipient", { type: "invalid", message: invalid })
  }, [invalid, setError])

  /* tx */
  const createTx = useCallback(
    ({ address, input, memo }: TxValues) => {
      if (!connectedAddress) return
      if (!(address && AccAddress.validate(address))) return
      const amount = toAmount(input, { decimals })

      const msgs = [new MsgFundCommunityPool(connectedAddress, amount + token)]

      return { msgs, memo, chainID: chainID }
    },
    [connectedAddress, decimals, token, chainID]
  )

  /* fee */
  const taxRequired = chainID === "columbus-5"
  const coins = [
    { input, denom: token, taxRequired: taxRequired },
  ] as CoinInput[]
  const estimationTxValues = useMemo(
    () => ({ address: connectedAddress, input: toInput(1, decimals) }),
    [connectedAddress, decimals]
  )

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const tx = {
    token,
    decimals,
    amount,
    coins,
    chain: chainID,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    disabled,
    onChangeMax,
    onSuccess: () => reset(),
    taxRequired: true,
    queryKeys: AccAddress.validate(token)
      ? [[queryKey.wasm.contractQuery, token, { balance: connectedAddress }]]
      : undefined,
  }

  return (
    <Card isFetching={tnsState.isLoading}>
      <Tx {...tx}>
        {({ max, fee, submit }) => (
          <Form onSubmit={handleSubmit(submit.fn)}>
            <Grid gap={4}>
              <FormWarning>
                {t(
                  "You are about to send funds to the community pool (distribution module), this operation cannot be reversed"
                )}
              </FormWarning>
            </Grid>

            <FormItem
              label={t("Amount")}
              extra={max.render()}
              error={errors.input?.message}
            >
              <Input
                {...register("input", {
                  valueAsNumber: true,
                  validate: validate.input(
                    toInput(max.amount, decimals),
                    decimals
                  ),
                })}
                token={token}
                inputMode="decimal"
                onFocus={max.reset}
                placeholder={getPlaceholder(decimals)}
              />
            </FormItem>

            {fee.render()}
            {submit.button}
          </Form>
        )}
      </Tx>
    </Card>
  )
}

export default FundCommunityPoolForm
