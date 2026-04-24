import { useReducer, useCallback } from 'react'
import TopicInput from './components/TopicInput'
import DebateArena from './components/DebateArena'

const initial = {
  status: 'idle',       // idle | loading | debating | judging | finished | error
  topic: '',
  currentRound: 0,
  currentRoundName: '',
  totalRounds: 4,
  currentSpeaker: null, // { side, name, title, roundName }
  streamingText: '',
  proMessages: [],      // [{ roundName, text }]
  conMessages: [],
  judgeText: '',
  verdict: null,        // { winner: 'pro'|'con'|'draw', winnerName }
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { ...initial }

    case 'START_LOADING':
      return { ...initial, status: 'loading', topic: action.topic }

    case 'debate_start':
      return {
        ...state,
        status: 'debating',
        topic: action.payload.topic,
        totalRounds: action.payload.total_rounds,
      }

    case 'round_start':
      return {
        ...state,
        currentRound: action.payload.round,
        currentRoundName: action.payload.name,
      }

    case 'speaker_start':
      return {
        ...state,
        currentSpeaker: {
          side: action.payload.side,
          name: action.payload.name,
          title: action.payload.title,
          roundName: action.payload.round_name,
        },
        streamingText: '',
      }

    case 'token':
      return { ...state, streamingText: state.streamingText + action.payload.text }

    case 'speaker_end': {
      const msg = { roundName: state.currentRoundName, text: state.streamingText }
      const isPro = action.payload.side === 'pro'
      return {
        ...state,
        proMessages: isPro ? [...state.proMessages, msg] : state.proMessages,
        conMessages: isPro ? state.conMessages : [...state.conMessages, msg],
        currentSpeaker: null,
        streamingText: '',
      }
    }

    case 'judge_start':
      return {
        ...state,
        status: 'judging',
        currentSpeaker: { side: 'judge', name: action.payload.name },
        judgeText: '',
      }

    case 'judge_token':
      return { ...state, judgeText: state.judgeText + action.payload.text }

    case 'verdict':
      return {
        ...state,
        verdict: { winner: action.payload.winner, winnerName: action.payload.winner_name },
      }

    case 'debate_end':
      return { ...state, status: 'finished', currentSpeaker: null }

    case 'error':
      return { ...state, status: 'error', error: action.payload.message || action.payload }

    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)

  const startDebate = useCallback(async (topic) => {
    dispatch({ type: 'START_LOADING', topic })

    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      if (!res.ok) throw new Error(`サーバーエラー (${res.status})`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            dispatch({ type: event.type, payload: event })
          } catch {
            // malformed event — skip
          }
        }
      }
    } catch (err) {
      dispatch({ type: 'error', payload: { message: err.message } })
    }
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <Header />
      {state.status === 'idle' ? (
        <TopicInput onStart={startDebate} />
      ) : (
        <DebateArena state={state} onReset={reset} />
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-slate-800/60">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚔️</span>
        <h1 className="text-xl font-black tracking-wide">
          <span className="text-blue-400">AI</span>
          <span className="text-slate-300"> ディベート</span>
          <span className="text-red-400">アリーナ</span>
        </h1>
      </div>
      <p className="text-xs text-slate-500 hidden sm:block">
        Powered by Claude claude-sonnet-4-6
      </p>
    </header>
  )
}
