import type { DirectoryPayload } from "./types"
import { SAMPLE_PAYLOAD } from "./sample-data"

const API_URL = import.meta.env.VITE_API_URL as string | undefined
const STORAGE_KEY = "fghpc-directory-cache-v1"

export interface FetchResult {
  payload: DirectoryPayload
  /** true when the data came from the bundled dev sample, not the live API */
  isSample: boolean
  /** true when the data came from localStorage because the network failed */
  isStale: boolean
}

export async function fetchDirectory(): Promise<FetchResult> {
  if (!API_URL) {
    return { payload: SAMPLE_PAYLOAD, isSample: true, isStale: false }
  }

  try {
    const res = await fetch(API_URL, { redirect: "follow" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const payload = (await res.json()) as DirectoryPayload
    if (!payload.ok || !Array.isArray(payload.entries)) {
      throw new Error(payload.error ?? "API returned an error")
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // storage unavailable (private mode etc.) — not a problem
    }
    return { payload, isSample: false, isStale: false }
  } catch (err) {
    // Network/auth failure: fall back to the last good payload if we have one,
    // then to the bundled sample in dev builds so the UI stays usable.
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        return {
          payload: JSON.parse(cached) as DirectoryPayload,
          isSample: false,
          isStale: true,
        }
      }
    } catch {
      // fall through
    }
    if (import.meta.env.DEV) {
      return { payload: SAMPLE_PAYLOAD, isSample: true, isStale: false }
    }
    throw err
  }
}
