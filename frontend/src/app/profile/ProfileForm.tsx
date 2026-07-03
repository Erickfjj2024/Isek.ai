'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2 } from 'lucide-react'

interface ProfileFormProps {
  userId: string
  currentUsername: string | null
}

export default function ProfileForm({ userId, currentUsername }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [username, setUsername] = useState(currentUsername ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const trimmed = username.trim()
    if (trimmed.length < 3 || trimmed.length > 30) {
      setError('O nome deve ter entre 3 e 30 caracteres.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', userId)
    setLoading(false)

    if (updateError) {
      setError(
        updateError.code === '23505'
          ? 'Este nome já está em uso por outro herói.'
          : 'Não foi possível salvar. Tente novamente.',
      )
      return
    }

    setSuccess(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
          Nome do Herói
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setSuccess(false) }}
          placeholder="SeuNomeEpico"
          className="input-rpg"
          autoComplete="username"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-neon-green/30 bg-green-950/30 px-4 py-3 text-sm text-green-400">
          ✅ Nome atualizado com sucesso!
        </div>
      )}

      <button
        type="submit"
        disabled={loading || username.trim() === (currentUsername ?? '')}
        className="btn-mana flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Salvando...</>
        ) : (
          <><Check size={16} /> Salvar</>
        )}
      </button>
    </form>
  )
}
