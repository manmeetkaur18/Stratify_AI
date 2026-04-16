import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export default function SettingsPage() {
  const [startupName, setStartupName] = useState("My Startup");
  const [industry, setIndustry] = useState("saas");
  const [audience, setAudience] = useState("SMBs");
  const [currentPricing, setCurrentPricing] = useState("35");
  const [competitorPricing, setCompetitorPricing] = useState("29");
  const [monthlyUsers, setMonthlyUsers] = useState("2400");
  const [features, setFeatures] = useState<string[]>(["Analytics", "API", "Dashboard"]);
  const [featureInput, setFeatureInput] = useState("");
  const { toast } = useToast();

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (f: string) => setFeatures(features.filter((x) => x !== f));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your startup profile for AI analysis</p>
      </div>

      <div className="glass-card p-6 space-y-5 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Startup Name</Label>
            <Input id="name" value={startupName} onChange={(e) => setStartupName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="healthtech">Healthtech</SelectItem>
                <SelectItem value="edtech">Edtech</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="audience">Target Audience</Label>
          <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1.5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Current Pricing ($)</Label>
            <Input id="price" type="number" value={currentPricing} onChange={(e) => setCurrentPricing(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="compPrice">Competitor Pricing ($)</Label>
            <Input id="compPrice" type="number" value={competitorPricing} onChange={(e) => setCompetitorPricing(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="users">Monthly Users</Label>
            <Input id="users" type="number" value={monthlyUsers} onChange={(e) => setMonthlyUsers(e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div>
          <Label>Features</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              placeholder="Add a feature..."
            />
            <Button variant="outline" onClick={addFeature}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {features.map((f) => (
              <Badge key={f} variant="secondary" className="gap-1">
                {f}
                <button onClick={() => removeFeature(f)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => toast({ title: "Analysis Running", description: "Your startup profile has been updated and analysis is being recalculated." })}
        >
          Run Analysis
        </Button>
      </div>
    </div>
  );
}
