import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useSolana } from '@/hooks/useSolana';

interface HeaderProps {
  onCreateClick: () => void;
  hideCreateButton?: boolean;
}

export default function Header({ onCreateClick, hideCreateButton = false }: HeaderProps) {
  const { connected, walletAddress, connect } = useSolana();

  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8">
      <div className="flex items-center mb-4 md:mb-0">
        <Link href="/">
          <div className="relative cursor-pointer">
            <span className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary blur opacity-30 rounded-full"></span>
            <h1 className="relative font-heading font-bold text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Proof of Vibes
            </h1>
          </div>
        </Link>
        <span className="ml-3 px-3 py-1 rounded-full text-xs bg-accent/20 text-accent border border-accent/30">
          BETA
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          className="hidden md:flex items-center px-4 py-2 rounded-full glassmorphism hover:bg-white/10 transition-all duration-300"
          onClick={connect}
        >
          <i className="fas fa-wallet mr-2"></i>
          <span>
            {connected 
              ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` 
              : 'Connect Wallet'}
          </span>
        </Button>
        
        {!hideCreateButton && (
          <div className="relative">
            <span className="absolute -inset-1 bg-gradient-to-r from-accent to-primary blur opacity-30 rounded-full"></span>
            <Button 
              className="relative px-6 py-6 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-white btn-glow"
              onClick={onCreateClick}
            >
              Create Your NFT
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
