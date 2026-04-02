'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, FileText, Loader2, Swords, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  'Biologia', 'Química', 'Física', 'Matemática',
  'História', 'Geografia', 'Português', 'Literatura',
  'Inglês', 'Filosofia', 'Sociologia', 'Outro',
]

interface Props {
  manaBalance: number
}

type InputMode = 'text' | 'pdf'

export default function GenerateForm({ manaBalance }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<InputMode>('text')
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const hasMana = manaBalance >= 10

  async function getAuthToken(): Promise<string> {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? ''
  }

  async function extractPdfText(file: File): Promise<string> {
    setLoadingMsg('Extraindo texto do PDF...')
    const form = new FormData()
    form.append('file', file)
    const token = await getAuthToken()
    const res = await fetch(`${API_URL}/api/extract-text`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? 'Erro ao extrair o PDF.')
    }
    const data = await res.json()
    return data.text
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hasMana) return
    setError(null)
    setLoading(true)

    try {
      let text = sourceText.trim()

      if (mode === 'pdf') {
        if (!pdfFile) throw new Error('Selecione um arquivo PDF.')
        text = await extractPdfText(pdfFile)
      }

      if (text.length < 50) throw new Error('O texto precisa ter pelo menos 50 caracteres.')

      setLoadingMsg('Invocando o mundo Isekai... ⚡')
      const token = await getAuthToken()
      const res = await fetch(`${API_URL}/api/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ source_text: text, subject, title: title || undefined }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail ?? 'Erro ao gerar a história.')
      }

      const story = await res.json()
      router.push(`/story/${story.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode toggle */}
      <div className="card-void p-1 flex gap-1">
        {(['text', 'pdf'] as InputMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
              mode === m ? 'bg-mana-600 text-white shadow-mana-sm' : 'text-mana-500 hover:text-mana-300',
            )}
          >
            {m === 'text' ? <><FileText size={14} /> Colar Texto</> : <><Upload size={14} /> Upload PDF</>}
          </button>
        ))}
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
          Matéria *
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="input-rpg"
        >
          <option value="">Selecione a matéria...</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Title (optional) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
          Título da Aventura <span className="text-mana-700 normal-case">(opcional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A Saga do Herói da Fotossíntese..."
          className="input-rpg"
          maxLength={150}
        />
      </div>

      {/* Content input */}
      {mode === 'text' ? (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
            Conteúdo Escolar *
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            required
            rows={10}
            maxLength={20000}
            placeholder="Cole aqui o texto da sua matéria, anotações de aula, capítulo do livro..."
            className="input-rpg resize-none leading-relaxed"
          />
          <p className="text-right text-xs text-mana-700">
            {sourceText.length.toLocaleString('pt-BR')} / 20.000 caracteres
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
            Arquivo PDF *
          </label>
          {pdfFile ? (
            <div className="card-void p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-mana-500" />
                <div>
                  <p className="text-sm font-semibold text-white">{pdfFile.name}</p>
                  <p className="text-xs text-mana-600">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="text-mana-600 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full card-void border-dashed p-8 text-center hover:border-mana-500/60 transition-all duration-200 cursor-pointer"
            >
              <Upload size={24} className="mx-auto mb-2 text-mana-600" />
              <p className="text-sm text-mana-500">Clique para selecionar o PDF</p>
              <p className="text-xs text-mana-700 mt-1">Máximo 10MB</p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Mana warning */}
      {!hasMana && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-400">
          ⚠️ Mana insuficiente. Você precisa de <strong>10 Mana</strong> para gerar uma história.
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !hasMana}
        className="btn-mana w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> {loadingMsg}</>
        ) : (
          <><Swords size={18} /> Invocar Aventura — 10 Mana</>
        )}
      </button>
    </form>
  )
}
