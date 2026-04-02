'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BookOpen, Scroll } from 'lucide-react'

interface Props {
  content: string
}

export default function StoryViewer({ content }: Props) {
  const [view, setView] = useState<'story' | 'source'>('story')

  // Split into sections by ## heading
  const sections = content.split(/(?=^##\s)/m).filter(Boolean)

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="card-void p-1 flex gap-1 w-fit">
        {[
          { key: 'story', label: '📖 História', icon: BookOpen },
          { key: 'source', label: '📜 Original', icon: Scroll },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key as 'story' | 'source')}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
              view === key ? 'bg-mana-600 text-white' : 'text-mana-500 hover:text-mana-300',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'story' ? (
        <div className="space-y-4">
          {sections.map((section, i) => {
            const lines = section.split('\n')
            const heading = lines[0].replace(/^##\s*/, '')
            const body = lines.slice(1).join('\n').trim()
            const isGrimoire = heading.includes('Grimório')

            return (
              <div
                key={i}
                className={cn(
                  'card-void p-6',
                  isGrimoire && 'border-neon-gold/30 bg-yellow-950/10',
                )}
              >
                <h2
                  className={cn(
                    'font-display text-lg font-bold mb-4',
                    isGrimoire ? 'text-gradient-gold' : 'text-gradient-mana',
                  )}
                >
                  {heading}
                </h2>
                <div className="prose prose-invert prose-sm max-w-none">
                  {body.split('\n').map((line, j) => {
                    if (!line.trim()) return <br key={j} />
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <p key={j} className="text-mana-200/80 text-sm leading-relaxed pl-4 border-l-2 border-mana-700/40 my-1">
                          {line.replace(/^[-*]\s/, '')}
                        </p>
                      )
                    }
                    return (
                      <p key={j} className="text-mana-200/80 text-sm leading-relaxed mb-3">
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card-void p-6">
          <h2 className="font-display text-lg font-bold text-mana-400 mb-4">
            📜 Conteúdo Original
          </h2>
          <pre className="text-xs text-mana-300/60 whitespace-pre-wrap leading-relaxed font-mono">
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}
