import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { CreationProvider } from "./context/CreationContext";
import SolanaProvider from "./context/SolanaContext";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SolanaProvider>
      <CreationProvider>
        <App />
      </CreationProvider>
    </SolanaProvider>
  </QueryClientProvider>
);
