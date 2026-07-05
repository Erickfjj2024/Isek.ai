'use client'

/**
 * Página temporária de diagnóstico do deploy.
 * Acesse /debug logado para testar token + backend direto do navegador
 * (funciona no celular). Remover depois que o deploy estiver estável.
 */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Result = {
  label: string
  ok: boolean | null
  detail: string
}

function decodeJwtPart(part: string): Record<string, unknown> {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

export default function DebugPage() {
  const [results, setResults] = useState<Result[]>([])
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function run() {
      const out: Result[] = []
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '(não definida)'

      out.push({
        label: 'NEXT_PUBLIC_API_URL embutida no site',
        ok: apiUrl.startsWith('https://'),
        detail: apiUrl,
      })

      // 1. Sessão
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session) {
        out.push({
          label: 'Sessão Supabase',
          ok: false,
          detail: 'Você não está logado. Faça login e abra /debug de novo.',
        })
        setResults(out)
        return
      }

      out.push({
        label: 'Sessão Supabase',
        ok: true,
        detail: `Logado como ${session.user.email}`,
      })

      // 2. Algoritmo de assinatura do token
      const accessToken = session.access_token
      setToken(accessToken)
      try {
        const header = decodeJwtPart(accessToken.split('.')[0])
        const payload = decodeJwtPart(accessToken.split('.')[1])
        const alg = String(header.alg)
        const expMs = Number(payload.exp) * 1000
        out.push({
          label: 'Assinatura do token (alg)',
          ok: alg === 'HS256',
          detail:
            alg === 'HS256'
              ? 'HS256 — compatível com o backend (validação via JWT Secret)'
              : `${alg} — INCOMPATÍVEL: o Supabase está usando o sistema novo de chaves. O backend precisa ser ajustado (ou o projeto Supabase migrado para Legacy JWT Secret).`,
        })
        out.push({
          label: 'Validade do token',
          ok: Date.now() < expMs,
          detail: `Expira em ${new Date(expMs).toLocaleString()}`,
        })
      } catch (e) {
        out.push({ label: 'Decodificação do token', ok: false, detail: String(e) })
      }

      // 3. Backend /health (sem auth)
      try {
        const r = await fetch(`${apiUrl}/health`)
        out.push({
          label: 'Backend /health + CORS',
          ok: r.ok,
          detail: `HTTP ${r.status} — ${await r.text()}`,
        })
      } catch (e) {
        out.push({
          label: 'Backend /health + CORS',
          ok: false,
          detail: `Failed to fetch (CORS ou backend fora do ar): ${String(e)}`,
        })
      }

      // 4. Backend autenticado
      try {
        const r = await fetch(`${apiUrl}/api/stories`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const body = await r.text()
        out.push({
          label: 'Backend autenticado (/api/stories)',
          ok: r.ok,
          detail: `HTTP ${r.status} — ${body.slice(0, 300)}`,
        })
      } catch (e) {
        out.push({
          label: 'Backend autenticado (/api/stories)',
          ok: false,
          detail: String(e),
        })
      }

      setResults(out)
    }
    run()
  }, [])

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm">
      <h1 className="mb-6 text-2xl font-bold">🔧 Diagnóstico do Deploy</h1>
      {results.length === 0 && <p>Rodando testes…</p>}
      <ul className="space-y-4">
        {results.map((r) => (
          <li key={r.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-semibold">
              {r.ok === null ? '⏳' : r.ok ? '✅' : '❌'} {r.label}
            </p>
            <p className="mt-1 break-all opacity-80">{r.detail}</p>
          </li>
        ))}
      </ul>
      {token && (
        <button
          className="mt-6 rounded-lg border border-white/20 px-4 py-2"
          onClick={() => {
            navigator.clipboard.writeText(token)
            setCopied(true)
          }}
        >
          {copied ? '✅ Token copiado!' : '📋 Copiar access token'}
        </button>
      )}
    </main>
  )
}
