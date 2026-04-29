import asyncio
import json
import os
import re
from typing import AsyncGenerator

import httpx

ROUNDS = [
    {
        "name": "立論",
        "description": (
            "あなたの立場を明確に主張してください。"
            "なぜそう考えるのか、具体的な根拠と事例を挙げて力強く訴えてください。"
            "聴衆に強い第一印象を与える、印象的な開幕にしてください。"
        ),
        "with_opponent": False,
    },
    {
        "name": "第一反駁",
        "description": (
            "相手の立論に正面から反論してください。"
            "相手の論点の具体的な弱点を指摘し、あなた自身の論拠をさらに強化してください。"
            "必ず相手が述べた内容を引用・言及してから反論すること。"
        ),
        "with_opponent": True,
    },
    {
        "name": "第二反駁",
        "description": (
            "これまでの議論全体を踏まえ、相手の最も重要な主張を崩してください。"
            "あなたの立場の優位性を決定的に示し、聴衆の疑念を払拭してください。"
            "相手が第一反駁で述べた内容に必ず言及すること。"
        ),
        "with_opponent": True,
    },
    {
        "name": "最終弁論",
        "description": (
            "このディベートの総括です。これまでの議論を整理し、"
            "なぜあなたの立場が正しいのかを力強く・感情的に・論理的に訴えてください。"
            "審判と聴衆の心を動かす、魂のこもった最後のアピールをしてください。"
        ),
        "with_opponent": True,
    },
]

PRO_NAME = "アレックス"
CON_NAME = "サラ"
JUDGE_NAME = "田中審判長"
MODEL = "gemini-2.0-flash"
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL}:streamGenerateContent"
)


def get_pro_system(topic: str) -> str:
    return f"""あなたは「{topic}」についてのディベートで賛成派として戦う気鋭のディベーターです。

名前: {PRO_NAME}
経歴: 東京大学法学部卒。国際ディベート大会3連覇。論理と情熱を武器にする若き論客。

話し方の特徴:
- 自信に満ちた堂々とした語り口で、聴衆に語りかける
- 「考えてみてください」「これが何を意味するかわかりますか」など問いかけを使う
- 具体的な数字・研究データ・実際の事例を積極的に引用する
- 相手（サラ）の名前を出して直接反論する（反駁時）

厳守事項:
- 必ず賛成・肯定の立場を貫くこと
- 第一反駁以降は相手の具体的な発言内容に必ず言及してから反論すること
- 500〜750文字で述べること
- マークダウン記号（#、**、-、・、>など）は絶対に使わない
- 句読点だけを使い、自然な話し言葉で書くこと
- 段落の最初に「賛成派として」「立論として」など役割ラベルを書かないこと"""


def get_con_system(topic: str) -> str:
    return f"""あなたは「{topic}」についてのディベートで反対派として戦う鋭い論客です。

名前: {CON_NAME}
経歴: 哲学・社会学博士。批判的思考の専門家。社会の矛盾を鋭く突く「反証の女王」の異名を持つ。

話し方の特徴:
- 冷静さと情熱を兼ね備えた語り口
- 「それは表面的な理解に過ぎません」「本当に大切なのは」など鋭い指摘を使う
- 人間への影響、倫理的問題、歴史的教訓を重視する
- 相手（アレックス）の名前を出して直接反論する（反駁時）

厳守事項:
- 必ず反対・否定の立場を貫くこと
- 第一反駁以降は相手の具体的な発言内容に必ず言及してから反論すること
- 500〜750文字で述べること
- マークダウン記号（#、**、-、・、>など）は絶対に使わない
- 句読点だけを使い、自然な話し言葉で書くこと
- 段落の最初に「反対派として」「立論として」など役割ラベルを書かないこと"""


def get_judge_system(topic: str) -> str:
    return f"""あなたは「{topic}」についてのディベートを審判する権威ある審判長です。

名前: {JUDGE_NAME}
経歴: 早稲田大学名誉教授、ディベート審判歴30年。公正・厳正・明確な審判で国内外に知られる。

審判の手順（この順序で必ず行うこと）:
1. ディベート全体の概評（両者の戦い方・特徴を端的に述べる）
2. 評価基準ごとの採点と詳細解説:
   論理の一貫性と明確さ（各25点満点）、証拠・根拠の質と説得力（各25点満点）、
   相手への効果的な反論（各25点満点）、説得力と表現力（各25点満点）
3. 両者の総合スコアの発表（例：{PRO_NAME} 83点 vs {CON_NAME} 79点）
4. このディベートの転換点・最も重要だった発言の指摘
5. 勝者の宣言

最後は必ず「【判定】賛成派（{PRO_NAME}）の勝利」または「【判定】反対派（{CON_NAME}）の勝利」で締めくくること。
括弧記号【】のみ使用可能。他のマークダウン記号（#、**、-など）は使わない。
審判長として毅然とした態度で、根拠を持って明確に判定を下すこと。"""


class DebateEngine:
    def __init__(self) -> None:
        self._api_key = os.environ.get("GOOGLE_API_KEY", "")

    async def _stream(
        self, system: str, prompt: str, max_tokens: int = 1000
    ) -> AsyncGenerator[str, None]:
        payload = {
            "system_instruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.9,
            },
        }
        url = f"{GEMINI_URL}?key={self._api_key}&alt=sse"

        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", url, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    raw = line[5:].strip()
                    if not raw or raw == "[DONE]":
                        continue
                    try:
                        obj = json.loads(raw)
                        text = (
                            obj.get("candidates", [{}])[0]
                            .get("content", {})
                            .get("parts", [{}])[0]
                            .get("text", "")
                        )
                        if text:
                            yield text
                    except (json.JSONDecodeError, IndexError, KeyError):
                        continue

    async def run_debate(self, topic: str) -> AsyncGenerator[dict, None]:
        transcript: list[dict] = []
        pro_speeches: list[dict] = []
        con_speeches: list[dict] = []

        yield {"type": "debate_start", "topic": topic, "total_rounds": len(ROUNDS)}

        for round_idx, round_info in enumerate(ROUNDS):
            yield {
                "type": "round_start",
                "round": round_idx + 1,
                "name": round_info["name"],
                "total": len(ROUNDS),
            }

            for is_pro in [True, False]:
                side = "pro" if is_pro else "con"
                name = PRO_NAME if is_pro else CON_NAME
                title = "賛成派チャンピオン" if is_pro else "反対派チャンピオン"
                system = get_pro_system(topic) if is_pro else get_con_system(topic)
                own_speeches = pro_speeches if is_pro else con_speeches
                opp_speeches = con_speeches if is_pro else pro_speeches

                prompt = self._build_prompt(
                    topic, round_info, own_speeches, opp_speeches, name, is_pro
                )

                yield {
                    "type": "speaker_start",
                    "side": side,
                    "name": name,
                    "title": title,
                    "round": round_idx + 1,
                    "round_name": round_info["name"],
                }

                speech = ""
                async for text in self._stream(system, prompt):
                    speech += text
                    yield {"type": "token", "side": side, "text": text}

                (pro_speeches if is_pro else con_speeches).append(
                    {"round": round_info["name"], "text": speech}
                )
                transcript.append(
                    {"side": side, "name": name, "round": round_info["name"], "text": speech}
                )

                yield {"type": "speaker_end", "side": side}
                await asyncio.sleep(0.3)

            yield {"type": "round_end", "round": round_idx + 1}

        yield {"type": "judge_start", "name": JUDGE_NAME}

        judge_text = ""
        transcript_str = self._format_transcript(transcript)
        judge_prompt = (
            f"以下のディベートを審判してください。\n\n"
            f"【テーマ】{topic}\n\n"
            f"【ディベート全記録】\n{transcript_str}\n\n"
            "審判をお願いします。"
        )

        async for text in self._stream(get_judge_system(topic), judge_prompt, max_tokens=2000):
            judge_text += text
            yield {"type": "judge_token", "text": text}

        winner = self._extract_winner(judge_text)
        winner_name = (
            PRO_NAME if winner == "pro" else (CON_NAME if winner == "con" else None)
        )

        yield {"type": "verdict", "winner": winner, "winner_name": winner_name}
        yield {"type": "debate_end"}

    def _build_prompt(
        self,
        topic: str,
        round_info: dict,
        own_speeches: list,
        opp_speeches: list,
        name: str,
        is_pro: bool,
    ) -> str:
        own_side = "賛成派" if is_pro else "反対派"
        opp_side = "反対派" if is_pro else "賛成派"
        opp_name = CON_NAME if is_pro else PRO_NAME

        parts = [
            f"ディベートテーマ：{topic}",
            f"現在のラウンド：{round_info['name']}",
            f"あなたの役割：{own_side}（{name}）",
        ]

        if own_speeches or opp_speeches:
            parts.append("\nこれまでの議論：")
            for i in range(max(len(own_speeches), len(opp_speeches))):
                if i < len(own_speeches):
                    s = own_speeches[i]
                    parts.append(f"\n[あなた（{own_side}） - {s['round']}]\n{s['text']}")
                if i < len(opp_speeches):
                    s = opp_speeches[i]
                    parts.append(f"\n[{opp_name}（{opp_side}） - {s['round']}]\n{s['text']}")

        parts.append(f"\n指示：{round_info['description']}")
        parts.append(f"\nそれでは{round_info['name']}を始めてください：")
        return "\n".join(parts)

    def _format_transcript(self, transcript: list) -> str:
        lines = []
        for entry in transcript:
            side_jp = "賛成派" if entry["side"] == "pro" else "反対派"
            lines.append(f"\n{'=' * 50}")
            lines.append(f"【{side_jp}（{entry['name']}）- {entry['round']}】")
            lines.append(entry["text"])
        return "\n".join(lines)

    def _extract_winner(self, judge_text: str) -> str:
        if f"【判定】賛成派" in judge_text or f"【判定】{PRO_NAME}" in judge_text:
            return "pro"
        if f"【判定】反対派" in judge_text or f"【判定】{CON_NAME}" in judge_text:
            return "con"

        tail = judge_text[-800:]
        pro_match = re.search(r"賛成派.{0,10}の勝利", tail)
        con_match = re.search(r"反対派.{0,10}の勝利", tail)
        if pro_match and not con_match:
            return "pro"
        if con_match and not pro_match:
            return "con"
        if pro_match and con_match:
            return "pro" if pro_match.start() > con_match.start() else "con"
        return "draw"
