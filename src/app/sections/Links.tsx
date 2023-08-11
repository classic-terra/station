import { useTranslation } from "react-i18next"
import DescriptionIcon from "@mui/icons-material/Description"
import { FORUMS } from "config/constants"
import { ExternalLink } from "components/general"
import { Contacts } from "components/layout"
import styles from "./Links.module.scss"
import { capitalize } from "@mui/material"
import { useTheme } from "data/settings/Theme"

const Links = () => {
  const { t } = useTranslation()
  // const isConnected = useAddress()
  const { name } = useTheme()

  const community = {
    // discord: "https://discord.gg/K6Yd8xhYTF",
    // telegram: "https://t.me/OfficialTerraRebels",
    twitter: "https://twitter.com/hexxagon_io",
    github: "https://github.com/classic-terra",
  }

  return (
    <div className={styles.links}>
      <div
        className={`${styles.tutorial} ${
          name === "blossom" && styles.tutorial_white
        }`}
      >
        {/*{!isConnected && (*/}
        {/*  <ExternalLink href={SETUP} className={styles.link}>*/}
        {/*    <BoltIcon style={{ fontSize: 18 }} />*/}
        {/*    {capitalize(t("setup"))}*/}
        {/*  </ExternalLink>*/}
        {/*)}*/}
        <ExternalLink href={FORUMS} className={styles.link}>
          <DescriptionIcon style={{ fontSize: 18 }} />
          {capitalize(t("support forums"))}
        </ExternalLink>
      </div>

      <div className={styles.community}>
        <Contacts contacts={community} menu />
      </div>
    </div>
  )
}

export default Links
