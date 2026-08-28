import { useEffect, useMemo, useState } from "react"
import {
  Copy,
  Check,
  Moon,
  Phone,
  RefreshCw,
  Search,
  Sun,
  TriangleAlert,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchDirectory, type FetchResult } from "@/lib/api"
import type { DirectoryEntry } from "@/lib/types"

const SECTION_ORDER = ["Housing Compound", "CHEP", "MHEP", "PHEP"]

type CategoryTab = "all" | "individuals" | "offices"

function isDialable(localNo: string) {
  return /^\d+$/.test(localNo.trim())
}

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("fghpc-theme")
      if (stored) return stored === "dark"
    } catch {
      // ignore
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("fghpc-theme", dark ? "dark" : "light")
    } catch {
      // ignore
    }
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}

function LocalNoCell({ localNo }: { localNo: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(localNo)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — nothing to do
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {isDialable(localNo) ? (
        <a
          href={`tel:${localNo}`}
          className="font-mono text-base font-semibold tabular-nums text-primary hover:underline"
          title={`Dial ${localNo}`}
        >
          {localNo}
        </a>
      ) : (
        <span className="font-mono text-base font-semibold tabular-nums">
          {localNo}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground"
        onClick={copy}
        aria-label={`Copy extension ${localNo}`}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </span>
  )
}

function SectionBadge({ entry }: { entry: DirectoryEntry }) {
  if (entry.category === "Individual") {
    return <Badge variant="secondary">Individual</Badge>
  }
  return <Badge variant="outline">{entry.section || "Office/Area"}</Badge>
}

function EntryTable({ entries }: { entries: DirectoryEntry[] }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name / Location</TableHead>
            <TableHead>Section</TableHead>
            <TableHead className="text-right">Local No.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">{e.fullName}</TableCell>
              <TableCell>
                <SectionBadge entry={e} />
              </TableCell>
              <TableCell className="text-right">
                <LocalNoCell localNo={e.localNo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function EntryCards({ entries }: { entries: DirectoryEntry[] }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {entries.map((e) => (
        <Card key={e.id} className="py-3">
          <CardContent className="flex items-center justify-between gap-3 px-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{e.fullName}</p>
              <div className="mt-1">
                <SectionBadge entry={e} />
              </div>
            </div>
            <LocalNoCell localNo={e.localNo} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}

export default function App() {
  const { dark, toggle } = useTheme()
  const [result, setResult] = useState<FetchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<CategoryTab>("all")
  const [section, setSection] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchDirectory()
      .then(setResult)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const entries = result?.payload.entries ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      if (tab === "individuals" && e.category !== "Individual") return false
      if (tab === "offices" && e.category !== "Office/Area") return false
      if (tab === "offices" && section && e.section !== section) return false
      if (!q) return true
      return (
        e.fullName.toLowerCase().includes(q) ||
        e.section.toLowerCase().includes(q) ||
        e.localNo.toLowerCase().includes(q)
      )
    })
  }, [entries, query, tab, section])

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Phone className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                FGHPC Local Directory
              </h1>
              <p className="text-sm text-muted-foreground">
                Phone extensions — individuals, offices &amp; areas
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {result?.isSample && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            <TriangleAlert className="size-4 shrink-0" />
            Showing bundled sample data — the live API could not be reached.
          </div>
        )}
        {result?.isStale && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            <TriangleAlert className="size-4 shrink-0" />
            Offline — showing the last saved copy of the directory.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, office, or extension…"
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as CategoryTab)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="individuals">Individuals</TabsTrigger>
                <TabsTrigger value="offices">Offices &amp; Areas</TabsTrigger>
              </TabsList>
            </Tabs>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                {filtered.length} of {entries.length} entries
              </p>
            )}
          </div>

          {tab === "offices" && (
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={section === null ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => setSection(null)}
              >
                All sections
              </Button>
              {SECTION_ORDER.map((s) => (
                <Button
                  key={s}
                  variant={section === s ? "default" : "outline"}
                  size="sm"
                  className="h-7 rounded-full px-3 text-xs"
                  onClick={() => setSection(section === s ? null : s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-center">
              <TriangleAlert className="size-8 text-destructive" />
              <div>
                <p className="font-medium">Couldn't load the directory</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={load}>
                <RefreshCw className="size-4" /> Try again
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border py-12 text-center text-muted-foreground">
              No entries match “{query}”.
            </div>
          ) : (
            <>
              <EntryTable entries={filtered} />
              <EntryCards entries={filtered} />
            </>
          )}
        </div>

        {result?.payload.updatedAt && (
          <footer className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
            First Gen Hydro Power Corporation — directory last updated{" "}
            {result.payload.updatedAt}
          </footer>
        )}
      </main>
    </div>
  )
}
