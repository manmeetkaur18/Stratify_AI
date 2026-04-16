import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIntelligence } from "@/context/IntelligenceContext";
import type { StrategyMode } from "@/lib/api";

const strategyModes: StrategyMode[] = ["Growth", "Profit", "Balanced"];

export default function ScenariosLive() {
  const { profile, analysis, scenarios, setProfile, setScenarios } = useIntelligence();

  const addScenario = () => {
    const nextMode = strategyModes[scenarios.length % strategyModes.length];
    setScenarios([
      ...scenarios,
      {
        name: `Scenario ${scenarios.length + 1}`,
        price: Math.max(10, profile.current_price + (nextMode === "Profit" ? 10 : nextMode === "Growth" ? -6 : 0)),
        marketing_budget: Math.max(1000, profile.marketing_budget + (nextMode === "Growth" ? 2500 : -500)),
        enabled_features: nextMode === "Growth" ? [...new Set([...profile.enabled_features, "Collaboration"])] : profile.enabled_features,
        strategy_mode: nextMode,
      },
    ]);
  };

  const removeScenario = (name: string) => {
    setScenarios(scenarios.filter((scenario) => scenario.name !== name));
  };

  const modeAdvice = useMemo<Record<StrategyMode, string>>(
    () => ({
      Growth: "Prioritize user acquisition. Accept lower margins for faster scale.",
      Profit: "Maximize revenue per user with stronger premium positioning.",
      Balanced: "Balance acquisition, retention, and healthy monetization.",
    }),
    [],
  );

  const riskColor = (risk: number) =>
    risk < 40 ? "text-success" : risk < 60 ? "text-warning" : "text-destructive";

  if (!analysis) {
    return <div className="text-sm text-muted-foreground">Loading scenarios...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scenarios</h1>
          <p className="text-muted-foreground text-sm mt-1">Compare strategies side by side</p>
        </div>
        <Button onClick={addScenario}><Plus className="mr-2 h-4 w-4" /> Add Scenario</Button>
      </div>

      <div className="glass-card p-6 animate-fade-in">
        <h2 className="font-semibold mb-3">Strategy Mode</h2>
        <div className="flex gap-2 mb-4">
          {strategyModes.map((mode) => (
            <Button
              key={mode}
              variant={profile.strategy_mode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setProfile((current) => ({ ...current, strategy_mode: mode }))}
            >
              {mode}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{modeAdvice[profile.strategy_mode]}</p>
      </div>

      <div className="glass-card overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-4 font-medium">Scenario</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Demand</th>
                <th className="text-left p-4 font-medium">Revenue</th>
                <th className="text-left p-4 font-medium">Risk</th>
                <th className="text-left p-4 font-medium">Mode</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {analysis.scenarios.map((scenario) => (
                <tr key={scenario.name} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-medium">
                    {scenario.name}
                    <p className="text-xs text-muted-foreground mt-1">{scenario.summary}</p>
                  </td>
                  <td className="p-4">${scenario.price}/mo</td>
                  <td className="p-4">{scenario.demand}</td>
                  <td className="p-4">${(scenario.revenue / 1000).toFixed(0)}K</td>
                  <td className="p-4">
                    <span className={`font-semibold ${riskColor(scenario.risk)}`}>{scenario.risk}/100</span>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{scenario.mode}</Badge>
                  </td>
                  <td className="p-4">
                    {scenario.name !== "Current Strategy" && (
                      <Button variant="ghost" size="icon" onClick={() => removeScenario(scenario.name)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
