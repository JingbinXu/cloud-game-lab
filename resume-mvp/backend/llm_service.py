from __future__ import annotations
import os
import json
import asyncio
from typing import Optional
from openai import AsyncOpenAI

_client: Optional[AsyncOpenAI] = None
_semaphore = asyncio.Semaphore(3)


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("LLM_API_KEY", "")
        base_url = os.environ.get("LLM_BASE_URL") or None
        _client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    return _client


def is_configured() -> bool:
    return bool(os.environ.get("LLM_API_KEY"))


def get_model() -> str:
    return os.environ.get("LLM_MODEL", "gpt-4o-mini")


async def generate_resume_content(module_type: str, prompt: str) -> dict:
    """
    调用 LLM 生成简历模块内容，返回解析后的 dict。
    自动重试一次（JSON 解析失败时）。
    """
    async with _semaphore:
        client = _get_client()
        model = get_model()

        for attempt in range(2):
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位专业的简历顾问。请严格按照要求的 JSON 格式输出，不要输出任何其他内容。",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            raw = response.choices[0].message.content or "{}"
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                if attempt == 0:
                    continue
                raise ValueError(f"LLM 返回内容无法解析为 JSON: {raw[:200]}")

        # unreachable, but satisfies type checker
        raise ValueError("LLM 调用失败")
