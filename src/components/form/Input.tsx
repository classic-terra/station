import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode } from "react"
import classNames from "classnames/bind"
import SearchIcon from "@mui/icons-material/Search"
import { WithTokenItem } from "data/token"
import { Flex } from "../layout"
import styles from "./Input.module.scss"
import QrCodeIcon from "@mui/icons-material/QrCode"
import ScanQR from "../general/ScanQR"

const cx = classNames.bind(styles)

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  token?: Token
  selectBefore?: ReactNode
  actionButton?: {
    icon: ReactNode
    onClick: () => void
  }
  withQR?: boolean
  handleScan?: any
}

const Input = forwardRef(
  (
    { selectBefore, token, actionButton, withQR, handleScan, ...attrs }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className={styles.wrapper}>
        {selectBefore}

        <input
          {...attrs}
          className={cx(styles.input, {
            before: token || actionButton,
            after: selectBefore,
          })}
          step="any"
          autoComplete="off"
          ref={ref}
        />

        {token && (
          <WithTokenItem token={token}>
            {({ symbol }) => (
              <Flex className={classNames(styles.symbol, styles.after)}>
                {symbol}
              </Flex>
            )}
          </WithTokenItem>
        )}

        {(actionButton || withQR) && (
          <Flex gap={10} className={classNames(styles.symbol, styles.after)}>
            {actionButton && (
              <button
                type="button"
                onClick={(e) => {
                  actionButton.onClick()
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                {actionButton.icon}
              </button>
            )}

            {withQR && (
              <ScanQR
                renderButton={(open) => (
                  <button type="button" onClick={open}>
                    <QrCodeIcon style={{ fontSize: 18 }} />
                  </button>
                )}
                onResult={handleScan}
              />
            )}
          </Flex>
        )}
      </div>
    )
  }
)

export default Input

/* search */
export const SearchInput = forwardRef(
  (
    attrs: InputHTMLAttributes<HTMLInputElement> & {
      padding?: boolean
      small?: boolean
      inline?: boolean
      extra?: ReactNode
    },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div
        className={classNames(
          styles.wrapper,
          styles.search,
          attrs.small && styles.search__small,
          attrs.inline && styles.search__inline
        )}
        style={attrs.padding ? {} : { margin: 0 }}
      >
        <input
          {...attrs}
          className={classNames(
            styles.input,
            attrs.small && styles.input__small
          )}
          inputMode="search"
          autoComplete="off"
          ref={ref}
        />

        <SearchIcon className={styles.icon} />
        {attrs.extra}
      </div>
    )
  }
)
