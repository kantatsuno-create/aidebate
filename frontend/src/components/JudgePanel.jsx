import { useEffect, useRef } from 'react'

export default function JudgePanel({ judgeText, isStreaming }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [judgeText])

  return (
    <div className="h-full flex flex-col bg-amber-950/10 animate-fade-in-up">
      {/* Judge header */}
      <div className="flex-none px-4 py-2.5 flex items-center gap-3 border-b border-amber-900/30
                      judge-glow">
        <div className="w-8 h-8 rounded-lg bg-amber-900/40 flex items-center justify-center text-lg
                        ring-2 ring-amber-500/30">
          ⚖️
        </div>
        <div className="flex-1">
          <div className="text-amber-400 font-bold text-sm">田中審判長</div>
          <div className="text-xs text-amber-700">審判・判定</div>
        </div>
        {isStreaming && (
          <div className="flex gap-1 items-end h-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-amber-400 animate-pulse"
                style={{ height: `${(i + 1) * 33}%`, animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
        {!isStreaming && judgeText && (
          <span className="text-xs text-amber-600 font-medium">審判完了</span>
        )}
      </div>

      {/* Judge text */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {!judgeText && isStreaming && (
          <div className="flex gap-1 items-center text-amber-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-2">審判中...</span>
          </div>
        )}
        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
          {judgeText}
          {isStreaming && judgeText && <span className="typing-cursor" />}
        </p>
      </div>
    </div>
  )
}
