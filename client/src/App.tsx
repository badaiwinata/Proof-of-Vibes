import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Gallery from "@/pages/gallery";
import CreateNFT from "@/pages/create-nft";
import NFTDetailPage from "@/pages/nft-detail";
import AdminPage from "@/pages/admin";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import "@solana/wallet-adapter-react-ui/styles.css";
import { CreationProvider } from "./context/CreationContext";

function Router() {
  return (
    <CreationProvider>
      <Switch>
        <Route path="/" component={Gallery} />
        <Route path="/create" component={CreateNFT} />
        <Route path="/nft/:id" component={NFTDetailPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </CreationProvider>
  );
}

function App() {
  const { toast } = useToast();

  useEffect(() => {
    // Check for WebRTC support for camera access
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Camera not supported",
        description: "Your browser doesn't support camera access. Please try using a modern browser.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
