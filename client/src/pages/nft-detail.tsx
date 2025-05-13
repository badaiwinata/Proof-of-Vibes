import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NFTPreviewModal from '../components/NFTPreviewModal';
import NFTCard from '../components/Gallery/NFTCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  Award, 
  Share2, 
  CheckCircle2, 
  LayoutGrid, 
  Clock, 
  Diamond,
  Hash,
  User,
  CreditCard,
  FileText,
  Mail,
  Smartphone,
  Eye
} from 'lucide-react';
import type { Nft } from '@shared/schema';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function NFTDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ id: string }>('/nft/:id');
  const [openPreview, setOpenPreview] = useState(false);
  
  // Redirect if no ID parameter
  useEffect(() => {
    if (!params) {
      navigate('/');
    }
  }, [params, navigate]);
  
  const nftId = params?.id ? parseInt(params.id) : undefined;
  
  // Fetch the NFT details
  const { data: nftData, isLoading: isLoadingNft } = useQuery<{ nft: Nft }>({
    queryKey: ['/api/nfts', nftId],
    enabled: !!nftId,
  });
  
  // Fetch related NFTs (same collection)
  const { data: relatedData, isLoading: isLoadingRelated } = useQuery<{ nfts: Nft[] }>({
    queryKey: ['/api/nfts'],
    select: (data) => {
      if (!data?.nfts || !nftData?.nft) return { nfts: [] };
      
      // Filter NFTs by the same collection ID
      const relatedNfts = data.nfts.filter(nft => {
        // Skip current NFT
        if (nft.id === nftId) return false;
        
        // Match on collection ID
        return nft.collectionId === nftData.nft.collectionId;
      });
      
      return { nfts: relatedNfts };
    },
    enabled: !!nftData?.nft,
  });
  
  const nft = nftData?.nft;
  const relatedNfts = relatedData?.nfts || [];
  
  // Format date if present
  const formattedDate = nft?.eventDate || nft?.createdAt ? new Date(nft.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;
  
  // Format claimed date if exists
  const claimedDate = nft?.claimedAt ? new Date(nft.claimedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  }) : null;
  
  // Certificate ID 
  const certificateId = nft?.certificateId || (nft?.id ? `POV-${nft.id}-${Date.now().toString().slice(-6)}` : null);
  
  // Transaction hash
  const transactionHash = nft?.mintAddress || (certificateId ? `${certificateId.replace('POV-', '')}-${Math.random().toString(16).slice(2, 10)}` : null);
  
  // Set rarity level based on template
  const rarityMap = {
    'classic': 'Common',
    'neon': 'Rare',
    'retro': 'Uncommon',
    'minimal': 'Epic'
  };
  
  const rarity = nft?.template ? rarityMap[nft.template as keyof typeof rarityMap] || 'Rare' : null;
  
  // Collection ID (in real app, would be stored in database)
  const collectionId = nft?.collectionId || 'POV-' + formattedDate?.split(', ')[1].replace(' ', '-');
  
  // Creator name
  const creatorName = "Proof of Vibes";
  
  // Floor price based on rarity
  const floorPriceMap: Record<string, string> = {
    'Common': '0.01 SOL',
    'Uncommon': '0.05 SOL',
    'Rare': '0.15 SOL',
    'Epic': '0.5 SOL'
  };
  
  const floorPrice = rarity ? floorPriceMap[rarity] : null;

  const handleCreateClick = () => {
    navigate('/create');
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my Proof of Vibes collectible!',
        text: `I created this digital collectible at ${nft?.eventName || 'an event'}.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Collectible link copied to clipboard!');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header onCreateClick={handleCreateClick} />
      
      <main className="pb-12">
        {/* Back button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="text-white/70 hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
        
        {isLoadingNft ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[500px] w-full rounded-xl" />
            <div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-24 w-full mb-6" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-36 w-full" />
            </div>
          </div>
        ) : nft ? (
          <div>
            {/* Certificate details section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {/* Image and certificate */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden glassmorphism">
                  {/* Certificate Banner */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center py-1 text-xs font-medium">
                    CERTIFICATE OF AUTHENTICITY
                  </div>
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-6 left-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-br-md font-medium">
                    {rarity?.toUpperCase()}
                  </div>
                  
                  {/* Status Badge */}
                  {nft.claimed ? (
                    <div className="absolute top-6 right-0 z-10 bg-emerald-500/80 text-white text-xs px-2 py-1 rounded-bl-md flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      CLAIMED
                    </div>
                  ) : (
                    <div className="absolute top-6 right-0 z-10 bg-indigo-500/80 text-white text-xs px-2 py-1 rounded-bl-md flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      UNCLAIMED
                    </div>
                  )}
                  
                  <img 
                    src={nft.imageUrl} 
                    alt={`Collectible: ${nft.message}`} 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Event Branding Watermark */}
                  <div className="absolute top-14 left-2 bg-black/40 backdrop-blur-sm p-1 rounded-md text-xs flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-purple-300" />
                    <span className="font-medium">{nft.eventName || "Proof of Vibes"}</span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A2E] to-transparent">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {nft.vibes.map((vibe, i) => (
                        <span key={i} className="bg-white/20 text-xs px-2 py-1 rounded-full">#{vibe}</span>
                      ))}
                    </div>
                    <p className="text-sm font-medium">"{nft.message}"</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => setOpenPreview(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border border-white/20 hover:bg-white/10"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Collectible
                  </Button>
                </div>
              </div>
              
              <div>
                {/* Collectible Details */}
                <div className="glassmorphism rounded-xl p-6">
                  <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-400" />
                    Digital Collectible Certificate
                  </h1>
                  
                  <p className="text-white/70 mb-4">
                    Exclusive event memorabilia with verified authenticity
                  </p>
                  
                  <Separator className="my-4 bg-white/10" />
                  
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-1">Certificate ID</h3>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-purple-300" />
                        <span className="font-mono text-xs">{certificateId}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-1">Created On</h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-1">Creator</h3>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{creatorName}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-1">Collection</h3>
                      <div className="flex items-center">
                        <LayoutGrid className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{collectionId}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-1">Rarity</h3>
                      <div className="flex items-center">
                        <Diamond className="h-4 w-4 mr-2 text-purple-300" />
                        <Badge variant="secondary" className="bg-purple-500/20 hover:bg-purple-500/30">{rarity}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-1">Floor Price</h3>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{floorPrice}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ownership Status */}
                  <div className="bg-purple-950/20 p-4 rounded-lg border border-purple-500/20 mb-6">
                    <h3 className="font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-300" />
                      Ownership Status
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs text-white/70 mb-1">Claim Status</h4>
                        <div className="flex items-center">
                          {nft.claimed ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-400" />
                              <span className="text-green-400">Claimed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-1 text-yellow-400" />
                              <span className="text-yellow-400">Unclaimed</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs text-white/70 mb-1">Current Owner</h4>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-purple-300" />
                          <span>{nft.recipientName || (nft.claimed ? "Claimed Owner" : "Unclaimed")}</span>
                        </div>
                      </div>
                      
                      {nft.claimed && nft.claimedAt && (
                        <div>
                          <h4 className="text-xs text-white/70 mb-1">Claimed On</h4>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-purple-300" />
                            <span>{claimedDate}</span>
                          </div>
                        </div>
                      )}
                      
                      {nft.claimEmail && (
                        <div>
                          <h4 className="text-xs text-white/70 mb-1">Claim Email</h4>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-purple-300" />
                            <span className="truncate">{nft.claimEmail}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Transaction Details (simplified for demo) */}
                  <div className="mt-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-purple-300" />
                      Blockchain Verification
                    </h3>
                    
                    <div className="bg-black/20 p-3 rounded-md">
                      <div className="flex items-center text-xs">
                        <span className="text-white/60 mr-2">Transaction Hash:</span>
                        <span className="font-mono truncate">{transactionHash}</span>
                      </div>
                      
                      <div className="flex items-center text-xs mt-2">
                        <span className="text-white/60 mr-2">Network:</span>
                        <span>Solana</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related NFTs section */}
            {relatedNfts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center mb-4">
                  <LayoutGrid className="h-5 w-5 mr-2 text-purple-400" />
                  <h2 className="text-xl font-bold">Related Collectibles</h2>
                </div>
                
                <p className="text-white/70 mb-6">
                  Other digital collectibles from the same collection
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedNfts.map((relatedNft) => (
                    <NFTCard key={relatedNft.id} nft={relatedNft} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-4">Collectible Not Found</h2>
            <p className="text-white/70 mb-6">The digital collectible you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Back to Gallery
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Certificate Preview Modal */}
      {nft && (
        <NFTPreviewModal
          nft={nft}
          isOpen={openPreview}
          onClose={() => setOpenPreview(false)}
        />
      )}
    </div>
  );
}