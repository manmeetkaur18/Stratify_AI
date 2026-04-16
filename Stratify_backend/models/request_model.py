from typing import List, Literal, Optional

from pydantic import BaseModel, Field


StrategyMode = Literal["Growth", "Profit", "Balanced"]
ImpactLevel = Literal["High", "Medium", "Low"]
RiskLevel = Literal["high", "medium", "safe"]


class CompetitorInput(BaseModel):
    name: str
    price: float = Field(..., ge=0)
    users: int = Field(0, ge=0)
    features: List[str] = Field(default_factory=list)
    positioning: str = "Market"
    score: Optional[int] = Field(default=None, ge=0, le=100)


class ScenarioInput(BaseModel):
    name: str
    price: float = Field(..., ge=0)
    marketing_budget: float = Field(..., ge=0)
    enabled_features: List[str] = Field(default_factory=list)
    strategy_mode: StrategyMode = "Balanced"


class StartupProfile(BaseModel):
    startup_name: str = "My Startup"
    industry: str = "saas"
    target_audience: str = "SMBs"
    current_price: float = Field(..., ge=0)
    competitor_price: float = Field(..., ge=0)
    monthly_users: int = Field(..., ge=0)
    marketing_budget: float = Field(5000, ge=0)
    enabled_features: List[str] = Field(default_factory=list)
    strategy_mode: StrategyMode = "Balanced"
    timeframe_days: int = Field(30, ge=1, le=365)


class IntelligenceRequest(BaseModel):
    profile: StartupProfile
    competitors: List[CompetitorInput] = Field(default_factory=list)
    scenarios: List[ScenarioInput] = Field(default_factory=list)


class DecisionRequest(BaseModel):
    profile: StartupProfile
    action: Literal[
        "increase_price",
        "decrease_price",
        "add_feature",
        "remove_feature",
        "increase_marketing",
        "decrease_marketing",
    ]
    amount: Optional[float] = None
    feature_name: Optional[str] = None


class MetricSummary(BaseModel):
    demand_score: float
    demand_units: int
    demand_change_pct: float
    revenue: float
    revenue_change_pct: float
    risk_score: int
    pricing_gap_pct: float
    feature_gap: int
    strategy_mode: StrategyMode


class RiskItem(BaseModel):
    name: str
    score: int = Field(..., ge=0, le=100)
    level: RiskLevel
    reason: str


class RecommendationItem(BaseModel):
    title: str
    impact: ImpactLevel
    description: str
    why: str
    data_support: str


class ExplanationItem(BaseModel):
    question: str
    answer: str
    evidence: List[str] = Field(default_factory=list)


class ActionTask(BaseModel):
    title: str
    owner: str = "Founder"
    deadline_days: int = Field(..., ge=1, le=90)
    priority: ImpactLevel


class CompetitorGap(BaseModel):
    type: Literal["warning", "missing", "opportunity"]
    title: str
    description: str


class CompetitorView(BaseModel):
    companies: List[CompetitorInput]
    gaps: List[CompetitorGap]


class ScenarioResult(BaseModel):
    name: str
    price: float
    demand: int
    revenue: float
    risk: int
    mode: StrategyMode
    summary: str


class IntelligenceResponse(BaseModel):
    llm_enabled: bool
    profile: StartupProfile
    metrics: MetricSummary
    risk_heatmap: List[RiskItem]
    recommendations: List[RecommendationItem]
    explanations: List[ExplanationItem]
    action_tasks: List[ActionTask]
    competitors: CompetitorView
    scenarios: List[ScenarioResult]
    strategy_summary: str


class DecisionResponse(BaseModel):
    action: str
    summary: str
    before: MetricSummary
    after: MetricSummary
    delta: dict