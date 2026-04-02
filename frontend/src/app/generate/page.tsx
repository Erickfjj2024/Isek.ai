import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'
import GenerateForm from './GenerateForm'

export const metadata = { title: 'Isek.AI — Gerar História' }

export default async function GeneratePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, mana_balance')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? user.email?.split('@')[0] ?? 'Herói'
  const manaBalance = profile?.mana_balance ?? 0

  return (
    <>
      <Navbar username={username} manaBalance={manaBalance} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold text-mana-600 uppercase tracking-widest mb-2">
            ⚡ Criação de Missão
          </p>
          <h1 className="font-display text-3xl font-black text-white">
            Transformar em <span className="text-gradient-mana">Aventura</span>
          </h1>
          <p className="mt-2 text-sm text-mana-400">
            Cole o texto da sua matéria ou faça upload do PDF. Custo: <strong className="text-mana-300">10 Mana</strong>.
          </p>
        </div>

        <GenerateForm manaBalance={manaBalance} />
      </main>
    </>
  )
}
