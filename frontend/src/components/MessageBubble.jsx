export default function MessageBubble({ roundName, text, side, isStreaming, animate }) {
  const isPro = side === 'pro'

  const styles = {
    pro: {
      wrapper: 'animate-slide-in-left',
      bubble: 'bg-slate-800/80 border-blue-500/20 text-slate-200',
      badge: 'bg-blue-900/60 text-blue-300 border-blue-700/40',
    },
    con: {
      wrapper: 'animate-slide-in-right',
      bubble: 'bg-slate-800/80 border-red-500/20 text-slate-200',
      badge: 'bg-red-900/60 text-red-300 border-red-700/40',
    },
  }[side]

  return (
    <div className={`${animate ? styles.wrapper : ''} animate-fade-in-up`}>
      {/* Round badge */}
      <div className="mb-1.5 px-1">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles.badge}`}>
          {roundName}
        </span>
      </div>

      {/* Speech bubble */}
      <div className={`rounded-xl border px-3 py-3 text-xs leading-relaxed
                       ${styles.bubble}`}>
        {text || ' '}
        {isStreaming && text && <span className="typing-cursor" />}
        {isStreaming && !text && (
          <span className="inline-flex gap-1 items-center">
            <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}
