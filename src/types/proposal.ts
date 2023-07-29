import { Vote } from "@terraclassic-community/feather.js"

export interface TerraProposalItem {
  voter: string
  options: { option: Vote.Option; weight: string }[]
}
