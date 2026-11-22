// Vórtex Clipboard - historial de portapapeles y snippets, 100% local.

export interface ClipItem {
  id: string
  text: string
  pinned: boolean
  createdAt: number
}

export interface Snippet {
  id: string
  title: string
  text: string
  color: number
  createdAt: number
}

export const HISTORY_LIMIT = 300

export const SNIPPET_COLORS = [
  '#a3e635', '#38bdf8', '#e879f9', '#fbbf24',
  '#f87171', '#34d399', '#a78bfa', '#fb923c',
]

const KEY_HISTORY = 'vortex-clip-history-v1'
const KEY_SNIPPETS = 'vortex-clip-snippets-v1'

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLS(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // almacenamiento no disponible
  }
}

export function loadHistory(): ClipItem[] {
  return readLS<ClipItem[]>(KEY_HISTORY, [])
}

export function saveHistory(items: ClipItem[]) {
  writeLS(KEY_HISTORY, items)
}

export function loadSnippets(): Snippet[] {
  return readLS<Snippet[]>(KEY_SNIPPETS, [])
}

export function saveSnippets(items: Snippet[]) {
  writeLS(KEY_SNIPPETS, items)
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export function relativeTime(ts: number): string {
  const diff = ts - Date.now()
  const min = Math.round(diff / 60_000)
  if (Math.abs(min) < 60) return rtf.format(min, 'minute')
  const hours = Math.round(diff / 3_600_000)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(diff / 86_400_000)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  return new Date(ts).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export function previewText(text: string, max = 220): string {
  const t = text.trim()
  return t.length > max ? t.slice(0, max) + '…' : t
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Lee el portapapeles con la API async (requiere permiso del usuario).
export async function readClipboard(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch {
    return null
  }
}
