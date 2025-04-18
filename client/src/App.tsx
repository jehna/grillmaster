import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { GrillItemsProvider } from "@/hooks/useGrillItems";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/grillmaster" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GrillItemsProvider>
          <Router />
        </GrillItemsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
