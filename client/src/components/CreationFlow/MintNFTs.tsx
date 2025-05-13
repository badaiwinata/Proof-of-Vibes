import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCreationContext } from '@/context/CreationContext';
import { useSolana } from '@/hooks/useSolana';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LoaderPinwheel, Eye, Sparkles, CheckCircle, Award, Scroll } from 'lucide-react';
import { Link } from 'wouter';
import NFTPreviewModal from '@/components/NFTPreviewModal';

interface MintNFTsProps {
  onNext: () => void;
  onBack: () => void;
}

export default function MintNFTs({ onNext, onBack }: MintNFTsProps) {
  const { selectedPhotos, templateSelection, setMintedNfts, mintedNfts, editionCount } = useCreationContext();
  const { connected, walletAddress } = useSolana(); // We're already connected
  const [mintProgress, setMintProgress] = useState(0);
  const [mintStatus, setMintStatus] = useState('');
  const [mintedPhotos, setMintedPhotos] = useState<number[]>([]);
  const [previewNft, setPreviewNft] = useState<number | null>(null);
  const [autoMintStarted, setAutoMintStarted] = useState(false);
  const { toast } = useToast();

  const mintNftsMutation = useMutation({
    mutationFn: async () => {
      console.log("Starting mint mutation with selected photos:", selectedPhotos.length);
      
      // Prepare photo copy data with event information
      const nftsToMint = selectedPhotos.map(photoUrl => ({
        imageUrl: photoUrl,
        message: templateSelection.message,
        template: templateSelection.template,
        vibes: templateSelection.vibes,
        userId: 1, // In a real app, would be the actual user ID
        eventName: "Proof of Vibes",
        eventDate: new Date().toISOString().split('T')[0]
      }));
      
      console.log("Preparing to create photo copies:", nftsToMint);
      
      try {
        const response = await apiRequest('POST', '/api/mint', { 
          nfts: nftsToMint,
          editionCount: editionCount // Include the edition count from context
        });
        const data = await response.json();
        console.log("Mint API response:", data);
        return data;
      } catch (error) {
        console.error("Error in mint API call:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mint mutation successful with data:", data);
      
      // Ensure we have NFT data before proceeding
      if (data && data.nfts && data.nfts.length > 0) {
        console.log("Setting minted NFTs and proceeding to next step");
        setMintedNfts(data.nfts);
        
        // Force set progress to 100% to ensure UI shows completion
        setMintProgress(100);
        setMintStatus('Your photo copies are ready!');
        
        // Make sure all photos are marked as minted
        const indices = Array.from({ length: selectedPhotos.length }, (_, i) => i);
        setMintedPhotos(indices);
        
        // IMPORTANT: Invalidate the NFT query cache so gallery will refresh with new NFTs
        queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
        console.log("Invalidated NFT cache to ensure gallery updates");
        
        // Show success toast
        toast({
          title: "Success!",
          description: "Your photo copies have been created successfully.",
        });
      } else {
        console.error("Mint API returned empty or invalid data:", data);
        toast({
          title: "Something went wrong",
          description: "We received an unexpected response. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Mint mutation error:", error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create your photo copies. Please try again.",
        variant: "destructive",
      });
      setMintProgress(0);
      setMintStatus('');
    }
  });

  // Auto-start minting when component loads after a small delay
  useEffect(() => {
    // Return early if we've already started the process
    if (autoMintStarted) return;
    
    console.log("Auto-mint effect triggered, connected:", connected);
    
    // Mark that we've started the auto-mint process to prevent duplicate runs
    setAutoMintStarted(true);
    
    // Add a small delay for better UX - let users see what's happening
    const timer = setTimeout(() => {
      console.log("Starting minting process after delay");
      handleStartMinting();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle manual button click to start minting
  const handleStartMinting = () => {
    console.log("HandleStartMinting called");
    setMintStatus('Creating your photo copies...');
    setMintProgress(10);
    
    // Start minting process
    try {
      console.log("Calling mint mutation");
      mintNftsMutation.mutate();
      
      // Simulate minting progress
      simulateMintingProgress();
    } catch (error) {
      console.error("Error starting mint process:", error);
      toast({
        title: "Error",
        description: "Failed to start creating your photo copies. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to simulate minting progress for better UX
  const simulateMintingProgress = () => {
    console.log("Starting progress simulation");
    const photoCount = selectedPhotos.length;
    
    // Ensure we have photos to work with
    if (photoCount === 0) {
      console.error("No photos selected for minting");
      return;
    }
    
    let progress = 10;
    const interval = setInterval(() => {
      // Update progress
      progress += 3;
      console.log("Updating progress:", progress);
      setMintProgress(Math.min(progress, 98)); // Cap at 98% until API responds
      
      // Calculate when each collectible should be shown as minted
      // based on progress and number of photos
      const progressSteps = photoCount === 1 
        ? [60] // Only 1 photo: show at 60% progress
        : photoCount === 2 
          ? [40, 75] // 2 photos: show at 40% and 75% progress
          : [35, 60, 85]; // 3 photos: show at 35%, 60%, and 85% progress
      
      // Update status text based on progress
      if (progress <= 30) {
        setMintStatus('Creating your certificate of authenticity...');
      } else if (progress <= 50) {
        setMintStatus('Capturing your event memories...');
      } else if (progress <= 70) {
        setMintStatus('Generating your photo copies...');
        
        // Show first collectible as minted if we have at least 1 photo
        if (progress >= progressSteps[0] && photoCount >= 1 && !mintedPhotos.includes(0)) {
          setMintedPhotos(prev => [...prev, 0]);
        }
      } else if (progress <= 90) {
        setMintStatus('Adding the final touches to your photo copies...');
        
        // Show second collectible as minted if we have at least 2 photos
        if (progress >= progressSteps[1] && photoCount >= 2 && !mintedPhotos.includes(1)) {
          setMintedPhotos(prev => [...prev, 1]);
        }
      } else {
        setMintStatus('Finalizing your photo copies...');
        
        // Show third collectible as minted if we have 3 photos
        if (progress >= progressSteps[2] && photoCount >= 3 && !mintedPhotos.includes(2)) {
          setMintedPhotos(prev => [...prev, 2]);
        }
      }
      
      // If we reach 95% and the API hasn't completed, keep waiting
      if (progress >= 95) {
        clearInterval(interval);
        
        // After 5 seconds at 98%, force completion to prevent getting stuck
        setTimeout(() => {
          if (mintProgress < 100) {
            console.log("Forcing completion after timeout");
            setMintProgress(100);
            setMintStatus('Your photo copies are ready!');
            
            // Make sure all photos are marked as minted
            const allIndices = Array.from({ length: photoCount }, (_, i) => i);
            setMintedPhotos(allIndices);
            
            // Force invalidate the NFT cache to ensure gallery refreshes
            queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
            console.log("Fallback mechanism: Invalidated NFT cache to ensure gallery updates");
            
            // If we have minted NFTs from a previous attempt, use those
            // Otherwise proceed to next step anyway
            if (mintedNfts && mintedNfts.length > 0) {
              console.log("Using existing minted NFTs from previous attempt");
            } else {
              console.log("No minted NFTs available, proceeding anyway");
              // This is a fallback that should rarely happen
              
              // Attempt a final refetch before proceeding to next step
              queryClient.refetchQueries({ queryKey: ['/api/nfts'] });
              
              onNext();
            }
          }
        }, 5000);
      }
    }, 400); // Slightly faster updates for smoother progress
    
    return () => clearInterval(interval);
  };

  return (
    <>
      <div className="step-content">
        <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
          {/* Certificate-styled header */}
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              <h2 className="font-heading text-3xl font-bold mb-1">
                Creating Your Photo Copies
              </h2>
            </div>
            <p className="text-center mb-2 text-white/70">
              We're transforming your photos into digital keepsakes
            </p>
            <div className="flex justify-center items-center gap-2 text-sm text-white/50">
              <Award className="h-4 w-4" />
              <span>Each photo copy includes a certificate of authenticity</span>
            </div>
          </div>
          
          {/* Photo Copies Preview Grid */}
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
                {/* Certificate Badge */}
                {mintedPhotos.includes(index) && (
                  <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-bl-md font-medium">
                    CERTIFIED
                  </div>
                )}
                
                <img 
                  src={photo} 
                  alt={`Photo Copy ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Event Watermark */}
                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1 rounded-md text-xs flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-purple-300" />
                  <span className="font-medium">Proof of Vibes</span>
                </div>
                
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A2E] to-transparent">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {templateSelection.vibes.map((vibe, i) => (
                        <span key={i} className="vibe-tag text-xs px-2 py-1 rounded-full">#{vibe}</span>
                      ))}
                    </div>
                    <p className="text-sm font-medium">"{templateSelection.message}"</p>
                  </div>
                </div>
                
                {mintedPhotos.includes(index) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                    <Button size="sm" variant="secondary" className="flex items-center gap-2 bg-white/20">
                      <Eye className="h-4 w-4" /> View Certificate
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Creation Status and Info */}
          <div className="text-center bg-[#1A1A2E] border border-purple-500/30 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              {mintProgress < 100 ? (
                <div className="animate-spin h-5 w-5 text-purple-400">
                  <LoaderPinwheel className="h-5 w-5" />
                </div>
              ) : (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
              <p className="font-medium">
                {mintProgress < 100 
                  ? "Creating your certified photo copies..." 
                  : "Your photo copies are ready for claiming!"}
              </p>
            </div>
            
            <p className="text-sm text-white/70 mb-4 max-w-lg mx-auto">
              {mintProgress < 100
                ? "Please wait while we prepare your personalized digital memorabilia with certificate of authenticity."
                : "Your exclusive event memorabilia has been created and is ready to be claimed."}
            </p>
            
            {/* Creation Progress */}
            <div className="mt-4">
              <div className="w-full bg-black/30 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${mintProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center text-white/70 font-medium">
                {mintStatus}
              </p>
            </div>
          </div>
          
          {/* Preview Button - Only show when creation is complete */}
          {mintProgress === 100 && (
            <div className="mt-6 flex justify-center">
              <Link href="/">
                <Button 
                  variant="outline"
                  className="px-6 py-2 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 rounded-full font-medium text-white transition-colors"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
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
              className={`px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full font-bold text-white ${
                mintProgress === 100 ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={onNext}
              disabled={mintProgress < 100}
            >
              Next: Claim Your Certificate →
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