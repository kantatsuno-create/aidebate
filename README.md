# AI ディベートアリーナ

人間がお題を決めると、AIが賛成・反対に分かれて自動でディベートし、別のAI審判が勝者を決定するWebアプリです。

## ディベートの流れ

1. **立論** — 賛成派・反対派がそれぞれの立場を表明
2. **第一反駁** — 相手の立論に反論
3. **第二反駁** — さらに深い反論と論点の強化
4. **最終弁論** — まとめと最終アピール
5. **審判** — AI審判長が100点満点で採点し勝者を宣言

## セットアップ

### 必要なもの
- Python 3.11+
- Node.js 18+
- Anthropic APIキー

### 起動方法

**バックエンド:**
```bash
cd backend
cp .env.example .env
# .env の ANTHROPIC_API_KEY を設定
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**フロントエンド:**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000 でアクセス
```

## 技術スタック

| 項目 | 技術 |
|------|------|
| バックエンド | Python / FastAPI |
| AI | Anthropic Claude claude-sonnet-4-6 (ストリーミング) |
| フロントエンド | React / Vite / Tailwind CSS |
| 通信 | Server-Sent Events (SSE) |

## ディベーターキャラクター

- **アレックス（賛成派）** — 東大法学部卒。論理とデータで武装した気鋭の論客
- **サラ（反対派）** — 哲学・社会学博士。「反証の女王」の異名を持つ鋭い論客
- **田中審判長（審判）** — 早大名誉教授。ディベート審判歴30年のベテラン
