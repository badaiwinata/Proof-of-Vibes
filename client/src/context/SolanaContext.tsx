import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';

// Define a simpler Solana context for our application
interface SolanaContextType {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  connection: Connection;
  devnetEnabled: boolean;
  toggleDevnet: () => void;
  // Simplified function to simulate connecting a wallet
  simulateWalletConnection: () => string;
}

// Create the context
const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

// Custom hook to use the Solana context
export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (context === undefined) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};

// A simpler Solana provider without wallet adapters
const SolanaProvider = ({ children }: { children: ReactNode }) => {
  // Maintain wallet address state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  // Track whether devnet integration is enabled
  const [devnetEnabled, setDevnetEnabled] = useState<boolean>(true);
  
  // Create a Solana connection to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Toggle devnet integration on/off
  const toggleDevnet = () => {
    setDevnetEnabled(!devnetEnabled);
  };

  // Generate a random wallet address for simulation
  const simulateWalletConnection = (): string => {
    // Generate a random keypair
    const keypair = Keypair.generate();
    // Get the public key as a string
    const address = keypair.publicKey.toString();
    // Update the wallet address state
    setWalletAddress(address);
    return address;
  };

  // Context value
  const value: SolanaContextType = {
    walletAddress,
    setWalletAddress,
    connection,
    devnetEnabled,
    toggleDevnet,
    simulateWalletConnection,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
};

export default SolanaProvider;