export default function VerdictDisplay({ verdict, topic, onReset }) {
  const { winner, winnerName } = verdict

  const config = {
    pro: {
      label: '賛成派の勝利！',
      name: winnerName,
      color: 'from-blue-600 to-blue-400',
      glow: 'shadow-blue-500/40',
      ring: 'ring-blue-400',
      bg: 'from-blue-950/80 via-slate-950/90 to-slate-950/95',
      emoji: '🏆',
      debaterEmoji: '🎤',
    },
    con: {
      label: '反対派の勝利！',
      name: winnerName,
      color: 'from-red-600 to-red-400',
      glow: 'shadow-red-500/40',
      ring: 'ring-red-400',
      bg: 'from-red-950/80 via-slate-950/90 to-slate-950/95',
      emoji: '🏆',
      debaterEmoji: '⚡',
    },
    draw: {
      label: '引き分け',
      name: null,
      color: 'from-slate-500 to-slate-400',
      glow: 'shadow-slate-500/30',
      ring: 'ring-slate-400',
      bg: 'from-slate-800/80 via-slate-950/90 to-slate-950/95',
      emoji: '🤝',
      debaterEmoji: '⚖️',
    },
  }[winner] ?? config.draw

  return (
    <div className={`absolute inset-0 verdict-overlay bg-gradient-to-b ${config.bg}
                     flex items-center justify-center z-50`}>
      <div className="text-center px-6 animate-verdict-pop max-w-lg w-full">
        {/* Trophy */}
        <div className="text-7xl mb-6 animate-bounce">{config.emoji}</div>

        {/* Winner banner */}
        <div className={`inline-block mb-4 px-8 py-3 rounded-2xl
                         bg-gradient-to-r ${config.color}
                         shadow-2xl ${config.glow}
                         ring-2 ${config.ring} ring-offset-2 ring-offset-slate-950`}>
          <p className="text-white font-black text-2xl sm:text-3xl tracking-wide drop-shadow-lg">
            {config.label}
          </p>
        </div>

        {/* Winner name */}
        {config.name && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-3xl">{config.debaterEmoji}</span>
            <div>
              <p className="text-slate-400 text-xs">勝者</p>
              <p className="text-white font-black text-xl">{config.name}</p>
            </div>
          </div>
        )}

        {/* Topic */}
        <div className="mb-8 px-4 py-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">ディベートテーマ</p>
          <p className="text-slate-300 font-medium text-sm">{topic}</p>
        </div>

        {/* CTA */}
        <p className="text-slate-500 text-sm mb-4">
          詳しい審判内容は下のパネルをご確認ください
        </p>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600
                     text-slate-200 font-bold rounded-xl transition-all duration-200
                     hover:border-slate-500 shadow-lg"
        >
          新しいディベートを始める
        </button>
      </div>
    </div>
  )
}
