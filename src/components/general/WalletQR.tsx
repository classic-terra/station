import { useTranslation } from "react-i18next"
import { RenderButton } from "types/components"
import { Grid } from "components/layout"
import { ModalButton } from "components/feedback"
import QRCodeGen from "auth/components/QRCode"
import { AccAddress } from "@terraclassic-community/feather.js"

const WalletQR = ({
  renderButton,
  address,
}: {
  renderButton: RenderButton
  address: AccAddress
}) => {
  const { t } = useTranslation()

  if (!address) return null

  return (
    <ModalButton title={t("Wallet address")} renderButton={renderButton}>
      <Grid gap={20}>
        <QRCodeGen value={address} />
        <p className="small center">{address}</p>
      </Grid>
    </ModalButton>
  )
}

export default WalletQR
