'use client'

import { cn } from '@/lib/utils'

interface ManaBarProps {
  balance: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ManaBar({
  balance,
  max = 100,
  showLabel = true,
  size = 'md',
  className,
}: ManaBarProps) {
  const pct = Math.min(100, Math.max(0, (balance / max) * 100))

  const danger = pct <= 20
  const low    = pct <= 50 && pct > 20

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-mana-400 uppercase tracking-wider">
            🔮 Mana
          </span>
          <span
            className={cn(
              'font-bold tabular-nums',
              danger ? 'text-red-400' : low ? 'text-yellow-400' : 'text-mana-300',
            )}
          >
            {balance.toLocaleString('pt-BR')}
          </span>
        </div>
      )}

      <div
        className={cn(
          'mana-bar-track',
          size === 'sm' && 'h-1.5',
          size === 'md' && 'h-2',
          size === 'lg' && 'h-3',
        )}
      >
        <div
          className={cn(
            'mana-bar-fill',
            danger && 'bg-gradient-to-r from-red-700 to-red-500',
            low    && 'bg-gradient-to-r from-yellow-700 to-yellow-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
