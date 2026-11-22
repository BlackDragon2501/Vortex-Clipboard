'use client'

// Vórtex Clipboard - historial de lo que copias + snippets para pegar rápido.
// Captura con Ctrl+V en la página o con la Clipboard API (con tu permiso).
// Todo se guarda local en el navegador. Gratis, sin anuncios, sin nube.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ClipboardList,
  Sparkles,
  Search,
  Copy,
  Check,
  Pin,
  PinOff,
  Trash2,
  X,
  Plus,
  Pencil,
  Star,
  ClipboardPaste,
  Keyboard,
  History,
  Save,
} from 'lucide-react'
import {
  ClipItem,
  Snippet,
  SNIPPET_COLORS,
  HISTORY_LIMIT,
  loadHistory,
  saveHistory,
  loadSnippets,
  saveSnippets,
  newId,
  relativeTime,
  previewText,
  copyToClipboard,
  readClipboard,
} from '@/lib/clipboard'

type Tab = 'historial' | 'snippets'

function VortexLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="10" fill="#161616" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="#84cc16" strokeWidth="3.5" />
      <path d="M24 10a14 14 0 1 1-9.9 4.1" fill="none" stroke="#a3e635" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 17a7 7 0 1 0 7 7" fill="none" stroke="#a3e635" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="3" fill="#a3e635" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-[#2b2b31] bg-[#141416] px-6 py-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 text-center">
        <p className="text-[11px] text-[#9b9ba4]">
          Vórtex Clipboard · Derechos Reservados © 2026 Vortex Company ·{' '}
          <a href="mailto:vortexmusic.soporte.app@gmail.com" className="text-[#a3e635] hover:underline">
            vortexmusic.soporte.app@gmail.com
          </a>
        </p>
        <p className="text-[11px] text-[#9b9ba4]">Gratis · Sin anuncios · 100% local en tu navegador</p>
      </div>
    </footer>
  )
}

const btnPrimary =
  'inline-flex items-center gap-1.5 rounded-lg bg-[#84cc16] px-3 py-1.5 text-xs font-semibold text-[#14200a] hover:bg-[#a3e635] transition-colors disabled:opacity-40 disabled:pointer-events-none'
const btnGhost =
  'inline-flex items-center gap-1.5 rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-2.5 py-1.5 text-xs text-[#ececf1] hover:border-[#a3e635]/60 hover:text-[#a3e635] transition-colors disabled:opacity-40 disabled:pointer-events-none'
const inputCls =
  'w-full rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2 text-sm text-[#ececf1] placeholder-[#6b6b75] outline-none focus:border-[#a3e635]/70'

export default function ClipboardApp() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<Tab>('historial')
  const [history, setHistory] = useState<ClipItem[]>([])
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [query, setQuery] = useState('')
  const [flash, setFlash] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [pasteTip, setPasteTip] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addText, setAddText] = useState('')

  const [snipForm, setSnipForm] = useState<{ id: string | null; title: string; text: string; color: number } | null>(null)

  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHistory(loadHistory())
    setSnippets(loadSnippets())
    setMounted(true)
  }, [])

  const showFlash = (msg: string) => {
    setFlash(msg)
    window.setTimeout(() => setFlash(''), 2200)
  }

  const addClip = useCallback((text: string) => {
    const t = (text || '').replace(/\r\n/g, '\n')
    if (!t.trim()) return
    setHistory((prev) => {
      if (prev.length > 0 && prev[0].text === t) return prev // dedupe consecutivo
      const pinned = prev.filter((p) => p.pinned)
      const rest = [{ id: newId(), text: t, pinned: false, createdAt: Date.now() }, ...prev.filter((p) => !p.pinned)]
      const limit = Math.max(HISTORY_LIMIT - pinned.length, 0)
      const merged = [...pinned, ...rest.slice(0, limit)]
      saveHistory(merged)
      return merged
    })
  }, [])

  // captura con Ctrl+V en la pagina (fuera de los inputs)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return
      const text = e.clipboardData?.getData('text')
      if (text && text.trim()) {
        e.preventDefault()
        addClip(text)
        showFlash('Capturado con Ctrl+V')
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [addClip])

  const captureClipboard = async () => {
    const text = await readClipboard()
    if (text === null) {
      setPasteTip('El navegador pidió permiso o lo rechazaste. Concede el permiso al portapapeles o usa Ctrl+V en esta página.')
      return
    }
    if (!text.trim()) {
      setPasteTip('El portapapeles está vacío.')
      return
    }
    setPasteTip('')
    addClip(text)
    showFlash('Portapapeles capturado')
  }

  const addManual = () => {
    if (!addText.trim()) return
    addClip(addText)
    setAddText('')
    setAddOpen(false)
    showFlash('Texto añadido al historial')
  }

  const copyItem = async (text: string, id: string) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 1200)
      showFlash('Copiado al portapapeles')
    } else {
      showFlash('No se pudo copiar')
    }
  }

  const togglePin = (item: ClipItem) => {
    setHistory((prev) => {
      const next = prev.map((p) => (p.id === item.id ? { ...p, pinned: !p.pinned } : p))
      const sorted = [...next.filter((p) => p.pinned), ...next.filter((p) => !p.pinned)]
      saveHistory(sorted)
      return sorted
    })
  }

  const removeItem = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((p) => p.id !== id)
      saveHistory(next)
      return next
    })
  }

  const clearHistory = () => {
    const pinnedCount = history.filter((p) => p.pinned).length
    const msg = pinnedCount > 0 ? `¿Vaciar el historial? Se conservarán ${pinnedCount} fijados.` : '¿Vaciar todo el historial?'
    if (!window.confirm(msg)) return
    setHistory((prev) => {
      const next = prev.filter((p) => p.pinned)
      saveHistory(next)
      return next
    })
    showFlash('Historial vaciado')
  }

  const saveSnippet = () => {
    if (!snipForm || !snipForm.text.trim()) return
    const item: Snippet = {
      id: snipForm.id || newId(),
      title: snipForm.title.trim() || snipForm.text.trim().split('\n')[0].slice(0, 40) || 'Snippet',
      text: snipForm.text,
      color: snipForm.color,
      createdAt: Date.now(),
    }
    setSnippets((prev) => {
      const next = snipForm.id ? prev.map((s) => (s.id === item.id ? item : s)) : [item, ...prev]
      saveSnippets(next)
      return next
    })
    setSnipForm(null)
    showFlash(snipForm.id ? 'Snippet actualizado' : 'Snippet guardado')
  }

  const removeSnippet = (id: string) => {
    setSnippets((prev) => {
      const next = prev.filter((s) => s.id !== id)
      saveSnippets(next)
      return next
    })
  }

  const fromHistoryToSnippet = (item: ClipItem) => {
    setTab('snippets')
    setSnipForm({ id: null, title: '', text: item.text, color: 0 })
  }

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase()
    return history.filter((p) => !q || p.text.toLowerCase().includes(q))
  }, [history, query])

  const filteredSnippets = useMemo(() => {
    const q = query.trim().toLowerCase()
    return snippets.filter((s) => !q || s.title.toLowerCase().includes(q) || s.text.toLowerCase().includes(q))
  }, [snippets, query])

  const totalChars = history.reduce((acc, p) => acc + p.text.length, 0)

  if (!mounted) {
    return <div className="min-h-screen bg-[#0f0f10]" />
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f10] text-[#ececf1]">
      <header className="sticky top-0 z-20 border-b border-[#2b2b31] bg-[#141416]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <VortexLogo className="h-7 w-7 shrink-0" />
          <h1 className="truncate text-sm font-semibold">
            Vórtex <span className="text-[#a3e635]">Clipboard</span>
          </h1>
          <div className="relative ml-auto w-40 sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b75]" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'historial' ? 'Buscar en el historial…' : 'Buscar snippets…'}
              className={inputCls + ' py-1.5 pl-8 text-xs'}
              aria-label="Buscar"
            />
          </div>
        </div>
        {flash && (
          <div className="pointer-events-none absolute inset-x-0 top-full mt-1 flex justify-center">
            <span className="rounded-full border border-[#a3e635]/40 bg-[#0f0f10] px-3 py-1 text-[11px] text-[#a3e635] shadow-lg">
              {flash}
            </span>
          </div>
        )}
      </header>

      <main ref={mainRef} className="mx-auto w-full max-w-5xl flex-1 px-4 py-5" tabIndex={-1}>
        {/* pestañas */}
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#2b2b31] bg-[#17171a] p-1">
            <button
              type="button"
              onClick={() => setTab('historial')}
              className={
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ' +
                (tab === 'historial' ? 'bg-[#a3e635]/15 text-[#a3e635]' : 'text-[#9b9ba4] hover:text-[#ececf1]')
              }
            >
              <History className="h-3.5 w-3.5" aria-hidden /> Historial
            </button>
            <button
              type="button"
              onClick={() => setTab('snippets')}
              className={
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ' +
                (tab === 'snippets' ? 'bg-[#a3e635]/15 text-[#a3e635]' : 'text-[#9b9ba4] hover:text-[#ececf1]')
              }
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Snippets
            </button>
          </div>
          <span className="ml-auto hidden text-[11px] text-[#6b6b75] sm:block">
            {history.length} en historial · {snippets.length} snippets · {totalChars.toLocaleString('es')} caracteres
          </span>
        </div>

        {/* barra de captura */}
        {tab === 'historial' && (
          <div className="mb-4 rounded-xl border border-[#2b2b31] bg-[#17171a] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#9b9ba4]">
                <Keyboard className="h-3.5 w-3.5" aria-hidden /> Pulsa <kbd className="rounded border border-[#3a3a42] bg-[#1e1e22] px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
                +<kbd className="rounded border border-[#3a3a42] bg-[#1e1e22] px-1.5 py-0.5 text-[10px]">V</kbd> aquí para capturar
              </span>
              <button type="button" onClick={captureClipboard} className={btnGhost}>
                <ClipboardPaste className="h-3.5 w-3.5" aria-hidden /> Leer portapapeles
              </button>
              <button type="button" onClick={() => setAddOpen(!addOpen)} className={btnGhost}>
                {addOpen ? <X className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />} Añadir texto
              </button>
              <button
                type="button"
                onClick={clearHistory}
                className={btnGhost + ' ml-auto hover:border-red-500/60 hover:text-red-400'}
                disabled={history.length === 0}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Vaciar
              </button>
            </div>
            {addOpen && (
              <div className="mt-3">
                <textarea
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="Pega o escribe el texto a guardar…"
                  className={inputCls + ' min-h-[5rem] resize-y'}
                  aria-label="Texto nuevo"
                />
                <button type="button" onClick={addManual} className={btnPrimary + ' mt-2'} disabled={!addText.trim()}>
                  <Save className="h-3.5 w-3.5" aria-hidden /> Guardar en historial
                </button>
              </div>
            )}
            {pasteTip && <p className="mt-2 text-[11px] text-amber-400">{pasteTip}</p>}
          </div>
        )}

        {/* ============ HISTORIAL ============ */}
        {tab === 'historial' && (
          <section aria-label="Historial del portapapeles">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2b2b31] p-10 text-center text-sm text-[#6b6b75]">
                <ClipboardList className="mb-2 h-8 w-8 text-[#a3e635]/60" aria-hidden />
                {history.length === 0
                  ? 'Copia algo en tu sistema y pulsa Ctrl+V aquí, o usa “Leer portapapeles”.'
                  : 'Sin resultados para tu búsqueda.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((item) => (
                  <article
                    key={item.id}
                    className={
                      'rounded-xl border bg-[#17171a] p-3 transition-colors ' +
                      (item.pinned ? 'border-[#a3e635]/50' : 'border-[#2b2b31] hover:border-[#3a3a42]')
                    }
                  >
                    <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-[#ececf1]">
                      {previewText(item.text, 400)}
                    </pre>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#6b6b75]">
                        {relativeTime(item.createdAt)} · {item.text.length.toLocaleString('es')} caracteres
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <button type="button" onClick={() => copyItem(item.text, item.id)} className={btnGhost + ' px-2'} title="Copiar" aria-label="Copiar al portapapeles">
                          {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePin(item)}
                          className={btnGhost + ' px-2'}
                          title={item.pinned ? 'Desfijar' : 'Fijar (no se borra al vaciar)'}
                          aria-label={item.pinned ? 'Desfijar' : 'Fijar'}
                        >
                          {item.pinned ? <PinOff className="h-3.5 w-3.5 text-[#a3e635]" aria-hidden /> : <Pin className="h-3.5 w-3.5" aria-hidden />}
                        </button>
                        <button type="button" onClick={() => fromHistoryToSnippet(item)} className={btnGhost + ' px-2'} title="Guardar como snippet" aria-label="Guardar como snippet">
                          <Star className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className={btnGhost + ' px-2 hover:border-red-500/60 hover:text-red-400'}
                          title="Borrar"
                          aria-label="Borrar del historial"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============ SNIPPETS ============ */}
        {tab === 'snippets' && (
          <section aria-label="Snippets de texto">
            <div className="mb-4">
              {snipForm ? (
                <div className="rounded-xl border border-[#2b2b31] bg-[#17171a] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{snipForm.id ? 'Editar snippet' : 'Nuevo snippet'}</h3>
                    <button type="button" onClick={() => setSnipForm(null)} className="text-[#6b6b75] hover:text-[#ececf1]" aria-label="Cancelar snippet">
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <input
                    value={snipForm.title}
                    onChange={(e) => setSnipForm({ ...snipForm, title: e.target.value })}
                    placeholder="Nombre (ej. Correo de soporte)"
                    className={inputCls + ' mt-3'}
                    aria-label="Nombre del snippet"
                  />
                  <textarea
                    value={snipForm.text}
                    onChange={(e) => setSnipForm({ ...snipForm, text: e.target.value })}
                    placeholder="El texto que usas todo el tiempo…"
                    className={inputCls + ' mt-2 min-h-[6rem] resize-y'}
                    aria-label="Texto del snippet"
                  />
                  <div className="mt-2 flex items-center gap-1.5">
                    {SNIPPET_COLORS.map((c, i) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSnipForm({ ...snipForm, color: i })}
                        aria-label={'Color ' + (i + 1)}
                        className={
                          'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ' +
                          (snipForm.color === i ? 'border-white' : 'border-transparent')
                        }
                        style={{ background: c }}
                      />
                    ))}
                    <button type="button" onClick={saveSnippet} className={btnPrimary + ' ml-auto'} disabled={!snipForm.text.trim()}>
                      <Save className="h-3.5 w-3.5" aria-hidden /> Guardar snippet
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSnipForm({ id: null, title: '', text: '', color: 0 })}
                  className={btnPrimary}
                >
                  <Plus className="h-4 w-4" aria-hidden /> Nuevo snippet
                </button>
              )}
            </div>

            {filteredSnippets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2b2b31] p-10 text-center text-sm text-[#6b6b75]">
                <Sparkles className="mb-2 h-8 w-8 text-[#a3e635]/60" aria-hidden />
                {snippets.length === 0
                  ? 'Guarda aquí los textos que usas a diario: tu correo, dirección, respuestas típicas…'
                  : 'Sin resultados para tu búsqueda.'}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredSnippets.map((s) => (
                  <article
                    key={s.id}
                    className="cursor-pointer rounded-xl border border-[#2b2b31] bg-[#17171a] p-4 transition-colors hover:border-[#a3e635]/60"
                    onClick={() => copyItem(s.text, s.id)}
                    title="Clic para copiar"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: SNIPPET_COLORS[s.color % SNIPPET_COLORS.length] }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium">{s.title}</h3>
                        <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-xs text-[#9b9ba4]">{previewText(s.text, 160)}</p>
                      </div>
                      {copiedId === s.id && <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />}
                    </div>
                    <div className="mt-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => copyItem(s.text, s.id)} className={btnGhost + ' px-2'} title="Copiar" aria-label={'Copiar ' + s.title}>
                        {copiedId === s.id ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSnipForm({ id: s.id, title: s.title, text: s.text, color: s.color })}
                        className={btnGhost + ' px-2'}
                        title="Editar"
                        aria-label="Editar snippet"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSnippet(s.id)}
                        className={btnGhost + ' px-2 hover:border-red-500/60 hover:text-red-400'}
                        title="Borrar"
                        aria-label="Borrar snippet"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <span className="ml-auto text-[10px] text-[#6b6b75]">{s.text.length.toLocaleString('es')} car.</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
