import { DollarSign, TrendingUp, ShieldAlert, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { StatCard } from "@/components/StatCard";
import { useIntelligence } from "@/context/IntelligenceContext";

export default function DashboardLive() {
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const { analysis, isLoading, error } = useIntelligence();

  if (!analysis && isLoading) {
    return <div className="text-sm text-muted-foreground">Loading intelligence...</div>;
  }

  if (!analysis && error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (!analysis) {
    return null;
  }

  const riskData = analysis.risk_heatmap.map((item) => ({
    ...item,
    risk: item.score,
    color: item.level === "high" ? "hsl(0, 72%, 51%)" : item.level === "medium" ? "hsl(38, 92%, 50%)" : "hsl(142, 71%, 45%)",
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your startup intelligence at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Projected Revenue" value={`$${(analysis.metrics.revenue / 1000).toFixed(0)}K`} change={`${analysis.metrics.revenue_change_pct >= 0 ? "+" : ""}${analysis.metrics.revenue_change_pct}% vs baseline`} changeType={analysis.metrics.revenue_change_pct >= 0 ? "positive" : "negative"} icon={DollarSign} />
        <StatCard title="Demand Score" value={`${analysis.metrics.demand_score}/100`} change={`${analysis.metrics.demand_change_pct >= 0 ? "+" : ""}${analysis.metrics.demand_change_pct}% demand`} changeType={analysis.metrics.demand_change_pct >= 0 ? "positive" : "negative"} icon={TrendingUp} />
        <StatCard title="Risk Score" value={`${analysis.metrics.risk_score}/100`} change={analysis.risk_heatmap[0]?.level ?? "safe"} changeType="neutral" icon={ShieldAlert} />
        <StatCard title="Key Insights" value={`${analysis.recommendations.length} live`} change={`${analysis.action_tasks.length} actionable`} changeType="positive" icon={Lightbulb} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Key Insights</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium">Pricing Recommendation</p>
              <p className="text-sm text-muted-foreground mt-1">Competitor gap is <span className="font-semibold text-foreground">{analysis.metrics.pricing_gap_pct}%</span> versus market baseline.</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/10">
              <p className="text-sm font-medium">Feature Optimization</p>
              <p className="text-sm text-muted-foreground mt-1">Feature gap currently sits at <span className="font-semibold text-foreground">{analysis.metrics.feature_gap}</span> against tracked competitors.</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
              <p className="text-sm font-medium">Strategy Summary</p>
              <p className="text-sm text-muted-foreground mt-1">{analysis.strategy_summary}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Risk Heatmap</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} />
              <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 animate-fade-in">
        <h2 className="font-semibold mb-4">AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setExpandedRec(expandedRec === i ? null : i)}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{rec.title}</p>
                {expandedRec === i ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              </div>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${rec.impact === "High" ? "bg-primary/10 text-primary" : rec.impact === "Medium" ? "bg-warning/10 text-warning" : "bg-secondary text-secondary-foreground"}`}>
                {rec.impact} Impact
              </span>
              {expandedRec === i && (
                <div className="space-y-2 mt-3 animate-fade-in text-sm text-muted-foreground">
                  <p>{rec.description}</p>
                  <p><span className="font-medium text-foreground">Why:</span> {rec.why}</p>
                  <p><span className="font-medium text-foreground">Data:</span> {rec.data_support}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 animate-fade-in">
        <h2 className="font-semibold mb-4">Why Engine</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.explanations.map((item) => (
            <div key={item.question} className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">{item.question}</p>
              <p className="text-sm text-muted-foreground mt-2">{item.answer}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.evidence.map((evidence) => (
                  <span key={evidence} className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {evidence}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
