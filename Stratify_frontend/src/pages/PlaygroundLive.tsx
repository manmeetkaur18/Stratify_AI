import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Zap, TrendingUp, TrendingDown, MinusCircle, PlusCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIntelligence } from "@/context/IntelligenceContext";

const featureCatalog = ["Analytics", "API", "Dashboard", "Collaboration", "SSO", "Mobile"];

export default function PlaygroundLive() {
  const { profile, analysis, setProfile, runDecision } = useIntelligence();
  const { toast } = useToast();

  const chartData = useMemo(() => {
    const demandBase = analysis?.metrics.demand_units ?? 0;
    const revenueBase = analysis?.metrics.revenue ?? 0;
    return Array.from({ length: 12 }, (_, index) => ({
      month: `M${index + 1}`,
      revenue: Math.round((revenueBase * (1 + index * 0.025)) / 1000),
      demand: Math.round(demandBase * (1 + index * 0.015)),
    }));
  }, [analysis]);

  const priceVsDemand = useMemo(() => {
    const baseFeatures = profile.enabled_features.length;
    return Array.from({ length: 11 }, (_, index) => {
      const candidatePrice = 10 + index * 5;
      const pricePenalty = ((candidatePrice - profile.competitor_price) / Math.max(profile.competitor_price, 1)) * 18;
      const demand = Math.max(8, Math.round(76 + baseFeatures * 3 - pricePenalty));
      return { price: `$${candidatePrice}`, demand };
    });
  }, [profile.competitor_price, profile.enabled_features.length]);

  const runDecisionAction = async (action: string, amount?: number, feature_name?: string) => {
    try {
      const result = await runDecision({ action, amount, feature_name });
      toast({
        title: "Decision simulated",
        description: `${result.summary} Risk delta: ${result.delta.risk_score >= 0 ? "+" : ""}${result.delta.risk_score}`,
      });
    } catch (error) {
      toast({
        title: "Decision failed",
        description: error instanceof Error ? error.message : "Could not simulate the decision",
        variant: "destructive",
      });
    }
  };

  if (!analysis) {
    return <div className="text-sm text-muted-foreground">Loading playground...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Decision Playground</h1>
        <p className="text-muted-foreground text-sm mt-1">Simulate decisions and see real-time impact</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-6 animate-fade-in">
          <h2 className="font-semibold">Controls</h2>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Price Point</label>
              <span className="text-sm font-bold text-primary">${profile.current_price}/mo</span>
            </div>
            <Slider value={[profile.current_price]} onValueChange={([value]) => setProfile((current) => ({ ...current, current_price: value }))} min={10} max={100} step={1} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Marketing Budget</label>
              <span className="text-sm font-bold text-primary">${profile.marketing_budget.toLocaleString()}</span>
            </div>
            <Slider value={[profile.marketing_budget]} onValueChange={([value]) => setProfile((current) => ({ ...current, marketing_budget: value }))} min={1000} max={50000} step={500} />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Feature Toggles</label>
            <div className="space-y-3">
              {featureCatalog.map((feature) => (
                <div key={feature} className="flex items-center justify-between">
                  <span className="text-sm">{feature}</span>
                  <Switch
                    checked={profile.enabled_features.includes(feature)}
                    onCheckedChange={(checked) =>
                      setProfile((current) => ({
                        ...current,
                        enabled_features: checked
                          ? Array.from(new Set([...current.enabled_features, feature]))
                          : current.enabled_features.filter((item) => item !== feature),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => runDecisionAction("increase_price", 5)}>
              <TrendingUp className="mr-2 h-4 w-4" /> Increase Price
            </Button>
            <Button variant="outline" onClick={() => runDecisionAction("decrease_price", 5)}>
              <TrendingDown className="mr-2 h-4 w-4" /> Lower Price
            </Button>
            <Button variant="outline" onClick={() => runDecisionAction("remove_feature", undefined, profile.enabled_features.at(-1))} disabled={profile.enabled_features.length === 0}>
              <MinusCircle className="mr-2 h-4 w-4" /> Remove Feature
            </Button>
            <Button variant="outline" onClick={() => runDecisionAction("add_feature", undefined, featureCatalog.find((feature) => !profile.enabled_features.includes(feature)) ?? "Collaboration")}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Feature
            </Button>
          </div>

          <Button className="w-full" onClick={() => toast({ title: "Decision applied", description: analysis.strategy_summary })}>
            <Zap className="mr-2 h-4 w-4" /> Apply Decision
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card animate-fade-in">
              <p className="text-sm text-muted-foreground">Demand Change</p>
              <p className={`text-3xl font-bold mt-1 ${analysis.metrics.demand_change_pct >= 0 ? "text-success" : "text-destructive"}`}>
                {analysis.metrics.demand_change_pct >= 0 ? "+" : ""}{analysis.metrics.demand_change_pct}%
              </p>
            </div>
            <div className="stat-card animate-fade-in">
              <p className="text-sm text-muted-foreground">Projected Revenue</p>
              <p className="text-3xl font-bold mt-1">${(analysis.metrics.revenue / 1000).toFixed(0)}K</p>
              <p className={`text-sm ${analysis.metrics.revenue_change_pct >= 0 ? "text-success" : "text-destructive"}`}>
                {analysis.metrics.revenue_change_pct >= 0 ? "+" : ""}{analysis.metrics.revenue_change_pct}% vs baseline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-sm font-semibold mb-4">Price vs Demand</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={priceVsDemand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="price" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="demand" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-sm font-semibold mb-4">Revenue Projection (12mo)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} formatter={(value: number) => [`$${value}K`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
