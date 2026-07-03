import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'
import ManaBar from '@/components/ui/ManaBar'
import ProfileForm from './ProfileForm'
import { ArrowLeft, ScrollText, User } from 'lucide-react'

export const metadata = { title: 'Isek.AI — Perfil do Herói' }

interface ManaTransaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  created_at: string
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, mana_balance, created_at')
    .eq('id', user.id)
    .single()

  const { data: transactions } = await supabase
    .from('mana_transactions')
    .select('id, amount, type, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { count: storyCount } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const username = profile?.username ?? user.email?.split('@')[0] ?? 'Herói'
  const manaBalance = profile?.mana_balance ?? 0
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null

  return (
    <>
      <Navbar username={username} manaBalance={manaBalance} />

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-mana-500 hover:text-mana-300 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Voltar ao Painel
        </Link>

        {/* Profile card */}
        <section className="card-void p-8">
          <p className="text-xs font-bold text-mana-600 uppercase tracking-widest mb-1">
            <User size={12} className="inline mr-1" />
            Ficha do Herói
          </p>
          <h1 className="font-display text-3xl font-black text-white">
            <span className="text-gradient-mana">{username}</span>
          </h1>
          <div className="mt-3 space-y-1 text-sm text-mana-400">
            <p>📧 {user.email}</p>
            {memberSince && <p>🗓️ Herói desde {memberSince}</p>}
            <p>📖 {storyCount ?? 0} {storyCount === 1 ? 'história gerada' : 'histórias geradas'}</p>
          </div>
          <div className="mt-6 max-w-sm">
            <ManaBar balance={manaBalance} max={100} size="lg" />
          </div>
        </section>

        {/* Edit username */}
        <section className="card-void p-8">
          <h2 className="font-display text-lg font-bold text-white mb-4">
            ✏️ Alterar Nome do Herói
          </h2>
          <ProfileForm userId={user.id} currentUsername={profile?.username ?? null} />
        </section>

        {/* Mana transactions */}
        <section className="card-void p-8">
          <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ScrollText size={18} className="text-mana-500" />
            Histórico de Mana
          </h2>

          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-mana-600">Nenhuma transação registrada ainda.</p>
          ) : (
            <ul className="divide-y divide-mana-800/30">
              {(transactions as ManaTransaction[]).map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{tx.description}</p>
                    <p className="text-xs text-mana-700">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'credit' ? `+${tx.amount}` : tx.amount} Mana
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
