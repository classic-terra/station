import { PropsWithChildren, useEffect } from "react"
import { WalletStatus } from "@terraclassic-community/wallet-types"
import { useWallet } from "@terraclassic-community/use-wallet"
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
          localStorage.removeItem("__terra_extension_router_session__")
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
  const shouldDisconnect = isWallet.preconfigured(wallet)

  useEffect(() => {
    if (shouldDisconnect) disconnect()
  }, [disconnect, shouldDisconnect])
}
