import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { IntelligenceProvider } from "@/context/IntelligenceContext";
import DashboardLive from "./pages/DashboardLive";
import PlaygroundLive from "./pages/PlaygroundLive";
import CompetitorsLive from "./pages/CompetitorsLive";
import ScenariosLive from "./pages/ScenariosLive";
import SettingsLive from "./pages/SettingsLive";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <IntelligenceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardLive />} />
              <Route path="/playground" element={<PlaygroundLive />} />
              <Route path="/competitors" element={<CompetitorsLive />} />
              <Route path="/scenarios" element={<ScenariosLive />} />
              <Route path="/settings" element={<SettingsLive />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </IntelligenceProvider>
  </QueryClientProvider>
);

export default App;