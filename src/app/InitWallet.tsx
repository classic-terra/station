import { PropsWithChildren, useEffect } from "react"
import { WalletStatus, useWallet } from "@terraclassic-community/wallet-kit"
import Online from "./containers/Online"
import NetworkLoading from "./NetworkLoading"
import { sandbox } from "auth/scripts/env"
import isWallet from "../auth/scripts/isWallet"
import useAuth from "../auth/hooks/useAuth"

const InitWallet = ({ children }: PropsWithChildren<{}>) => {
  useOnNetworkChange()
  const { status } = useWallet()

  return status === WalletStatus.INITIALIZING && !sandbox ? (
    <NetworkLoading
      timeout={{
        time: 3000,
        fallback: () => {
          localStorage.removeItem("__wallet_kit_connected_wallet")
          window.location.reload()
        },
      }}
    />
  ) : (
    <>
      {children}
      <Online />
    </>
  )
}

export default InitWallet

/* hooks */
const useOnNetworkChange = () => {
  const { wallet, disconnect } = useAuth()
  const isPreconfiguredWallet = isWallet.preconfigured(wallet)
  const shouldDisconnect = isPreconfiguredWallet

  useEffect(() => {
    if (shouldDisconnect) disconnect()
  }, [disconnect, shouldDisconnect])
}
