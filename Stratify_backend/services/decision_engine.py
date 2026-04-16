from __future__ import annotations

from copy import deepcopy
from statistics import mean

from models.request_model import (
    ActionTask,
    CompetitorGap,
    CompetitorInput,
    CompetitorView,
    DecisionRequest,
    DecisionResponse,
    ExplanationItem,
    MetricSummary,
    RecommendationItem,
    RiskItem,
    ScenarioInput,
    ScenarioResult,
    StartupProfile,
)


MODE_DEMAND_BONUS = {
    "Growth": 8,
    "Profit": -6,
    "Balanced": 2,
}

MODE_RISK_SHIFT = {
    "Growth": 8,
    "Profit": -5,
    "Balanced": 1,
}


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def _risk_level(score: int) -> str:
    if score >= 67:
        return "high"
    if score >= 40:
        return "medium"
    return "safe"


def _feature_gap(profile: StartupProfile, competitors: list[CompetitorInput]) -> int:
    if not competitors:
        return 0
    competitor_avg = mean(len(item.features) for item in competitors)
    return max(0, round(competitor_avg - len(profile.enabled_features)))


def _pricing_gap_pct(profile: StartupProfile, competitors: list[CompetitorInput]) -> float:
    baseline = profile.competitor_price
    if competitors:
        baseline = mean(item.price for item in competitors)
    if baseline <= 0:
        return 0.0
    return round(((profile.current_price - baseline) / baseline) * 100, 1)


def calculate_metrics(profile: StartupProfile, competitors: list[CompetitorInput]) -> MetricSummary:
    pricing_gap_pct = _pricing_gap_pct(profile, competitors)
    feature_gap = _feature_gap(profile, competitors)
    feature_count = len(profile.enabled_features)

    price_penalty = (profile.current_price / max(profile.competitor_price, 1)) * 18
    marketing_boost = min(18, profile.marketing_budget / 550)
    feature_boost = feature_count * 4.5
    mode_bonus = MODE_DEMAND_BONUS[profile.strategy_mode]

    demand_score = _clamp(52 + marketing_boost + feature_boost + mode_bonus - price_penalty, 8, 98)
    demand_units = round(profile.monthly_users * (demand_score / 100))

    baseline_demand = max(profile.monthly_users * 0.58, 1)
    demand_change_pct = round(((demand_units - baseline_demand) / baseline_demand) * 100, 1)

    revenue = round(demand_units * profile.current_price, 2)
    baseline_revenue = max(baseline_demand * max(profile.competitor_price, 1), 1)
    revenue_change_pct = round(((revenue - baseline_revenue) / baseline_revenue) * 100, 1)

    risk_score = round(
        _clamp(
            35
            + max(pricing_gap_pct, 0) * 0.8
            + feature_gap * 8
            + MODE_RISK_SHIFT[profile.strategy_mode]
            + max(0, 45 - demand_score) * 0.7,
            5,
            96,
        )
    )

    return MetricSummary(
        demand_score=round(demand_score, 1),
        demand_units=demand_units,
        demand_change_pct=demand_change_pct,
        revenue=revenue,
        revenue_change_pct=revenue_change_pct,
        risk_score=risk_score,
        pricing_gap_pct=pricing_gap_pct,
        feature_gap=feature_gap,
        strategy_mode=profile.strategy_mode,
    )


def build_risk_heatmap(profile: StartupProfile, competitors: list[CompetitorInput], metrics: MetricSummary) -> list[RiskItem]:
    competitor_density = min(100, 40 + len(competitors) * 12)
    feature_risk = round(_clamp(20 + metrics.feature_gap * 18, 5, 95))
    pricing_risk = round(_clamp(30 + max(metrics.pricing_gap_pct, 0) * 1.6, 5, 95))
    churn_risk = round(_clamp(25 + max(0, 55 - metrics.demand_score), 5, 95))
    market_fit_risk = round(_clamp(20 + abs(metrics.demand_change_pct) * 0.35, 5, 95))

    return [
        RiskItem(
            name="Pricing",
            score=pricing_risk,
            level=_risk_level(pricing_risk),
            reason=f"Your price is {metrics.pricing_gap_pct}% versus the competitor baseline.",
        ),
        RiskItem(
            name="Features",
            score=feature_risk,
            level=_risk_level(feature_risk),
            reason=f"You are behind by roughly {metrics.feature_gap} feature(s) compared with rivals.",
        ),
        RiskItem(
            name="Competition",
            score=competitor_density,
            level=_risk_level(competitor_density),
            reason=f"{len(competitors)} tracked competitors are putting pressure on positioning.",
        ),
        RiskItem(
            name="Market Fit",
            score=market_fit_risk,
            level=_risk_level(market_fit_risk),
            reason="Demand responsiveness suggests how strongly the market is validating your offer.",
        ),
        RiskItem(
            name="Churn",
            score=churn_risk,
            level=_risk_level(churn_risk),
            reason="Lower demand scores usually correlate with weaker retention and conversion quality.",
        ),
    ]


def fallback_recommendations(profile: StartupProfile, metrics: MetricSummary) -> list[RecommendationItem]:
    items: list[RecommendationItem] = []

    if metrics.pricing_gap_pct > 5:
        items.append(
            RecommendationItem(
                title="Reduce pricing pressure",
                impact="High",
                description="Trim price closer to the market midpoint to unlock more demand without changing acquisition strategy.",
                why="The model sees an above-market price as the biggest drag on demand.",
                data_support=f"Current pricing is {metrics.pricing_gap_pct}% above the competitor baseline.",
            )
        )

    if metrics.feature_gap > 0:
        items.append(
            RecommendationItem(
                title="Close the feature gap",
                impact="Medium",
                description="Add one high-signal feature that improves competitive parity before expanding into adjacent bets.",
                why="Feature parity is affecting perceived value and lowering conversion confidence.",
                data_support=f"You trail the tracked competitor set by about {metrics.feature_gap} feature(s).",
            )
        )

    if profile.strategy_mode == "Growth":
        items.append(
            RecommendationItem(
                title="Lean into demand capture",
                impact="High",
                description="Keep pricing accessible and put more budget into acquisition experiments over the next 30 days.",
                why="Growth mode favors share capture over short-term margin.",
                data_support=f"Demand score is {metrics.demand_score}, which supports expansion if CAC remains under control.",
            )
        )
    elif profile.strategy_mode == "Profit":
        items.append(
            RecommendationItem(
                title="Monetize premium value",
                impact="Medium",
                description="Bundle your strongest features and defend margin with a clearer premium narrative.",
                why="Profit mode can support higher ARPU if value communication improves.",
                data_support=f"Revenue is projected at ${metrics.revenue:,.0f} with a demand score of {metrics.demand_score}.",
            )
        )

    if not items:
        items.append(
            RecommendationItem(
                title="Hold the current strategy",
                impact="Low",
                description="Your positioning is reasonably balanced. Focus on validation and tight execution.",
                why="No major outlier is distorting risk or revenue right now.",
                data_support=f"Risk score is {metrics.risk_score} and demand score is {metrics.demand_score}.",
            )
        )

    return items[:3]


def fallback_explanations(profile: StartupProfile, metrics: MetricSummary) -> list[ExplanationItem]:
    return [
        ExplanationItem(
            question="Why this pricing suggestion?",
            answer="Price is being compared against the competitor baseline and weighed against its likely impact on demand.",
            evidence=[
                f"Pricing gap: {metrics.pricing_gap_pct}%",
                f"Demand score: {metrics.demand_score}",
                f"Revenue projection: ${metrics.revenue:,.0f}",
            ],
        ),
        ExplanationItem(
            question="What data supports the feature recommendation?",
            answer="The recommendation is driven by your enabled feature count relative to the competitor set.",
            evidence=[
                f"Enabled features: {len(profile.enabled_features)}",
                f"Feature gap: {metrics.feature_gap}",
                f"Strategy mode: {profile.strategy_mode}",
            ],
        ),
    ]


def fallback_tasks(profile: StartupProfile, metrics: MetricSummary) -> list[ActionTask]:
    return [
        ActionTask(
            title="Review pricing experiment and ship a new offer test",
            deadline_days=7,
            priority="High" if metrics.pricing_gap_pct > 5 else "Medium",
        ),
        ActionTask(
            title="Prioritize the next customer-facing feature in the roadmap",
            deadline_days=14,
            priority="Medium",
        ),
        ActionTask(
            title=f"Run a {profile.strategy_mode.lower()} strategy check-in with the team",
            deadline_days=5,
            priority="Low",
        ),
    ]


def build_competitor_view(profile: StartupProfile, competitors: list[CompetitorInput], metrics: MetricSummary) -> CompetitorView:
    companies = [
        CompetitorInput(
            name=profile.startup_name,
            price=profile.current_price,
            users=profile.monthly_users,
            features=profile.enabled_features,
            positioning="Your Startup",
            score=round(100 - metrics.risk_score / 1.4),
        )
    ]
    companies.extend(competitors)

    gaps: list[CompetitorGap] = []
    if metrics.pricing_gap_pct > 5:
        gaps.append(
            CompetitorGap(
                type="warning",
                title="Overpricing risk",
                description=f"You are priced {metrics.pricing_gap_pct}% above the competitor baseline.",
            )
        )
    if metrics.feature_gap > 0:
        gaps.append(
            CompetitorGap(
                type="missing",
                title="Feature gap detected",
                description=f"Competitors offer roughly {metrics.feature_gap} more feature(s) on average.",
            )
        )
    gaps.append(
        CompetitorGap(
            type="opportunity",
            title="Mid-market opportunity",
            description="A strong explanation layer plus competitive pricing can differentiate you beyond raw feature count.",
        )
    )

    return CompetitorView(companies=companies, gaps=gaps)


def evaluate_scenario(profile: StartupProfile, scenario: ScenarioInput, competitors: list[CompetitorInput]) -> ScenarioResult:
    scenario_profile = profile.model_copy(
        update={
            "current_price": scenario.price,
            "marketing_budget": scenario.marketing_budget,
            "enabled_features": scenario.enabled_features,
            "strategy_mode": scenario.strategy_mode,
        }
    )
    metrics = calculate_metrics(scenario_profile, competitors)
    return ScenarioResult(
        name=scenario.name,
        price=scenario.price,
        demand=metrics.demand_units,
        revenue=metrics.revenue,
        risk=metrics.risk_score,
        mode=scenario.strategy_mode,
        summary=f"{scenario.strategy_mode} mode projects {metrics.demand_units} users and ${metrics.revenue:,.0f} revenue.",
    )


def build_scenarios(profile: StartupProfile, scenarios: list[ScenarioInput], competitors: list[CompetitorInput]) -> list[ScenarioResult]:
    current_metrics = calculate_metrics(profile, competitors)
    results = [
        ScenarioResult(
            name="Current Strategy",
            price=profile.current_price,
            demand=current_metrics.demand_units,
            revenue=current_metrics.revenue,
            risk=current_metrics.risk_score,
            mode=profile.strategy_mode,
            summary="Current operating baseline.",
        )
    ]
    for item in scenarios:
        results.append(evaluate_scenario(profile, item, competitors))
    return results


def apply_decision(request: DecisionRequest) -> DecisionResponse:
    updated = deepcopy(request.profile.model_dump())

    if request.action == "increase_price":
        updated["current_price"] += request.amount or 5
    elif request.action == "decrease_price":
        updated["current_price"] = max(0, updated["current_price"] - (request.amount or 5))
    elif request.action == "increase_marketing":
        updated["marketing_budget"] += request.amount or 1000
    elif request.action == "decrease_marketing":
        updated["marketing_budget"] = max(0, updated["marketing_budget"] - (request.amount or 1000))
    elif request.action == "add_feature" and request.feature_name:
        feature_set = set(updated["enabled_features"])
        feature_set.add(request.feature_name)
        updated["enabled_features"] = sorted(feature_set)
    elif request.action == "remove_feature" and request.feature_name:
        updated["enabled_features"] = [
            item for item in updated["enabled_features"] if item != request.feature_name
        ]

    before = calculate_metrics(request.profile, [])
    after_profile = StartupProfile(**updated)
    after = calculate_metrics(after_profile, [])

    demand_delta = round(after.demand_change_pct - before.demand_change_pct, 1)
    revenue_delta = round(after.revenue_change_pct - before.revenue_change_pct, 1)

    return DecisionResponse(
        action=request.action,
        summary=f"Demand changes by {demand_delta:+.1f}% and revenue changes by {revenue_delta:+.1f}% after this decision.",
        before=before,
        after=after,
        delta={
            "demand_change_pct": demand_delta,
            "revenue_change_pct": revenue_delta,
            "risk_score": after.risk_score - before.risk_score,
        },
    )