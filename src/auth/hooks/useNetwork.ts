import { atom, useRecoilState, useRecoilValue } from "recoil"
import { useNetworks } from "app/InitNetworks"
import { getStoredNetwork, storeNetwork } from "../scripts/network"
import {
  useWallet,
  WalletStatus,
} from "@terraclassic-community/wallet-provider"
import { walletState } from "./useAuth"
import isWallet from "../scripts/isWallet"
import { useCustomLCDs } from "utils/localStorage"

const networkState = atom({
  key: "network",
  default: getStoredNetwork(),
})

export const useNetworkState = () => {
  const [storedNetwork, setNetwork] = useRecoilState(networkState)

  const changeNetwork = (network: NetworkName) => {
    if (network !== storedNetwork) {
      setNetwork(network)
      storeNetwork(network)
    }
  }

  return [storedNetwork, changeNetwork] as const
}

/* helpers */
export const useNetworkOptions = () => {
  return [
    { value: "mainnet", label: "Mainnets" },
    { value: "testnet", label: "Testnets" },
    // { value: "classic", label: "Terra Classic" },
    { value: "localterra", label: "LocalTerra" },
  ]
}

export const useNetwork = (): Record<ChainID, InterchainNetwork> => {
  const { networks, filterEnabledNetworks } = useNetworks()
  const [network, setNetwork] = useNetworkState()
  const wallet = useRecoilValue(walletState)
  const connectedWallet = useWallet()
  const { customLCDs } = useCustomLCDs()

  function withCustomLCDs(networks: Record<ChainID, InterchainNetwork>) {
    return Object.fromEntries(
      Object.entries(networks).map(([key, val]) => [
        key,
        { ...val, lcd: customLCDs[val.chainID] || val.lcd },
      ])
    )
  }

  // check connected wallet
  if (connectedWallet.status === WalletStatus.WALLET_CONNECTED) {
    if (network !== "mainnet" && "columbus-5" in connectedWallet.network) {
      setNetwork("mainnet")
    } else if (network !== "testnet" && "rebel-2" in connectedWallet.network) {
      setNetwork("testnet")
    } else if (
      network !== "localterra" &&
      "localterra" in connectedWallet.network
    ) {
      setNetwork("localterra")
    }

    return filterEnabledNetworks(
      connectedWallet.network as Record<ChainID, InterchainNetwork>
    )
  }

  // multisig wallet are supported only on terra
  if (isWallet.multisig(wallet)) {
    const terra = Object.values(
      withCustomLCDs(
        networks[network as NetworkName] as Record<ChainID, InterchainNetwork>
      )
    ).find(({ prefix }) => prefix === "terra")
    if (!terra) return {}
    return filterEnabledNetworks({ [terra.chainID]: terra })
  }

  if (wallet && !wallet?.words?.["118"]) {
    const chains330 = Object.values(
      withCustomLCDs(
        networks[network as NetworkName] as Record<ChainID, InterchainNetwork>
      )
    ).filter(({ coinType }) => coinType === "330")

    return filterEnabledNetworks(
      chains330.reduce((acc, chain) => {
        acc[chain.chainID] = chain
        return acc
      }, {} as Record<ChainID, InterchainNetwork>)
    )
  }

  return filterEnabledNetworks(withCustomLCDs(networks[network as NetworkName]))
}

export const useNetworkName = () => {
  return useRecoilValue(networkState)
}

export const useChainID = () => {
  const network = useRecoilValue(networkState)
  switch (network) {
    case "mainnet":
      return "columbus-5"
    case "testnet":
      return "rebel-2"
    case "classic":
      return "columbus-5"
    case "localterra":
      return "localterra"
  }

  return ""
}
