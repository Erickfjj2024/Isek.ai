import { Suspense } from 'react'
import AuthForm from './AuthForm'

export const metadata = {
  title: 'Isek.AI — Entrar no Mundo',
}

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      {/* Decorative RPG frame corners */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-4 hidden md:block">
        <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-mana-600/40 rounded-tl-lg" />
        <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-mana-600/40 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-mana-600/40 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-mana-600/40 rounded-br-lg" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-black text-gradient-mana">
            Isek.AI
          </h1>
          <p className="mt-2 text-sm text-mana-400">
            ⚔️ Sua jornada épica começa aqui
          </p>
        </div>

        <Suspense fallback={<div className="card-void p-8 animate-pulse h-96" />}>
          <AuthForm />
        </Suspense>

        {/* Bottom label */}
        <p className="mt-6 text-center text-xs text-mana-700">
          Ao entrar, você concorda com os Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </main>
  )
}
