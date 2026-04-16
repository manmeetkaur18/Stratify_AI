import { AlertTriangle, TrendingUp, XCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { useIntelligence } from "@/context/IntelligenceContext";

export default function CompetitorsLive() {
  const { analysis } = useIntelligence();

  if (!analysis) {
    return <div className="text-sm text-muted-foreground">Loading competitor analysis...</div>;
  }

  const [you, ...others] = analysis.competitors.companies;
  const compareA = others[0];
  const compareB = others[1];
  const compareC = others[2];

  const radarData = [
    { metric: "Price", you: Math.max(15, 100 - analysis.metrics.pricing_gap_pct), compA: compareA?.score ?? 60, compB: compareB?.score ?? 60, compC: compareC?.score ?? 60 },
    { metric: "Features", you: Math.max(20, 85 - analysis.metrics.feature_gap * 10), compA: 80, compB: 40, compC: 95 },
    { metric: "Demand", you: analysis.metrics.demand_score, compA: 78, compB: 82, compC: 74 },
    { metric: "Support", you: Math.max(30, 100 - analysis.metrics.risk_score / 1.4), compA: 65, compB: 70, compC: 80 },
    { metric: "Scale", you: Math.min(95, analysis.metrics.demand_score + 12), compA: 85, compB: 90, compC: 75 },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Competitor Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">Understand your competitive landscape</p>
      </div>

      <div className="glass-card overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-4 font-medium">Company</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Users</th>
                <th className="text-left p-4 font-medium">Features</th>
                <th className="text-left p-4 font-medium">Positioning</th>
                <th className="text-left p-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {analysis.competitors.companies.map((company, index) => (
                <tr key={company.name} className={`border-b last:border-0 ${index === 0 ? "bg-primary/5" : ""}`}>
                  <td className="p-4 font-medium">{company.name}</td>
                  <td className="p-4">${company.price}/mo</td>
                  <td className="p-4">{company.users.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {company.features.map((feature) => (
                        <span key={feature} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{feature}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">{company.positioning}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${company.score ?? 0}%` }} />
                      </div>
                      <span className="text-xs font-medium">{company.score ?? 0}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Visual Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220, 13%, 91%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="You" dataKey="you" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.15} strokeWidth={2} />
              <Radar name={compareA?.name ?? "Comp A"} dataKey="compA" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.05} strokeWidth={1.5} />
              <Radar name={compareC?.name ?? "Comp C"} dataKey="compC" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.05} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Gaps & AI Insights</h2>
          <div className="space-y-3">
            {analysis.competitors.gaps.map((gap) => (
              <div key={gap.title} className={`p-3 rounded-lg border ${gap.type === "warning" ? "border-warning/20 bg-warning/5" : gap.type === "missing" ? "border-destructive/20 bg-destructive/5" : "border-primary/20 bg-primary/5"}`}>
                <div className="flex items-start gap-2">
                  {gap.type === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  ) : gap.type === "missing" ? (
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{gap.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
