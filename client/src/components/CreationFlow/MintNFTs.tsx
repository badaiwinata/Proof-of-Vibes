import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCreationContext } from '@/context/CreationContext';
import { useSolana } from '@/hooks/useSolana';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LoaderPinwheel } from 'lucide-react';

interface MintNFTsProps {
  onNext: () => void;
  onBack: () => void;
}

export default function MintNFTs({ onNext, onBack }: MintNFTsProps) {
  const { selectedPhotos, templateSelection, setMintedNfts } = useCreationContext();
  const { connected, walletAddress, connect } = useSolana();
  const [mintProgress, setMintProgress] = useState(0);
  const [mintStatus, setMintStatus] = useState('');
  const [mintedPhotos, setMintedPhotos] = useState<number[]>([]);
  const { toast } = useToast();

  const mintNftsMutation = useMutation({
    mutationFn: async () => {
      // Prepare NFT data
      const nftsToMint = selectedPhotos.map(photoUrl => ({
        imageUrl: photoUrl,
        message: templateSelection.message,
        template: templateSelection.template,
        vibes: templateSelection.vibes,
        userId: 1, // In a real app, would be the actual user ID
      }));
      
      const response = await apiRequest('POST', '/api/mint', { nfts: nftsToMint });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setMintedNfts(data.nfts);
      onNext();
    },
    onError: (error) => {
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint your NFTs. Please try again.",
        variant: "destructive",
      });
      setMintProgress(0);
      setMintStatus('');
    }
  });

  const handleStartMinting = () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      });
      return;
    }
    
    setMintStatus('Preparing to mint...');
    setMintProgress(10);
    
    // Start minting process
    mintNftsMutation.mutate();
    
    // Simulate minting progress
    simulateMintingProgress();
  };

  const simulateMintingProgress = () => {
    let progress = 10;
    const interval = setInterval(() => {
      progress += 5;
      setMintProgress(progress);
      
      // Update status text based on progress
      if (progress <= 30) {
        setMintStatus('Preparing metadata...');
      } else if (progress <= 60) {
        setMintStatus('Uploading to IPFS...');
        // Show first NFT as minted
        if (progress >= 40 && !mintedPhotos.includes(0)) {
          setMintedPhotos(prev => [...prev, 0]);
        }
      } else if (progress <= 90) {
        setMintStatus('Confirming on blockchain...');
        // Show second NFT as minted
        if (progress >= 70 && !mintedPhotos.includes(1)) {
          setMintedPhotos(prev => [...prev, 1]);
        }
      } else {
        setMintStatus('Minting complete!');
        // Show third NFT as minted
        if (!mintedPhotos.includes(2)) {
          setMintedPhotos(prev => [...prev, 2]);
        }
      }
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 500);
    
    // Store interval ID for cleanup
    return () => clearInterval(interval);
  };

  return (
    <div className="step-content">
      <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
        <h2 className="font-heading text-2xl font-bold mb-4 text-center">Mint Your Unique NFTs</h2>
        <p className="text-center mb-6 text-white/70">Your photos will be minted as NFTs on the Solana blockchain</p>
        
        {/* NFT Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {selectedPhotos.map((photo, index) => (
            <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden glassmorphism">
              <img 
                src={photo} 
                alt={`NFT Preview ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A2E] to-transparent">
                  <div className="flex gap-2 mb-2">
                    {templateSelection.vibes.map((vibe, i) => (
                      <span key={i} className="vibe-tag text-xs px-2 py-1 rounded-full">#{vibe}</span>
                    ))}
                  </div>
                  <p className="text-sm font-medium">"{templateSelection.message}"</p>
                </div>
              </div>
              
              {mintedPhotos.includes(index) && (
                <div className="absolute top-2 right-2 bg-green-500/80 px-2 py-1 rounded text-xs">
                  Minted
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!connected ? (
          /* Wallet Connection Prompt */
          <div className="bg-[#1A1A2E] border border-white/20 rounded-lg p-4 mb-6">
            <p className="text-center font-medium mb-3">Connect your Solana wallet to mint these NFTs</p>
            <div className="flex justify-center">
              <Button 
                className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-full font-bold text-white transition-colors"
                onClick={connect}
              >
                <i className="fas fa-wallet mr-2"></i> Connect Wallet
              </Button>
            </div>
          </div>
        ) : (
          /* Minting Controls */
          <div>
            <div className="flex items-center justify-between p-4 bg-[#1A1A2E] border border-white/20 rounded-lg mb-4">
              <div>
                <p className="font-medium">Estimated cost</p>
                <p className="text-sm text-white/70">Minting fee: 0.01 SOL × 3 NFTs</p>
              </div>
              <p className="font-bold">0.03 SOL</p>
            </div>
            
            <div className="flex justify-center">
              <Button
                className={`relative px-8 py-3 ${
                  mintProgress === 100
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gradient-to-r from-primary to-secondary'
                } rounded-full font-bold text-white btn-glow`}
                onClick={handleStartMinting}
                disabled={mintNftsMutation.isPending || mintProgress > 0}
              >
                {mintNftsMutation.isPending || mintProgress > 0 ? (
                  <>
                    <span className="opacity-0">Mint 3 NFTs</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <LoaderPinwheel className="animate-spin h-5 w-5 mr-2" />
                    </span>
                  </>
                ) : mintProgress === 100 ? (
                  'Minting Complete!'
                ) : (
                  'Mint 3 NFTs'
                )}
              </Button>
            </div>
            
            {/* Minting Progress */}
            {mintProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-[#1A1A2E] rounded-full h-2 mb-2">
                  <div 
                    className="bg-accent h-2 rounded-full" 
                    style={{ width: `${mintProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center text-white/70">
                  {mintStatus}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline"
            className="px-6 py-2 border border-white/20 rounded-full font-medium text-white hover:bg-white/10 transition-colors"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </Button>
          
          <Button 
            className={`px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-white ${
              mintProgress === 100 ? '' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={onNext}
            disabled={mintProgress < 100}
          >
            Next: Claim NFTs <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
