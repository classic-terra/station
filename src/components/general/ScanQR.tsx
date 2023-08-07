import { useTranslation } from "react-i18next"
import { RenderButton } from "types/components"
import { Grid } from "components/layout"
import { QrReader } from "react-qr-reader"
import { ModalButton } from "../feedback"
import { useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const ScanQR = ({
  renderButton,
  onResult,
}: {
  renderButton: RenderButton
  onResult?: any
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [toggleScanQR, setToggleScanQR] = useState(false)

  const handleScan = (result: any) => {
    const schemeUrl = {
      connectWallet: /^.*(wallet_connect|walletconnect_connect).*payload/,
      recoverWallet: /^terraclassicstation:(|\/\/)wallet_recover\/\?payload=/,
      send: /^terraclassicstation:(|\/\/)send\/\?payload=/,
    }

    if (!!result) {
      if (schemeUrl.recoverWallet.test(result)) {
        // recover
        const url = new URL(result)
        const payload = url.searchParams.get("payload")

        return navigate("/auth/import", {
          state: payload,
        })
      }
    }

    toast.error("Not a valid QR code.", {
      toastId: "qr-code-error",
    })
  }

  return (
    <ModalButton
      title={t("Scan QR Code")}
      renderButton={renderButton}
      modalClose={toggleScanQR}
    >
      <Grid gap={20}>
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              onResult
                ? onResult(result?.getText())
                : handleScan(result?.getText())
              setToggleScanQR(!toggleScanQR)
            }
          }}
          videoStyle={{ width: "100%" }}
          constraints={{ facingMode: "environment" }}
        />
      </Grid>
    </ModalButton>
  )
}

export default ScanQR
