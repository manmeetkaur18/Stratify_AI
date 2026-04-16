import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const features = [
  { id: "api", label: "API Integration", default: true },
  { id: "collab", label: "Collaboration", default: false },
  { id: "analytics", label: "Advanced Analytics", default: true },
  { id: "sso", label: "SSO / Enterprise Auth", default: false },
  { id: "mobile", label: "Mobile App", default: false },
];

export default function Playground() {
  const [price, setPrice] = useState(35);
  const [marketingBudget, setMarketingBudget] = useState(5000);
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(features.map((f) => [f.id, f.default]))
  );
  const { toast } = useToast();

  const enabledCount = Object.values(featureToggles).filter(Boolean).length;

  const demandChange = useMemo(() => {
    const priceFactor = ((35 - price) / 35) * 40;
    const marketingFactor = ((marketingBudget - 5000) / 5000) * 15;
    const featureFactor = (enabledCount - 2) * 5;
    return Math.round(priceFactor + marketingFactor + featureFactor);
  }, [price, marketingBudget, enabledCount]);

  const revenueImpact = useMemo(() => {
    const baseRevenue = 142000;
    const demandMultiplier = 1 + demandChange / 100;
    const priceRatio = price / 35;
    return Math.round(baseRevenue * demandMultiplier * priceRatio);
  }, [price, demandChange]);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const growth = 1 + (demandChange / 100) * (month / 12);
      return {
        month: `M${month}`,
        revenue: Math.round((revenueImpact * growth) / 1000),
        demand: Math.round(78 * (1 + demandChange / 200) * (1 + month * 0.02)),
      };
    });
  }, [demandChange, revenueImpact]);

  const priceVsDemand = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const p = 10 + i * 5;
      const demand = Math.round(100 - (p - 10) * 1.5 + enabledCount * 3);
      return { price: `$${p}`, demand: Math.max(10, demand) };
    });
  }, [enabledCount]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Decision Playground</h1>
        <p className="text-muted-foreground text-sm mt-1">Simulate decisions and see real-time impact</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-card p-6 space-y-6 animate-fade-in">
          <h2 className="font-semibold">Controls</h2>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Price Point</label>
              <span className="text-sm font-bold text-primary">${price}/mo</span>
            </div>
            <Slider value={[price]} onValueChange={([v]) => setPrice(v)} min={10} max={100} step={1} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Marketing Budget</label>
              <span className="text-sm font-bold text-primary">${marketingBudget.toLocaleString()}</span>
            </div>
            <Slider value={[marketingBudget]} onValueChange={([v]) => setMarketingBudget(v)} min={1000} max={50000} step={500} />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Feature Toggles</label>
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <span className="text-sm">{f.label}</span>
                  <Switch
                    checked={featureToggles[f.id]}
                    onCheckedChange={(checked) => setFeatureToggles((prev) => ({ ...prev, [f.id]: checked }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => toast({ title: "Decision Applied", description: `Price: $${price}/mo, Budget: $${marketingBudget.toLocaleString()}, Features: ${enabledCount}` })}
          >
            <Zap className="mr-2 h-4 w-4" /> Apply Decision
          </Button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Impact metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card animate-fade-in">
              <p className="text-sm text-muted-foreground">Demand Change</p>
              <p className={`text-3xl font-bold mt-1 ${demandChange >= 0 ? "text-success" : "text-destructive"}`}>
                {demandChange >= 0 ? "+" : ""}{demandChange}%
              </p>
            </div>
            <div className="stat-card animate-fade-in">
              <p className="text-sm text-muted-foreground">Projected Revenue</p>
              <p className="text-3xl font-bold mt-1">${(revenueImpact / 1000).toFixed(0)}K</p>
              <p className={`text-sm ${revenueImpact >= 142000 ? "text-success" : "text-destructive"}`}>
                {revenueImpact >= 142000 ? "+" : ""}{((revenueImpact / 142000 - 1) * 100).toFixed(1)}% vs current
              </p>
            </div>
          </div>

          {/* Charts */}
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
                  <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} formatter={(v: number) => [`$${v}K`, "Revenue"]} />
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
