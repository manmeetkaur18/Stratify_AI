import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Scenario {
  id: number;
  name: string;
  price: number;
  demand: number;
  revenue: number;
  risk: number;
  mode: string;
}

const initialScenarios: Scenario[] = [
  { id: 1, name: "Current Strategy", price: 35, demand: 78, revenue: 142, risk: 42, mode: "Balanced" },
  { id: 2, name: "Aggressive Growth", price: 19, demand: 95, revenue: 108, risk: 65, mode: "Growth" },
  { id: 3, name: "Premium Play", price: 49, demand: 52, revenue: 155, risk: 38, mode: "Profit" },
];

const strategyModes = ["Growth", "Profit", "Balanced"] as const;

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
  const [activeMode, setActiveMode] = useState<string>("Balanced");

  const addScenario = () => {
    const id = Date.now();
    setScenarios([...scenarios, {
      id,
      name: `Scenario ${scenarios.length + 1}`,
      price: 25 + Math.round(Math.random() * 30),
      demand: 50 + Math.round(Math.random() * 40),
      revenue: 80 + Math.round(Math.random() * 100),
      risk: 20 + Math.round(Math.random() * 60),
      mode: activeMode,
    }]);
  };

  const removeScenario = (id: number) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const riskColor = (risk: number) =>
    risk < 40 ? "text-success" : risk < 60 ? "text-warning" : "text-destructive";

  const modeAdvice: Record<string, string> = {
    Growth: "Prioritize user acquisition. Accept lower margins for faster scale. Recommended: lower pricing, higher marketing spend, freemium features.",
    Profit: "Maximize revenue per user. Focus on premium features and upsells. Recommended: higher pricing, enterprise features, reduced acquisition spend.",
    Balanced: "Optimize for sustainable growth. Balance acquisition cost with LTV. Recommended: competitive pricing with strong retention features.",
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scenarios</h1>
          <p className="text-muted-foreground text-sm mt-1">Compare strategies side by side</p>
        </div>
        <Button onClick={addScenario}><Plus className="mr-2 h-4 w-4" /> Add Scenario</Button>
      </div>

      {/* Strategy Mode */}
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="font-semibold mb-3">Strategy Mode</h2>
        <div className="flex gap-2 mb-4">
          {strategyModes.map((mode) => (
            <Button
              key={mode}
              variant={activeMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{modeAdvice[activeMode]}</p>
      </div>

      {/* Scenarios Table */}
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
              {scenarios.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4">${s.price}/mo</td>
                  <td className="p-4">{s.demand}/100</td>
                  <td className="p-4">${s.revenue}K</td>
                  <td className="p-4">
                    <span className={`font-semibold ${riskColor(s.risk)}`}>{s.risk}/100</span>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{s.mode}</Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" onClick={() => removeScenario(s.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
