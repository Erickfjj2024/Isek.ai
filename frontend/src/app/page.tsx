import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-mana-800/30">
        <span className="font-display text-2xl font-bold text-gradient-mana">
          Isek.AI
        </span>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="btn-ghost text-sm py-2">
            Entrar
          </Link>
          <Link href="/auth?tab=register" className="btn-mana text-sm py-2">
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-4 inline-block rounded-full border border-mana-600/40 bg-mana-900/30 px-4 py-1.5 text-xs font-semibold text-mana-300 uppercase tracking-widest">
          ✨ Powered by AI · Gamificado
        </div>

        <h1 className="font-display text-5xl font-black leading-tight text-white md:text-7xl">
          Seus estudos viram{' '}
          <span className="text-gradient-mana">uma aventura épica</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-mana-200/70">
          Cole o texto da sua matéria ou faça upload do PDF. O Isek.AI transforma em uma
          história de Anime onde <strong className="text-white">você é o herói</strong>.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/auth?tab=register" className="btn-mana text-base px-8 py-4">
            🗡️ Iniciar Jornada — Grátis
          </Link>
          <Link href="#como-funciona" className="btn-ghost text-base px-8 py-4">
            Ver como funciona
          </Link>
        </div>

        {/* Mana preview badge */}
        <div className="mt-8 flex items-center gap-2 text-sm text-mana-400">
          <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
          100 Mana de boas-vindas · Sem cartão de crédito
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="px-6 py-20">
        <h2 className="text-center font-display text-3xl font-bold text-white mb-12">
          Como funciona
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              icon: '📄',
              title: 'Envie o conteúdo',
              desc: 'Cole o texto da matéria ou faça upload do PDF diretamente.',
            },
            {
              step: '02',
              icon: '⚡',
              title: 'IA processa',
              desc: 'Nosso motor de IA constrói um prompt épico e gera sua história Isekai.',
            },
            {
              step: '03',
              icon: '📖',
              title: 'Aprenda jogando',
              desc: 'Leia a história onde você é o herói — o conteúdo fica gravado na memória.',
            },
          ].map((item) => (
            <div key={item.step} className="card-void-hover p-6">
              <div className="mb-3 text-3xl">{item.icon}</div>
              <div className="mb-1 text-xs font-bold text-mana-500 tracking-widest">
                PASSO {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-mana-200/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-mana-800/30 px-6 py-6 text-center text-xs text-mana-600">
        © 2026 Isek.AI · Transformando estudantes em heróis
      </footer>
    </main>
  )
}
