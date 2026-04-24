import { useState } from 'react'

const EXAMPLES = [
  'AIは人間の仕事を奪う',
  '死刑制度は廃止すべきだ',
  'SNSは社会に害をもたらしている',
  '大学の学費は無償化すべきだ',
  'リモートワークは対面勤務より優れている',
  '原子力発電は必要だ',
]

export default function TopicInput({ onStart }) {
  const [topic, setTopic] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (topic.trim()) onStart(topic.trim())
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex justify-center gap-6 mb-6 text-5xl">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🔵</span>
          <span className="text-4xl font-black text-slate-400 self-center">VS</span>
          <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🔴</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-3">
          お題を入力してください
        </h2>
        <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
          AIが賛成・反対に分かれて4ラウンドのディベートを行い、
          別のAI審判が勝者を決定します。
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className={`relative rounded-2xl transition-all duration-300 ${
          focused ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : 'ring-1 ring-slate-700'
        }`}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="例：AIは人間の仕事を奪う"
            className="w-full bg-slate-900 text-slate-100 text-lg px-6 py-5 pr-36
                       rounded-2xl outline-none placeholder:text-slate-600"
            autoFocus
          />
          <button
            type="submit"
            disabled={!topic.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       px-5 py-2.5 rounded-xl font-bold text-sm
                       bg-gradient-to-r from-blue-600 to-blue-500
                       hover:from-blue-500 hover:to-blue-400
                       disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500
                       text-white transition-all duration-200 disabled:cursor-not-allowed
                       shadow-md shadow-blue-900/40"
          >
            ディベート開始
          </button>
        </div>
      </form>

      {/* Examples */}
      <div className="mt-8 w-full max-w-xl">
        <p className="text-xs text-slate-500 mb-3 text-center">お題の例</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setTopic(ex)}
              className="px-3 py-1.5 text-sm bg-slate-800/60 hover:bg-slate-700/80
                         text-slate-400 hover:text-slate-200 rounded-full border border-slate-700/50
                         hover:border-slate-600 transition-all duration-150"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Debater info */}
      <div className="mt-14 flex gap-6 sm:gap-12">
        <DebaterCard color="blue" emoji="🎤" name="アレックス" role="賛成派" />
        <div className="flex items-center">
          <span className="text-2xl font-black text-slate-600">VS</span>
        </div>
        <DebaterCard color="red" emoji="⚡" name="サラ" role="反対派" />
      </div>
    </div>
  )
}

function DebaterCard({ color, emoji, name, role }) {
  const colors = {
    blue: 'border-blue-500/30 bg-blue-950/20 text-blue-400',
    red: 'border-red-500/30 bg-red-950/20 text-red-400',
  }
  return (
    <div className={`flex flex-col items-center gap-2 px-5 py-4 rounded-xl border ${colors[color]}`}>
      <span className="text-3xl">{emoji}</span>
      <div className="text-center">
        <div className={`font-bold text-sm ${colors[color].split(' ').pop()}`}>{name}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
    </div>
  )
}
