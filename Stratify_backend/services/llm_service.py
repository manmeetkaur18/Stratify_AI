from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from models.request_model import (
    ActionTask,
    ExplanationItem,
    RecommendationItem,
    StartupProfile,
)

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - handled by fallback path
    OpenAI = None


class LLMStrategyService:
    def __init__(self) -> None:
        self._load_local_env()
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
        self.last_error: str | None = None

    @property
    def enabled(self) -> bool:
        return bool(self.api_key and OpenAI is not None)

    @property
    def disabled_reason(self) -> str | None:
        if not self.api_key:
            return "OPENAI_API_KEY is not set"
        if OpenAI is None:
            return "openai package is not installed"
        return None

    def build_strategy_bundle(
        self,
        profile: StartupProfile,
        metrics: dict[str, Any],
        recommendations: list[RecommendationItem],
        explanations: list[ExplanationItem],
        tasks: list[ActionTask],
    ) -> dict[str, Any]:
        self.last_error = None
        if not self.enabled:
            return {
                "summary": self._fallback_summary(profile, metrics),
                "recommendations": [item.model_dump() for item in recommendations],
                "explanations": [item.model_dump() for item in explanations],
                "tasks": [item.model_dump() for item in tasks],
            }
        try:
            client = OpenAI(api_key=self.api_key)
            prompt = self._build_prompt(profile, metrics, recommendations, explanations, tasks)

            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a startup strategy analyst. Return valid JSON only. "
                            "Keep recommendations concrete, evidence-backed, and concise."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )

            raw_content = response.choices[0].message.content or "{}"
            parsed = json.loads(raw_content)
        except Exception as exc:
            self.last_error = f"{type(exc).__name__}: {exc}"
            return {
                "summary": self._fallback_summary(profile, metrics),
                "recommendations": [item.model_dump() for item in recommendations],
                "explanations": [item.model_dump() for item in explanations],
                "tasks": [item.model_dump() for item in tasks],
            }

        return {
            "summary": parsed.get("summary", self._fallback_summary(profile, metrics)),
            "recommendations": parsed.get("recommendations", [item.model_dump() for item in recommendations]),
            "explanations": parsed.get("explanations", [item.model_dump() for item in explanations]),
            "tasks": parsed.get("tasks", [item.model_dump() for item in tasks]),
        }

    def _load_local_env(self) -> None:
        env_path = Path(__file__).resolve().parent.parent / ".env"
        if not env_path.exists():
            return

        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

    def _fallback_summary(self, profile: StartupProfile, metrics: dict[str, Any]) -> str:
        return (
            f"{profile.strategy_mode} mode suggests a demand score of {metrics['demand_score']} "
            f"with projected revenue near ${metrics['revenue']:,.0f}. "
            f"Primary pressure comes from pricing gap ({metrics['pricing_gap_pct']}%) and feature gap ({metrics['feature_gap']})."
        )

    def _build_prompt(
        self,
        profile: StartupProfile,
        metrics: dict[str, Any],
        recommendations: list[RecommendationItem],
        explanations: list[ExplanationItem],
        tasks: list[ActionTask],
    ) -> str:
        seed = {
            "profile": profile.model_dump(),
            "metrics": metrics,
            "fallback_recommendations": [item.model_dump() for item in recommendations],
            "fallback_explanations": [item.model_dump() for item in explanations],
            "fallback_tasks": [item.model_dump() for item in tasks],
        }
        return (
            "Generate a strategy response for a startup intelligence app.\n"
            "Return JSON with keys: summary, recommendations, explanations, tasks.\n"
            "recommendations must be an array of up to 3 objects with title, impact, description, why, data_support.\n"
            "explanations must be an array of up to 3 objects with question, answer, evidence.\n"
            "tasks must be an array of up to 3 objects with title, owner, deadline_days, priority.\n"
            "Use clear business language and reference the provided metrics.\n"
            f"Context JSON:\n{json.dumps(seed)}"
        )
