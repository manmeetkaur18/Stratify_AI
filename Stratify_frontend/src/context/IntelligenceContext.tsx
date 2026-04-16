import { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_COMPETITORS,
  DEFAULT_PROFILE,
  DEFAULT_SCENARIOS,
  type CompetitorInput,
  type IntelligenceResponse,
  type ScenarioInput,
  type StartupProfile,
  fetchIntelligence,
  simulateDecision,
} from "@/lib/api";

interface IntelligenceContextValue {
  profile: StartupProfile;
  competitors: CompetitorInput[];
  scenarios: ScenarioInput[];
  analysis: IntelligenceResponse | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (updater: StartupProfile | ((current: StartupProfile) => StartupProfile)) => void;
  setCompetitors: (competitors: CompetitorInput[]) => void;
  setScenarios: (scenarios: ScenarioInput[]) => void;
  runAnalysis: () => Promise<IntelligenceResponse | null>;
  runDecision: (payload: { action: string; amount?: number; feature_name?: string }) => Promise<{
    summary: string;
    delta: { demand_change_pct: number; revenue_change_pct: number; risk_score: number };
  }>;
}

const STORAGE_KEY = "stratify-intelligence-profile";

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

function readStoredState() {
  const fallback = {
    profile: DEFAULT_PROFILE,
    competitors: DEFAULT_COMPETITORS,
    scenarios: DEFAULT_SCENARIOS,
  };

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as typeof fallback;
  } catch {
    return fallback;
  }
}

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<StartupProfile>(DEFAULT_PROFILE);
  const [competitors, setCompetitors] = useState<CompetitorInput[]>(DEFAULT_COMPETITORS);
  const [scenarios, setScenarios] = useState<ScenarioInput[]>(DEFAULT_SCENARIOS);
  const [analysis, setAnalysis] = useState<IntelligenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredState();
    setProfileState(stored.profile);
    setCompetitors(stored.competitors);
    setScenarios(stored.scenarios);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile, competitors, scenarios }),
    );
  }, [profile, competitors, scenarios]);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchIntelligence({ profile, competitors, scenarios });
      setAnalysis(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void runAnalysis();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [profile, competitors, scenarios]);

  const setProfile = (updater: StartupProfile | ((current: StartupProfile) => StartupProfile)) => {
    setProfileState((current) =>
      typeof updater === "function" ? (updater as (value: StartupProfile) => StartupProfile)(current) : updater,
    );
  };

  const runDecision = async (payload: { action: string; amount?: number; feature_name?: string }) => {
    const result = await simulateDecision({
      profile,
      ...payload,
    });
    return {
      summary: result.summary,
      delta: result.delta,
    };
  };

  return (
    <IntelligenceContext.Provider
      value={{
        profile,
        competitors,
        scenarios,
        analysis,
        isLoading,
        error,
        setProfile,
        setCompetitors,
        setScenarios,
        runAnalysis,
        runDecision,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error("useIntelligence must be used inside IntelligenceProvider");
  }
  return context;
}
