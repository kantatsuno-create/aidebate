import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function DebaterColumn({
  side,
  name,
  title,
  emoji,
  messages,
  currentSpeaker,
  streamingText,
  currentRoundName,
}) {
  const isPro = side === 'pro'
  const isActive = currentSpeaker?.side === side
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingText])

  const accentColor = isPro
    ? { border: 'border-blue-500/20', activeBorder: 'pro-active', header: 'text-blue-400', bg: 'bg-blue-950/10' }
    : { border: 'border-red-500/20', activeBorder: 'con-active', header: 'text-red-400', bg: 'bg-red-950/10' }

  return (
    <div className={`flex-1 flex flex-col min-h-0 border-r last:border-r-0 border-slate-800/40
                     transition-all duration-300 ${accentColor.bg}`}>
      {/* Debater header */}
      <div className={`flex-none px-4 py-3 flex items-center gap-3 border-b
                       transition-all duration-300
                       ${isActive ? `border-b-2 ${accentColor.border}` : 'border-slate-800/40'}
                       ${isActive ? accentColor.activeBorder : ''}`}
           style={{ boxShadow: isActive ? undefined : 'none' }}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                         transition-all duration-300
                         ${isActive
                           ? isPro ? 'bg-blue-500/20 ring-2 ring-blue-500/40' : 'bg-red-500/20 ring-2 ring-red-500/40'
                           : 'bg-slate-800'}`}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm ${accentColor.header}`}>{name}</div>
          <div className="text-xs text-slate-500">{title}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500">{messages.length} 発言</div>
          {isActive && (
            <div className={`text-xs font-semibold animate-pulse ${accentColor.header}`}>
              ● 発言中
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 && !isActive && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-600 text-xs text-center">
              発言待ち...
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            roundName={msg.roundName}
            text={msg.text}
            side={side}
            isStreaming={false}
            animate={true}
          />
        ))}

        {/* Currently streaming message */}
        {isActive && (
          <MessageBubble
            roundName={currentRoundName}
            text={streamingText}
            side={side}
            isStreaming={true}
            animate={false}
          />
        )}
      </div>
    </div>
  )
}
