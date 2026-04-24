import DebaterColumn from './DebaterColumn'
import JudgePanel from './JudgePanel'
import VerdictDisplay from './VerdictDisplay'

const ROUND_NAMES = ['立論', '第一反駁', '第二反駁', '最終弁論']

export default function DebateArena({ state, onReset }) {
  const {
    status,
    topic,
    currentRound,
    currentRoundName,
    totalRounds,
    currentSpeaker,
    streamingText,
    proMessages,
    conMessages,
    judgeText,
    verdict,
    error,
  } = state

  const isJudging = status === 'judging' || status === 'finished'
  const isFinished = status === 'finished'

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚔️</div>
          <p className="text-slate-400 shimmer-text text-lg font-medium">ディベートを準備中...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 font-bold text-lg mb-2">エラーが発生しました</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200
                       rounded-xl font-medium transition-colors"
          >
            もう一度試す
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {/* Topic + round progress bar */}
      <TopBar
        topic={topic}
        currentRound={currentRound}
        totalRounds={totalRounds}
        currentRoundName={currentRoundName}
        status={status}
        onReset={onReset}
      />

      {/* Main debate area */}
      <div className={`flex gap-0 min-h-0 transition-all duration-500 ${isJudging ? 'flex-[3]' : 'flex-1'}`}>
        <DebaterColumn
          side="pro"
          name="アレックス"
          title="賛成派"
          emoji="🎤"
          messages={proMessages}
          currentSpeaker={currentSpeaker}
          streamingText={streamingText}
          currentRoundName={currentRoundName}
        />

        {/* Center divider */}
        <CenterDivider
          currentRound={currentRound}
          totalRounds={totalRounds}
          currentRoundName={currentRoundName}
          currentSpeaker={currentSpeaker}
          status={status}
        />

        <DebaterColumn
          side="con"
          name="サラ"
          title="反対派"
          emoji="⚡"
          messages={conMessages}
          currentSpeaker={currentSpeaker}
          streamingText={streamingText}
          currentRoundName={currentRoundName}
        />
      </div>

      {/* Judge panel */}
      {isJudging && (
        <div className="flex-[2] min-h-0 border-t border-amber-900/30">
          <JudgePanel judgeText={judgeText} isStreaming={status === 'judging'} />
        </div>
      )}

      {/* Verdict overlay */}
      {isFinished && verdict && (
        <VerdictDisplay verdict={verdict} topic={topic} onReset={onReset} />
      )}
    </div>
  )
}

function TopBar({ topic, currentRound, totalRounds, currentRoundName, status, onReset }) {
  const statusLabel = {
    debating: currentRoundName ? `ラウンド ${currentRound}/${totalRounds}：${currentRoundName}` : '開始中...',
    judging: '審判中...',
    finished: '審判完了',
  }[status] ?? ''

  return (
    <div className="flex-none px-4 py-3 bg-slate-900/60 border-b border-slate-800/60
                    flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">ディベートテーマ</p>
        <p className="text-slate-200 font-semibold text-sm truncate">{topic}</p>
      </div>

      {/* Round dots */}
      <div className="flex items-center gap-1.5 shrink-0">
        {Array.from({ length: totalRounds || 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < currentRound
                ? 'bg-blue-500'
                : i === currentRound - 1
                ? 'bg-blue-400 ring-2 ring-blue-400/40 scale-125'
                : 'bg-slate-700'
            }`}
          />
        ))}
        {status === 'judging' || status === 'finished' ? (
          <div className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/40 scale-125 ml-1" />
        ) : null}
      </div>

      <div className="text-xs text-slate-400 shrink-0 font-medium">{statusLabel}</div>

      <button
        onClick={onReset}
        className="shrink-0 text-xs text-slate-500 hover:text-slate-300 transition-colors
                   px-2 py-1 rounded hover:bg-slate-800"
      >
        ✕ リセット
      </button>
    </div>
  )
}

function CenterDivider({ currentRound, totalRounds, currentRoundName, currentSpeaker, status }) {
  return (
    <div className="w-16 sm:w-20 flex-none flex flex-col items-center justify-start
                    pt-6 gap-3 border-x border-slate-800/40 bg-slate-950/50">
      <div className="text-slate-600 font-black text-xs tracking-widest">VS</div>
      {currentRound > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                          text-xs font-bold border transition-all duration-300
                          ${status === 'judging'
                            ? 'bg-amber-900/30 border-amber-500/50 text-amber-400'
                            : 'bg-slate-800 border-slate-600 text-slate-300 round-active'
                          }`}>
            {status === 'judging' ? '⚖️' : currentRound}
          </div>
          <div className="text-[10px] text-slate-600 text-center leading-tight max-w-[56px]">
            {status === 'judging' ? '審判' : currentRoundName}
          </div>
        </div>
      )}
      {/* Speaking indicator */}
      {currentSpeaker && currentSpeaker.side !== 'judge' && (
        <div className={`mt-auto mb-4 flex flex-col items-center gap-1`}>
          <div className={`flex gap-0.5 items-end h-4`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full animate-pulse ${
                  currentSpeaker.side === 'pro' ? 'bg-blue-400' : 'bg-red-400'
                }`}
                style={{
                  height: `${(i + 1) * 33}%`,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
          <div className={`text-[9px] font-bold ${
            currentSpeaker.side === 'pro' ? 'text-blue-400' : 'text-red-400'
          }`}>
            発言中
          </div>
        </div>
      )}
    </div>
  )
}
