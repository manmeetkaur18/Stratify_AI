import { DollarSign, TrendingUp, ShieldAlert, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const riskData = [
  { name: "Pricing", risk: 35, color: "hsl(142, 71%, 45%)" },
  { name: "Features", risk: 62, color: "hsl(38, 92%, 50%)" },
  { name: "Competition", risk: 78, color: "hsl(0, 72%, 51%)" },
  { name: "Market Fit", risk: 25, color: "hsl(142, 71%, 45%)" },
  { name: "Churn", risk: 55, color: "hsl(38, 92%, 50%)" },
];

const recommendations = [
  {
    title: "Lower pricing by 12%",
    description: "Market analysis suggests your pricing is above the competitive median. A 12% reduction could increase demand by ~23%.",
    impact: "High",
  },
  {
    title: "Add API integration feature",
    description: "67% of competitors offer API integrations. Adding this feature could capture an underserved segment worth $2.1M ARR.",
    impact: "Medium",
  },
  {
    title: "Shift to annual billing",
    description: "Annual billing reduces churn by 15-20% and improves cash flow predictability. Consider offering a 20% discount for annual plans.",
    impact: "High",
  },
];

export default function Dashboard() {
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your startup intelligence at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Projected Revenue" value="$142K" change="+12.5% vs last month" changeType="positive" icon={DollarSign} />
        <StatCard title="Demand Score" value="78/100" change="+5 points" changeType="positive" icon={TrendingUp} />
        <StatCard title="Risk Score" value="42/100" change="Moderate" changeType="neutral" icon={ShieldAlert} />
        <StatCard title="Key Insights" value="7 new" change="3 actionable" changeType="positive" icon={Lightbulb} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Key Insights</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium">Pricing Recommendation</p>
              <p className="text-sm text-muted-foreground mt-1">Optimal price point: <span className="font-semibold text-foreground">$29/mo</span> (currently $35/mo)</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/10">
              <p className="text-sm font-medium">Feature Optimization</p>
              <p className="text-sm text-muted-foreground mt-1">Adding collaboration features could increase retention by <span className="font-semibold text-foreground">18%</span></p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
              <p className="text-sm font-medium">Strategy Summary</p>
              <p className="text-sm text-muted-foreground mt-1">Growth mode recommended — market conditions favor aggressive expansion</p>
            </div>
          </div>
        </div>

        {/* Risk Heatmap */}
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Risk Heatmap</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }}
              />
              <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="font-semibold mb-4">AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setExpandedRec(expandedRec === i ? null : i)}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{rec.title}</p>
                {expandedRec === i ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              </div>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${rec.impact === "High" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>
                {rec.impact} Impact
              </span>
              {expandedRec === i && (
                <p className="text-sm text-muted-foreground mt-3 animate-fade-in">{rec.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
