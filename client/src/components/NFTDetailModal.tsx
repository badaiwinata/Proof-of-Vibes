import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  X, 
  Award, 
  Calendar, 
  Sparkles, 
  Diamond, 
  ChevronDown, 
  Hash, 
  CreditCard, 
  Users, 
  Scan, 
  Clock, 
  User, 
  ShieldCheck, 
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { Nft } from '@shared/schema';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import NFTCard from './Gallery/NFTCard';

interface NFTDetailModalProps {
  nft: Nft | null;
  isOpen: boolean;
  onClose: () => void;
  onViewCollection?: (collectionId: string) => void;
}

export default function NFTDetailModal({ nft, isOpen, onClose, onViewCollection }: NFTDetailModalProps) {
  if (!nft) return null;

  const [activeTab, setActiveTab] = useState<string>('details');
  
  // Format date if present, or use current date
  const formattedDate = nft.eventDate || new Date(nft.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format claimed date if exists
  const claimedDate = nft.claimedAt ? new Date(nft.claimedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  }) : null;
  
  // Use certificate ID if present, or generate a placeholder
  const certificateId = nft.certificateId || `POV-${nft.id}-${Date.now().toString().slice(-6)}`;
  
  // Generate transaction hash from mint address or create one
  const transactionHash = nft.mintAddress || `${certificateId.replace('POV-', '')}-${Math.random().toString(16).slice(2, 10)}`;
  
  // Set rarity level based on template
  const rarityMap: Record<string, string> = {
    'classic': 'Common',
    'neon': 'Rare',
    'retro': 'Uncommon',
    'minimal': 'Epic'
  };
  
  const rarity = rarityMap[nft.template] || 'Rare';
  
  // Gradient styles based on the template
  const templateGradients: Record<string, string> = {
    'classic': 'from-primary/90 via-primary/70',
    'neon': 'from-pink-500/90 via-blue-500/70',
    'retro': 'from-amber-500/90 via-red-600/70',
    'minimal': 'from-slate-700/90 via-slate-900/70'
  };
  
  const gradientClass = templateGradients[nft.template] || 'from-primary/90 via-primary/70';
  
  // Border styles based on template
  const templateBorders: Record<string, string> = {
    'classic': 'border-primary/30',
    'neon': 'border-pink-500/30',
    'retro': 'border-amber-500/30',
    'minimal': 'border-slate-700/30'
  };
  
  const borderClass = templateBorders[nft.template] || 'border-primary/30';
  
  // Collection ID from the enhanced NFT object
  const collectionId = nft.collectionId || 'uncategorized';
  
  // Collection info - would come from API in real app
  const collectionName = nft.eventName || "Proof of Vibes Collection";
  
  // Creator name
  const creatorName = "Proof of Vibes";
  
  // Floor price based on rarity
  const floorPriceMap: Record<string, string> = {
    'Common': '0.01 SOL',
    'Uncommon': '0.05 SOL',
    'Rare': '0.15 SOL',
    'Epic': '0.5 SOL'
  };
  
  const floorPrice = floorPriceMap[rarity] || floorPriceMap.Common;
  
  // Network and other blockchain details
  const network = "Solana";
  const lastTransferred = claimedDate || formattedDate;
  const uniqueHolder = nft.recipientName || "Event Attendee";
  
  // Fetch related NFTs - all NFTs from the same collection
  const { data: relatedData, isLoading: isLoadingRelated } = useQuery<{ nfts: Nft[] }>({
    queryKey: ['/api/nfts'],
    select: (data) => {
      if (!data?.nfts) return { nfts: [] };
      
      // Filter NFTs by the same collection ID
      const relatedNfts = data.nfts.filter(otherNft => {
        // Skip current NFT
        if (otherNft.id === nft.id) return false;
        
        // Match on collection ID
        return otherNft.collectionId === collectionId;
      });
      
      return { nfts: relatedNfts };
    },
    enabled: isOpen, // Only fetch when modal is open
  });
  
  const relatedNfts = relatedData?.nfts || [];
  
  // Handle sharing the collectible
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my Proof of Vibes collectible!',
        text: `I created this digital collectible at ${nft.eventName || 'an event'}.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + '/?collectible=' + nft.id);
      alert('Digital collectible link copied to clipboard!');
    }
  };
  
  // Handle viewing collection
  const handleViewCollection = () => {
    if (onViewCollection) {
      onViewCollection(collectionId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-[#1A1A2E] border border-white/20 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Digital Collectible
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Your exclusive event memorabilia with certificate of authenticity
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-black/20">
            <TabsTrigger value="details" className="data-[state=active]:bg-purple-600/20">Certificate Details</TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-purple-600/20">Collection ({relatedNfts.length + 1})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certificate Image */}
              <div>
                <div className={`relative aspect-[3/4] rounded-xl overflow-hidden mb-4 border-2 ${borderClass}`}>
                  {/* Certificate Banner */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center py-1 text-xs font-medium">
                    CERTIFICATE OF AUTHENTICITY
                  </div>
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-6 left-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-br-md font-medium">
                    {rarity.toUpperCase()}
                  </div>
                  
                  {/* Status Badge */}
                  {nft.claimed ? (
                    <div className="absolute top-6 right-0 z-10 bg-emerald-500/80 text-white text-xs px-2 py-1 rounded-bl-md flex items-center">
                      <ShieldCheck className="h-3 w-3 mr-1" />
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
              </div>
              
              {/* Certificate Details */}
              <div>
                {/* Basic Info */}
                <div className="bg-black/20 rounded-md p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <ShieldCheck className="h-4 w-4 mr-2 text-purple-300" />
                    <h3 className="font-medium">Certificate Information</h3>
                  </div>
                  
                  <Separator className="my-3 bg-white/10" />
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <h4 className="text-xs text-white/70 mb-1">Certificate ID</h4>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-purple-300" />
                        <span className="font-mono text-xs truncate">{certificateId}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs text-white/70 mb-1">Created On</h4>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs text-white/70 mb-1">Creator</h4>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{creatorName}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs text-white/70 mb-1">Collection</h4>
                      <div className="flex items-center">
                        <LayoutGrid className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{collectionId}</span>
                      </div>
                    </div>
                    
                    {/* Show Edition information if available */}
                    {nft.editionNumber && nft.editionCount && (
                      <div className="col-span-2 bg-purple-500/10 border border-purple-500/20 rounded-md p-2 mt-2">
                        <h4 className="text-xs text-white/70 mb-1">Limited Edition</h4>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-purple-400" />
                          <span className="font-medium">Edition {nft.editionNumber} of {nft.editionCount}</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-xs text-white/70 mb-1">Rarity</h4>
                      <div className="flex items-center">
                        <Diamond className="h-4 w-4 mr-2 text-purple-300" />
                        <Badge variant="secondary" className="bg-purple-500/20 hover:bg-purple-500/30">{rarity}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs text-white/70 mb-1">Floor Price</h4>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-purple-300" />
                        <span>{floorPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ownership Status */}
                <div className="bg-purple-950/20 p-4 rounded-lg border border-purple-500/20 mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-300" />
                    Ownership Status
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-white/70 mb-1">Claim Status</h4>
                      <div className="flex items-center">
                        {nft.claimed ? (
                          <>
                            <ShieldCheck className="h-4 w-4 mr-1 text-green-400" />
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
                        <span>{uniqueHolder}</span>
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
                  </div>
                </div>
                
                {/* Blockchain Verification */}
                <div className="bg-black/20 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Scan className="h-4 w-4 mr-2 text-purple-300" />
                    Blockchain Verification
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center text-xs">
                      <span className="text-white/60 mr-2 w-24">Transaction Hash:</span>
                      <span className="font-mono truncate">{transactionHash}</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className="text-white/60 mr-2 w-24">Network:</span>
                      <span>{network}</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className="text-white/60 mr-2 w-24">Last Transferred:</span>
                      <span>{lastTransferred}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="collection" className="mt-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center">
                    <LayoutGrid className="h-5 w-5 mr-2 text-purple-400" />
                    Collection: {collectionId}
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    All digital collectibles from this collection ({relatedNfts.length + 1} items)
                  </p>
                </div>
                
                <Button 
                  variant="outline"
                  className="border border-white/20 hover:bg-white/10"
                  onClick={handleViewCollection}
                >
                  View in Gallery
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Current NFT */}
                <div className="glassmorphism rounded-xl p-2 relative">
                  <div className="absolute top-4 left-4 z-10 bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full">
                    Current Item
                  </div>
                  <img 
                    src={nft.imageUrl} 
                    alt="Current collectible" 
                    className="rounded-lg w-full aspect-[3/4] object-cover" 
                  />
                </div>
                
                {/* Related NFTs from same collection */}
                {relatedNfts.map((relatedNft) => (
                  <div 
                    key={relatedNft.id} 
                    className="glassmorphism rounded-xl p-2 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => {
                      // If we had a callback to switch the displayed NFT
                      // onSelectNft(relatedNft);
                      window.location.href = `/?collectible=${relatedNft.id}`;
                      onClose();
                    }}
                  >
                    <img 
                      src={relatedNft.imageUrl} 
                      alt={`Related collectible: ${relatedNft.message}`} 
                      className="rounded-lg w-full aspect-[3/4] object-cover" 
                    />
                    <div className="p-2">
                      <p className="truncate text-sm">"{relatedNft.message}"</p>
                      <div className="flex mt-1 flex-wrap gap-1">
                        {relatedNft.vibes.slice(0, 3).map((vibe, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-full">#{vibe}</span>
                        ))}
                        {relatedNft.vibes.length > 3 && <span className="text-[10px] text-white/60">+{relatedNft.vibes.length - 3} more</span>}
                      </div>
                    </div>
                  </div>
                ))}
                
                {relatedNfts.length === 0 && (
                  <div className="col-span-2 bg-black/20 rounded-xl p-6 flex flex-col items-center justify-center">
                    <p className="text-white/60 mb-2">No other collectibles in this collection</p>
                    <p className="text-sm text-white/40">This appears to be a unique collectible from this event</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between sm:justify-between gap-2 mt-6">
          <Button
            variant="outline"
            className="border border-white/20 hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Collectible
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}