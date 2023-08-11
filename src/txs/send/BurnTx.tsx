import { useTranslation } from "react-i18next"
import { ChainFilter, Page } from "components/layout"
import TxContext from "../TxContext"
import { useChainID, useNetworkName } from "../../auth/hooks/useNetwork"
import BurnForm from "./BurnForm"
import { isTerraChain } from "../../utils/chain"

const BurnTx = () => {
  const { t } = useTranslation()
  const networkName = useNetworkName()
  const chainID = useChainID()

  return networkName === "mainnet" && isTerraChain(chainID) ? (
    <Page title={t("Burn Funds")}>
      <TxContext>
        <ChainFilter
          outside
          title={"Select a chain to burn funds from"}
          terraOnly
        >
          {(chainID) => <BurnForm chainID={chainID ?? ""} />}
        </ChainFilter>
      </TxContext>
    </Page>
  ) : (
    <></>
  )
}

export default BurnTx
