'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'login' | 'register'

export default function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login'

  const [tab, setTab] = useState<Tab>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
          },
        })
        if (error) throw error
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.'
      setError(translateError(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-void overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-mana-800/40">
        {(['login', 'register'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); setSuccess(null) }}
            className={cn(
              'flex-1 py-3.5 text-sm font-semibold transition-all duration-200',
              tab === t
                ? 'text-white border-b-2 border-mana-500 bg-mana-900/20'
                : 'text-mana-500 hover:text-mana-300',
            )}
          >
            {t === 'login' ? '⚔️ Entrar' : '✨ Criar Conta'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        {/* Status label */}
        <div className="text-center">
          <span className="text-xs font-bold text-mana-600 uppercase tracking-widest">
            {tab === 'login' ? '— Painel de Status —' : '— Criar Herói —'}
          </span>
        </div>

        {/* Username (register only) */}
        {tab === 'register' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
              Nome do Herói
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="SeuNomeEpico"
              className="input-rpg"
              autoComplete="username"
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="heroi@mundo.com"
            required
            className="input-rpg"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-mana-400 uppercase tracking-wider">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="input-rpg pr-10"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mana-600 hover:text-mana-400 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-neon-green/30 bg-green-950/30 px-4 py-3 text-sm text-green-400">
            ✅ {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-mana w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Invocando...</>
          ) : tab === 'login' ? (
            <><Sparkles size={16} /> Entrar no Mundo</>
          ) : (
            <><Sparkles size={16} /> Criar meu Herói</>
          )}
        </button>

        {/* Mana bonus hint for register */}
        {tab === 'register' && (
          <p className="text-center text-xs text-mana-600">
            🔮 Você receberá <span className="text-mana-400 font-bold">100 Mana</span> ao criar sua conta
          </p>
        )}
      </form>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be')) return 'A senha deve ter pelo menos 6 caracteres.'
  return msg
}
