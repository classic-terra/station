import { useTranslation } from "react-i18next"
import { ChainFilter, Page } from "components/layout"
import FundCommunityPoolForm from "./FundCommunityPoolForm"
import TxContext from "../TxContext"
import { useChainID, useNetworkName } from "../../auth/hooks/useNetwork"
import { isTerraChain } from "../../utils/chain"

const FundCommunityPoolTx = () => {
  const { t } = useTranslation()
  const chainID = useChainID()

  return isTerraChain(chainID) ? (
    <Page title={t("Fund Community Pool")}>
      <TxContext>
        <ChainFilter
          outside
          title={"Select a chain to send funds from"}
          terraOnly
        >
          {(chainID) => <FundCommunityPoolForm chainID={chainID ?? ""} />}
        </ChainFilter>
      </TxContext>
    </Page>
  ) : (
    <></>
  )
}

export default FundCommunityPoolTx
