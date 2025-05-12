import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface HeaderProps {
  onCreateClick: () => void;
  hideCreateButton?: boolean;
}

export default function Header({ onCreateClick, hideCreateButton = false }: HeaderProps) {
  // Note: We've removed the wallet connection UI since it's not needed for the photobooth experience
  
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
      
      <div className="flex items-center">
        {!hideCreateButton && (
          <div className="relative">
            <span className="absolute -inset-1 bg-gradient-to-r from-accent to-primary blur opacity-30 rounded-full"></span>
            <Button 
              className="relative px-6 py-6 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-white btn-glow"
              onClick={onCreateClick}
            >
              <Camera className="h-5 w-5 mr-2" />
              Take Photos
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
