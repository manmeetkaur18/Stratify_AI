from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.request_model import DecisionRequest, IntelligenceRequest, IntelligenceResponse
from services.decision_engine import (
    apply_decision,
    build_competitor_view,
    build_risk_heatmap,
    build_scenarios,
    calculate_metrics,
    fallback_explanations,
    fallback_recommendations,
    fallback_tasks,
)
from services.llm_service import LLMStrategyService

app = FastAPI()
llm_service = LLMStrategyService()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change later in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Stratify AI Backend Running",
        "llm_enabled": llm_service.enabled,
        "llm_reason": llm_service.disabled_reason,
        "llm_last_error": llm_service.last_error,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "llm_enabled": llm_service.enabled,
        "llm_reason": llm_service.disabled_reason,
        "llm_last_error": llm_service.last_error,
    }


@app.post("/analyze", response_model=IntelligenceResponse)
def analyze_startup(data: IntelligenceRequest):
    metrics = calculate_metrics(data.profile, data.competitors)
    risk_heatmap = build_risk_heatmap(data.profile, data.competitors, metrics)
    recommendations = fallback_recommendations(data.profile, metrics)
    explanations = fallback_explanations(data.profile, metrics)
    tasks = fallback_tasks(data.profile, metrics)
    llm_bundle = llm_service.build_strategy_bundle(
        data.profile,
        metrics.model_dump(),
        recommendations,
        explanations,
        tasks,
    )

    return IntelligenceResponse(
        llm_enabled=llm_service.enabled,
        profile=data.profile,
        metrics=metrics,
        risk_heatmap=risk_heatmap,
        recommendations=llm_bundle["recommendations"],
        explanations=llm_bundle["explanations"],
        action_tasks=llm_bundle["tasks"],
        competitors=build_competitor_view(data.profile, data.competitors, metrics),
        scenarios=build_scenarios(data.profile, data.scenarios, data.competitors),
        strategy_summary=llm_bundle["summary"],
    )


@app.post("/decision-mode")
def run_decision_mode(data: DecisionRequest):
    return apply_decision(data)
