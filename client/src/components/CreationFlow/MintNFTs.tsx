import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCreationContext } from '@/context/CreationContext';
import { useSolana } from '@/hooks/useSolana';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LoaderPinwheel, Eye, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import NFTPreviewModal from '@/components/NFTPreviewModal';

interface MintNFTsProps {
  onNext: () => void;
  onBack: () => void;
}

export default function MintNFTs({ onNext, onBack }: MintNFTsProps) {
  const { selectedPhotos, templateSelection, setMintedNfts, mintedNfts } = useCreationContext();
  const { connected, walletAddress } = useSolana(); // We're already connected
  const [mintProgress, setMintProgress] = useState(0);
  const [mintStatus, setMintStatus] = useState('');
  const [mintedPhotos, setMintedPhotos] = useState<number[]>([]);
  const [previewNft, setPreviewNft] = useState<number | null>(null);
  const [autoMintStarted, setAutoMintStarted] = useState(false);
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

  // Auto-start minting when component loads after a small delay
  useEffect(() => {
    if (!autoMintStarted && connected) {
      setAutoMintStarted(true);
      
      // Add a small delay for better UX - let users see what's happening
      const timer = setTimeout(() => {
        handleStartMinting();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connected, autoMintStarted]);

  const handleStartMinting = () => {
    setMintStatus('Creating your NFTs...');
    setMintProgress(10);
    
    // Start minting process
    mintNftsMutation.mutate();
    
    // Simulate minting progress
    simulateMintingProgress();
  };

  const simulateMintingProgress = () => {
    const photoCount = selectedPhotos.length;
    let progress = 10;
    const interval = setInterval(() => {
      progress += 5;
      setMintProgress(progress);
      
      // Calculate when each NFT should be shown as minted based on progress and number of NFTs
      const progressSteps = photoCount === 1 
        ? [60] // Only 1 NFT: show at 60% progress
        : photoCount === 2 
          ? [40, 80] // 2 NFTs: show at 40% and 80% progress
          : [40, 70, 90]; // 3 NFTs: show at 40%, 70%, and 90% progress
      
      // Update status text based on progress
      if (progress <= 30) {
        setMintStatus('Adding your personalized vibes...');
      } else if (progress <= 60) {
        setMintStatus('Creating your unique digital collectible...');
        // Show first NFT as minted if we have at least 1 photo
        if (progress >= progressSteps[0] && photoCount >= 1 && !mintedPhotos.includes(0)) {
          setMintedPhotos(prev => [...prev, 0]);
        }
      } else if (progress <= 90) {
        setMintStatus('Finalizing your Proof of Vibes...');
        // Show second NFT as minted if we have at least 2 photos
        if (progress >= progressSteps[1] && photoCount >= 2 && !mintedPhotos.includes(1)) {
          setMintedPhotos(prev => [...prev, 1]);
        }
      } else {
        setMintStatus('Your Proof of Vibes is ready!');
        // Show third NFT as minted if we have 3 photos
        if (progress >= progressSteps[2] && photoCount >= 3 && !mintedPhotos.includes(2)) {
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
    <>
      <div className="step-content">
        <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
          <h2 className="font-heading text-2xl font-bold mb-4 text-center">Creating Your Proof of Vibes</h2>
          <p className="text-center mb-6 text-white/70">
            We're transforming your photos into unique digital collectibles
          </p>
          
          {/* NFT Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {selectedPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="relative aspect-[3/4] rounded-xl overflow-hidden glassmorphism group cursor-pointer"
                onClick={() => {
                  if (mintedPhotos.includes(index) && mintedNfts && mintedNfts.length > index) {
                    setPreviewNft(index);
                  }
                }}
              >
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
                  <>
                    <div className="absolute top-2 right-2 bg-green-500/80 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Created
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button size="sm" variant="secondary" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Preview
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Minting Status and Info */}
          <div className="text-center bg-[#1A1A2E] border border-white/20 rounded-lg p-4 mb-6">
            <p className="font-medium mb-2">
              {mintProgress < 100 
                ? "Creating your unique digital collectibles..." 
                : "Your Proof of Vibes collectibles are ready!"}
            </p>
            <p className="text-sm text-white/70 mb-4">
              {mintProgress < 100
                ? "Please wait while we create your personalized digital collectibles. This will just take a moment."
                : "Your digital collectibles have been created! Now you can claim and share them."}
            </p>
            
            {/* Minting Progress */}
            <div className="mt-4">
              <div className="w-full bg-black/30 rounded-full h-2 mb-2">
                <div 
                  className="bg-accent h-2 rounded-full" 
                  style={{ width: `${mintProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center text-white/70">
                {mintStatus}
              </p>
            </div>
          </div>
          
          {/* Preview Button - Only show when minting is complete */}
          {mintProgress === 100 && (
            <div className="mt-6 flex justify-center">
              <Link href="/">
                <Button 
                  variant="outline"
                  className="px-6 py-2 border border-white/30 bg-white/10 hover:bg-white/20 rounded-full font-medium text-white transition-colors"
                >
                  Preview in Gallery
                </Button>
              </Link>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline"
              className="px-6 py-2 border border-white/20 rounded-full font-medium text-white hover:bg-white/10 transition-colors"
              onClick={onBack}
              disabled={mintProgress > 0 && mintProgress < 100}
            >
              ← Back
            </Button>
            
            <Button 
              className={`px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-white ${
                mintProgress === 100 ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={onNext}
              disabled={mintProgress < 100}
            >
              Next: Claim Your Collectibles →
            </Button>
          </div>
        </div>
      </div>

      {previewNft !== null && mintedNfts && mintedNfts.length > previewNft && (
        <NFTPreviewModal
          nft={mintedNfts[previewNft]}
          isOpen={true}
          onClose={() => setPreviewNft(null)}
        />
      )}
    </>
  );
}