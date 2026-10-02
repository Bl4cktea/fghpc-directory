import type { DirectoryEntry } from "@/lib/types"

const SECTION_ORDER = ["Housing Compound", "CHEP", "MHEP", "PHEP"]
const NAME_SUFFIXES = new Set(["jr", "jr.", "sr", "sr.", "ii", "iii", "iv"])

/** Sort key: last name (ignoring Jr./Sr./II...), then the full name. */
function lastNameKey(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  while (parts.length > 1 && NAME_SUFFIXES.has(parts[parts.length - 1].toLowerCase())) {
    parts.pop()
  }
  return `${parts[parts.length - 1] ?? ""} ${fullName}`.toLowerCase()
}

function Group({ title, entries }: { title: string; entries: DirectoryEntry[] }) {
  if (entries.length === 0) return null
  return (
    <section className="mb-4">
      <h2 className="break-after-avoid border-b border-black pb-0.5 text-[10pt] font-bold uppercase tracking-wide">
        {title}
      </h2>
      <table className="w-full border-collapse text-[9.5pt] leading-tight">
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="break-inside-avoid border-b border-gray-300">
              <td className="py-[3px] pr-2">{e.fullName}</td>
              <td className="py-[3px] text-right font-bold tabular-nums">{e.localNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/**
 * A4 print layout of the whole directory. Hidden on screen; shown only when
 * printing (the rest of the app is hidden with `print:hidden`).
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
    .sort((a, b) => lastNameKey(a.fullName).localeCompare(lastNameKey(b.fullName)))

  const offices = entries.filter((e) => e.category !== "Individual")
  const known = new Set(SECTION_ORDER)
  const otherOffices = offices.filter((e) => !known.has(e.section))

  const printedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="hidden bg-white text-black print:block">
      <header className="mb-4 border-b-2 border-black pb-2">
        <h1 className="text-[16pt] font-bold leading-tight">
          First Gen Hydro Power Corporation
        </h1>
        <p className="text-[11pt] font-semibold">Local Directory</p>
        <p className="mt-1 text-[8.5pt]">
          {updatedAt ? `Directory last updated ${updatedAt} · ` : ""}Printed on {printedOn}
        </p>
        {(isStale || isSample) && (
          <p className="mt-1 text-[8.5pt] font-bold">
            {isSample
              ? "Note: sample data — live directory could not be reached."
              : "Note: offline copy — may not be the latest directory."}
          </p>
        )}
      </header>

      <div className="columns-2 gap-8">
        <Group title="Individuals" entries={individuals} />
        {SECTION_ORDER.map((s) => (
          <Group
            key={s}
            title={`${s} — Offices & Areas`}
            entries={offices.filter((e) => e.section === s)}
          />
        ))}
        <Group title="Other Offices & Areas" entries={otherOffices} />
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-gray-400 pt-1 text-center text-[8pt]">
        FGHPC Local Directory · Printed on {printedOn}
      </footer>
    </div>
  )
}
