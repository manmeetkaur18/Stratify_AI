export type StrategyMode = "Growth" | "Profit" | "Balanced";

export interface StartupProfile {
  startup_name: string;
  industry: string;
  target_audience: string;
  current_price: number;
  competitor_price: number;
  monthly_users: number;
  marketing_budget: number;
  enabled_features: string[];
  strategy_mode: StrategyMode;
  timeframe_days: number;
}

export interface CompetitorInput {
  name: string;
  price: number;
  users: number;
  features: string[];
  positioning: string;
  score?: number | null;
}

export interface ScenarioInput {
  name: string;
  price: number;
  marketing_budget: number;
  enabled_features: string[];
  strategy_mode: StrategyMode;
}

export interface IntelligenceRequest {
  profile: StartupProfile;
  competitors: CompetitorInput[];
  scenarios: ScenarioInput[];
}

export interface MetricSummary {
  demand_score: number;
  demand_units: number;
  demand_change_pct: number;
  revenue: number;
  revenue_change_pct: number;
  risk_score: number;
  pricing_gap_pct: number;
  feature_gap: number;
  strategy_mode: StrategyMode;
}

export interface RiskItem {
  name: string;
  score: number;
  level: "high" | "medium" | "safe";
  reason: string;
}

export interface RecommendationItem {
  title: string;
  impact: "High" | "Medium" | "Low";
  description: string;
  why: string;
  data_support: string;
}

export interface ExplanationItem {
  question: string;
  answer: string;
  evidence: string[];
}

export interface ActionTask {
  title: string;
  owner: string;
  deadline_days: number;
  priority: "High" | "Medium" | "Low";
}

export interface CompetitorGap {
  type: "warning" | "missing" | "opportunity";
  title: string;
  description: string;
}

export interface CompetitorView {
  companies: CompetitorInput[];
  gaps: CompetitorGap[];
}

export interface ScenarioResult {
  name: string;
  price: number;
  demand: number;
  revenue: number;
  risk: number;
  mode: StrategyMode;
  summary: string;
}

export interface IntelligenceResponse {
  llm_enabled: boolean;
  profile: StartupProfile;
  metrics: MetricSummary;
  risk_heatmap: RiskItem[];
  recommendations: RecommendationItem[];
  explanations: ExplanationItem[];
  action_tasks: ActionTask[];
  competitors: CompetitorView;
  scenarios: ScenarioResult[];
  strategy_summary: string;
}

export interface DecisionResponse {
  action: string;
  summary: string;
  before: MetricSummary;
  after: MetricSummary;
  delta: {
    demand_change_pct: number;
    revenue_change_pct: number;
    risk_score: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export const DEFAULT_PROFILE: StartupProfile = {
  startup_name: "My Startup",
  industry: "saas",
  target_audience: "SMBs",
  current_price: 35,
  competitor_price: 29,
  monthly_users: 2400,
  marketing_budget: 5000,
  enabled_features: ["Analytics", "API", "Dashboard"],
  strategy_mode: "Balanced",
  timeframe_days: 30,
};

export const DEFAULT_COMPETITORS: CompetitorInput[] = [
  {
    name: "CompetitorA",
    price: 29,
    users: 12000,
    features: ["Analytics", "API", "Collaboration", "SSO"],
    positioning: "Enterprise",
    score: 85,
  },
  {
    name: "CompetitorB",
    price: 19,
    users: 45000,
    features: ["Dashboard", "Mobile"],
    positioning: "SMB",
    score: 68,
  },
  {
    name: "CompetitorC",
    price: 49,
    users: 8000,
    features: ["Analytics", "API", "SSO", "Mobile", "Collaboration"],
    positioning: "Enterprise",
    score: 91,
  },
];

export const DEFAULT_SCENARIOS: ScenarioInput[] = [
  {
    name: "Aggressive Growth",
    price: 27,
    marketing_budget: 9000,
    enabled_features: ["Analytics", "API", "Dashboard", "Collaboration"],
    strategy_mode: "Growth",
  },
  {
    name: "Premium Play",
    price: 49,
    marketing_budget: 4000,
    enabled_features: ["Analytics", "API", "Dashboard", "SSO"],
    strategy_mode: "Profit",
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchIntelligence(payload: IntelligenceRequest) {
  return request<IntelligenceResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function simulateDecision(payload: {
  profile: StartupProfile;
  action: string;
  amount?: number;
  feature_name?: string;
}) {
  return request<DecisionResponse>("/decision-mode", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
