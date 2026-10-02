export interface TrunkLine {
  /** as displayed, e.g. "(02) 3449-6400" */
  display: string
  /** value for a tel: link */
  tel: string
}

export const TRUNK_LINES: TrunkLine[] = [
  { display: "(02) 3449-6400", tel: "+63234496400" },
  { display: "(02) 8555-8000", tel: "+63285558000" },
  { display: "(02) 8528-3200", tel: "+63285283200" },
]

export const DIAL_NOTES = [
  "To connect to an employee's number: dial the Local No. directly.",
  "To connect to a Metro Manila landline: dial 9 + the 8-digit landline number.",
]
