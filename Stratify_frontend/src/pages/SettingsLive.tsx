import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIntelligence } from "@/context/IntelligenceContext";

export default function SettingsLive() {
  const { profile, setProfile, runAnalysis } = useIntelligence();
  const [featureInput, setFeatureInput] = useState("");
  const { toast } = useToast();

  const addFeature = () => {
    const nextFeature = featureInput.trim();
    if (!nextFeature || profile.enabled_features.includes(nextFeature)) {
      return;
    }
    setProfile((current) => ({
      ...current,
      enabled_features: [...current.enabled_features, nextFeature],
    }));
    setFeatureInput("");
  };

  const removeFeature = (feature: string) => {
    setProfile((current) => ({
      ...current,
      enabled_features: current.enabled_features.filter((item) => item !== feature),
    }));
  };

  const saveAndAnalyze = async () => {
    try {
      const refreshed = await runAnalysis();
      toast({
        title: "Analysis refreshed",
        description: refreshed?.llm_enabled
          ? "Live AI strategy responses are enabled."
          : "Deterministic strategy engine is active. Add OPENAI_API_KEY to enable LLM reasoning.",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not run analysis",
        variant: "destructive",
      });
    }
  };

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
            <Input id="name" value={profile.startup_name} onChange={(e) => setProfile((current) => ({ ...current, startup_name: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select value={profile.industry} onValueChange={(value) => setProfile((current) => ({ ...current, industry: value }))}>
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
          <Input id="audience" value={profile.target_audience} onChange={(e) => setProfile((current) => ({ ...current, target_audience: e.target.value }))} className="mt-1.5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Current Pricing ($)</Label>
            <Input id="price" type="number" value={profile.current_price} onChange={(e) => setProfile((current) => ({ ...current, current_price: Number(e.target.value) || 0 }))} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="compPrice">Competitor Pricing ($)</Label>
            <Input id="compPrice" type="number" value={profile.competitor_price} onChange={(e) => setProfile((current) => ({ ...current, competitor_price: Number(e.target.value) || 0 }))} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="users">Monthly Users</Label>
            <Input id="users" type="number" value={profile.monthly_users} onChange={(e) => setProfile((current) => ({ ...current, monthly_users: Number(e.target.value) || 0 }))} className="mt-1.5" />
          </div>
        </div>

        <div>
          <Label htmlFor="marketing">Marketing Budget ($)</Label>
          <Input id="marketing" type="number" value={profile.marketing_budget} onChange={(e) => setProfile((current) => ({ ...current, marketing_budget: Number(e.target.value) || 0 }))} className="mt-1.5" />
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
            {profile.enabled_features.map((feature) => (
              <Badge key={feature} variant="secondary" className="gap-1">
                {feature}
                <button onClick={() => removeFeature(feature)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={saveAndAnalyze}>
          Run Analysis
        </Button>
      </div>
    </div>
  );
}
