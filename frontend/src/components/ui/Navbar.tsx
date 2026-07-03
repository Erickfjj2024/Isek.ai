'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ManaBar from './ManaBar'
import { LogOut, Swords, User } from 'lucide-react'

interface NavbarProps {
  username?: string | null
  manaBalance?: number
}

export default function Navbar({ username, manaBalance = 0 }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-mana-800/30 bg-void-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="font-display text-xl font-bold text-gradient-mana">
          Isek.AI
        </Link>

        {/* Center: Mana bar */}
        <div className="hidden w-48 sm:block">
          <ManaBar balance={manaBalance} max={100} size="sm" />
        </div>

        {/* Right: user info + actions */}
        <div className="flex items-center gap-3">
          {/* Generate CTA */}
          <Link href="/generate" className="btn-mana py-2 px-4 text-sm flex items-center gap-1.5">
            <Swords size={14} />
            <span className="hidden sm:inline">Gerar História</span>
          </Link>

          {/* Username → profile */}
          {username && (
            <Link
              href="/profile"
              className="hidden items-center gap-1.5 text-xs text-mana-500 hover:text-mana-300 transition-colors md:flex"
              title="Perfil do Herói"
            >
              <User size={14} />
              {username}
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 text-mana-600 hover:bg-mana-900/40 hover:text-mana-400 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
