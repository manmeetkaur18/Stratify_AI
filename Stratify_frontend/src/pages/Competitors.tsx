import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

const competitors = [
  { name: "Your Startup", price: "$35/mo", users: "2.4K", features: ["Analytics", "API", "Dashboard"], positioning: "Mid-market", score: 72 },
  { name: "CompetitorA", price: "$29/mo", users: "12K", features: ["Analytics", "API", "Collaboration", "SSO"], positioning: "Enterprise", score: 85 },
  { name: "CompetitorB", price: "$19/mo", users: "45K", features: ["Dashboard", "Mobile"], positioning: "SMB", score: 68 },
  { name: "CompetitorC", price: "$49/mo", users: "8K", features: ["Analytics", "API", "SSO", "Mobile", "Collaboration"], positioning: "Enterprise", score: 91 },
];

const radarData = [
  { metric: "Price", you: 65, compA: 78, compB: 90, compC: 45 },
  { metric: "Features", you: 55, compA: 80, compB: 40, compC: 95 },
  { metric: "UX", you: 80, compA: 70, compB: 85, compC: 60 },
  { metric: "Support", you: 75, compA: 65, compB: 70, compC: 80 },
  { metric: "Scale", you: 45, compA: 85, compB: 90, compC: 75 },
];

const gaps = [
  { type: "warning", title: "Overpricing Risk", description: "Your price ($35) is 20% above CompetitorB ($19) targeting the same SMB segment." },
  { type: "missing", title: "Missing: Collaboration", description: "2 of 3 competitors offer collaboration tools. This is becoming a table-stakes feature." },
  { type: "missing", title: "Missing: Mobile App", description: "CompetitorB's mobile app is cited in 34% of positive reviews. Consider prioritizing." },
];

export default function Competitors() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Competitor Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">Understand your competitive landscape</p>
      </div>

      {/* Comparison Table */}
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
              {competitors.map((c, i) => (
                <tr key={i} className={`border-b last:border-0 ${i === 0 ? "bg-primary/5" : ""}`}>
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">{c.price}</td>
                  <td className="p-4">{c.users}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {c.features.map((f) => (
                        <span key={f} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">{c.positioning}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${c.score}%` }} />
                      </div>
                      <span className="text-xs font-medium">{c.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Visual Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220, 13%, 91%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="You" dataKey="you" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Comp A" dataKey="compA" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.05} strokeWidth={1.5} />
              <Radar name="Comp C" dataKey="compC" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.05} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Gaps & Insights */}
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Gaps & AI Insights</h2>
          <div className="space-y-3">
            {gaps.map((g, i) => (
              <div key={i} className={`p-3 rounded-lg border ${g.type === "warning" ? "border-warning/20 bg-warning/5" : "border-destructive/20 bg-destructive/5"}`}>
                <div className="flex items-start gap-2">
                  {g.type === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{g.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{g.description}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">AI Insight</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Positioning between CompetitorB (SMB) and CompetitorA (Enterprise) leaves a mid-market opportunity. Focus on features that enterprise needs at SMB pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
