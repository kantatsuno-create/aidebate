import { useState } from 'react'

export default function PasswordGate({ onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': password.trim(),
        },
      })
      if (res.ok) {
        sessionStorage.setItem('debate_token', password.trim())
        onAuthenticated(password.trim())
      } else {
        setError('パスワードが違います')
        setPassword('')
      }
    } catch {
      setError('サーバーに接続できません')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-black text-slate-100">アクセス制限</h2>
          <p className="text-slate-500 text-sm mt-2">
            このアプリはプライベートです。パスワードを入力してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500
                       text-slate-100 text-base px-4 py-3 rounded-xl outline-none
                       transition-colors placeholder:text-slate-600"
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3 rounded-xl font-bold text-white
                       bg-gradient-to-r from-blue-600 to-blue-500
                       hover:from-blue-500 hover:to-blue-400
                       disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500
                       disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? '確認中...' : 'アクセス'}
          </button>
        </form>
      </div>
    </div>
  )
}
