import type { DirectoryEntry } from "@/lib/types"
import { DIAL_NOTES, TRUNK_LINES } from "@/lib/trunk-lines"

const SECTIONS: { name: string; color: string }[] = [
  { name: "HOUSING COMPOUND", color: "#2e86a0" },
  { name: "CHEP", color: "#c0504d" },
  { name: "MHEP", color: "#4f8021" },
  { name: "PHEP", color: "#e46c0a" },
]
const OTHERS_COLOR = "#7f7f7f"
const OTHERS_MIN_ROWS = 3
const NAVY = "#1f3864"

const ROW = "h-[4.7mm] border border-[#9db3d1] px-[1.5mm] align-middle"

function formatAsOf(updatedAt?: string) {
  if (!updatedAt) return new Date().toLocaleDateString("en-US", { dateStyle: "long" })
  const d = /^\d{4}-\d{2}-\d{2}$/.test(updatedAt) ? new Date(`${updatedAt}T00:00:00`) : null
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { dateStyle: "long" })
    : updatedAt
}

function Band({ label, color }: { label: string; color: string }) {
  return (
    <tr>
      <td
        colSpan={2}
        className="h-[4.7mm] border border-[#9db3d1] px-[1.5mm] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </td>
    </tr>
  )
}

function Row({
  entry,
  index,
  indent,
}: {
  entry?: DirectoryEntry
  index: number
  indent?: boolean
}) {
  return (
    <tr className={index % 2 === 1 ? "bg-[#f2f2f2]" : "bg-white"}>
      <td className={`${ROW} ${indent ? "pl-[5mm]" : ""}`}>{entry?.fullName ?? " "}</td>
      <td className={`${ROW} w-[24mm] whitespace-nowrap text-right font-bold tabular-nums`}>
        {entry?.localNo ?? ""}
      </td>
    </tr>
  )
}

function TableHeading({ label }: { label: string }) {
  return (
    <thead>
      <tr>
        <th
          colSpan={2}
          className="h-[6.5mm] border border-[#9db3d1] text-center text-[11pt] font-bold tracking-wide text-white"
          style={{ backgroundColor: NAVY }}
        >
          {label}
        </th>
      </tr>
    </thead>
  )
}

/**
 * A4 print layout of the whole directory, modelled on the FGHPC telephone
 * directory sheet. Hidden on screen; shown only when printing (the rest of the
 * app is hidden with `print:hidden`).
 */
export function PrintDirectory({
  entries,
  updatedAt,
  isStale,
  isSample,
}: {
  entries: DirectoryEntry[]
  updatedAt?: string
  isStale?: boolean
  isSample?: boolean
}) {
  const individuals = entries
    .filter((e) => e.category === "Individual")
    .sort((a, b) => a.fullName.localeCompare(b.fullName))

  const offices = entries.filter((e) => e.category !== "Individual")
  const known = new Set(SECTIONS.map((s) => s.name.toLowerCase()))
  const others = offices.filter((e) => !known.has(e.section.trim().toLowerCase()))
  const otherPadding = Math.max(0, OTHERS_MIN_ROWS - others.length)

  return (
    <div className="hidden bg-white text-[9.5pt] leading-tight text-black print:block">
      <header className="mb-[2.5mm] text-center">
        <h1
          className="py-[2mm] text-[19pt] font-bold tracking-wide text-white"
          style={{ backgroundColor: NAVY }}
        >
          FGHPC TELEPHONE DIRECTORY
        </h1>
        <p className="bg-[#2e5f8a] py-[1mm] text-[9pt] text-white">
          As of {formatAsOf(updatedAt)}
        </p>
        <p
          className="mt-[2mm] bg-[#dce6f1] py-[2mm] text-[10.5pt] font-bold"
          style={{ color: NAVY }}
        >
          TRUNK LINES:&nbsp;&nbsp;
          {TRUNK_LINES.map((t, i) => (
            <span key={t.tel}>
              {i > 0 && <span className="mx-[3mm]">•</span>}
              {t.display}
            </span>
          ))}
        </p>
        {(isStale || isSample) && (
          <p className="mt-[1.5mm] text-[8pt] font-bold">
            {isSample
              ? "Note: sample data — the live directory could not be reached."
              : "Note: offline copy — may not be the latest directory."}
          </p>
        )}
      </header>

      <div className="grid grid-cols-[1fr_1.2fr] items-start gap-[3mm]">
        <table className="w-full border-collapse">
          <TableHeading label="INDIVIDUALS" />
          <tbody>
            {individuals.map((e, i) => (
              <Row key={e.id} entry={e} index={i} />
            ))}
          </tbody>
        </table>

        <table className="w-full border-collapse">
          <TableHeading label="OFFICE / AREA" />
          <tbody>
            {SECTIONS.map((s) => {
              const rows = offices.filter(
                (e) => e.section.trim().toLowerCase() === s.name.toLowerCase(),
              )
              if (rows.length === 0) return null
              return [
                <Band key={s.name} label={s.name} color={s.color} />,
                ...rows.map((e, i) => <Row key={e.id} entry={e} index={i} indent />),
              ]
            })}
            <Band label="OTHERS" color={OTHERS_COLOR} />
            {others.map((e, i) => (
              <Row key={e.id} entry={e} index={i} indent />
            ))}
            {Array.from({ length: otherPadding }, (_, i) => (
              <Row key={`blank-${i}`} index={others.length + i} indent />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-[3mm] text-[8pt] italic text-[#595959]">
        <p>* {DIAL_NOTES[0]}</p>
        <p>** {DIAL_NOTES[1]}</p>
      </footer>
    </div>
  )
}
