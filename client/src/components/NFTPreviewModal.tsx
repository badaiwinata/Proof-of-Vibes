import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, X, Award, Calendar, Sparkles, Diamond, ChevronDown, ChevronUp, Hash, CreditCard, Users, Scan, Clock, User, ShieldCheck, LayoutGrid } from 'lucide-react';
import { Nft } from '@shared/schema';
import { Link } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface NFTPreviewModalProps {
  nft: Nft | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NFTPreviewModal({ nft, isOpen, onClose }: NFTPreviewModalProps) {
  if (!nft) return null;

  const [showDetails, setShowDetails] = useState(false);
  
  // Format date if present, or use current date
  const formattedDate = nft.eventDate || new Date().toLocaleDateString('en-US', {
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
  
  // Set rarity level based on template and vibes
  const rarityMap = {
    'classic': 'Common',
    'neon': 'Rare',
    'retro': 'Uncommon',
    'minimal': 'Epic'
  };
  
  const rarity = rarityMap[nft.template as keyof typeof rarityMap] || 'Rare';
  
  // Generate collection name
  const collectionName = nft.eventName || "Proof of Vibes Collection";
  
  // Creator name - would come from database in real app
  const creatorName = "Proof of Vibes";
  
  // Floor price based on rarity
  const floorPriceMap = {
    'Common': '0.01 SOL',
    'Uncommon': '0.05 SOL',
    'Rare': '0.15 SOL',
    'Epic': '0.5 SOL'
  };
  
  const floorPrice = floorPriceMap[rarity];
  
  // Network
  const network = "Solana";
  
  // Last transferred date - use claimed date if available
  const lastTransferred = claimedDate || formattedDate;
  
  // Unique holder
  const uniqueHolder = nft.recipientName || "Event Attendee";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-[#1A1A2E] border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Photo Copy
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Your exclusive event photo with certificate of authenticity
          </DialogDescription>
        </DialogHeader>
        
        {/* Certificate Banner */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center py-1 text-xs font-medium rounded-t-md">
          CERTIFICATE OF AUTHENTICITY
        </div>
        
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
          <img 
            src={nft.imageUrl} 
            alt="Photo Copy" 
            className="w-full h-full object-cover" 
          />
          
          {/* Edition/Copy Number Badge */}
          <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-bl-md font-medium">
            {nft.editionNumber && nft.editionCount 
              ? `COPY ${nft.editionNumber}/${nft.editionCount}` 
              : 'COPY'}
          </div>
          
          {/* Rarity Badge */}
          <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-bl-md font-medium">
            {rarity.toUpperCase()}
          </div>
          
          {/* Event Branding Watermark */}
          <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1 rounded-md text-xs flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-purple-300" />
            <span className="font-medium">{nft.eventName || "Proof of Vibes"}</span>
          </div>
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A2E] to-transparent">
              <div className="flex gap-2 mb-2 flex-wrap">
                {nft.vibes.map((vibe, i) => (
                  <span key={i} className="bg-white/20 text-xs px-2 py-1 rounded-full">#{vibe}</span>
                ))}
              </div>
              <p className="text-sm font-medium">"{nft.message}"</p>
            </div>
          </div>
        </div>
        
        {/* Certificate Details */}
        <div className="my-3 bg-black/20 rounded-md p-3 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-purple-300" />
              <p className="font-medium">Certificate of Authenticity</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-white/70 hover:text-white"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <><ChevronUp className="h-3 w-3 mr-1" /> Less</>
              ) : (
                <><ChevronDown className="h-3 w-3 mr-1" /> More</>
              )}
            </Button>
          </div>
          
          <Separator className="my-2 bg-white/10" />
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center text-xs">
              <Hash className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
              <span className="text-white/70 mr-1">Certificate ID:</span>
              <span className="font-mono text-xs truncate">{certificateId}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
              <span className="text-white/70 mr-1">Created:</span>
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <User className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
              <span className="text-white/70 mr-1">Creator:</span>
              <span>{creatorName}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <LayoutGrid className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
              <span className="text-white/70 mr-1">Collection:</span>
              <span>{collectionName}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <Diamond className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
              <span className="text-white/70 mr-1">Rarity:</span>
              <Badge variant="secondary" className="text-[10px] h-4 bg-purple-500/20 hover:bg-purple-500/30">{rarity}</Badge>
            </div>
            
            <div className="flex items-center text-xs">
              <CreditCard className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
              <span className="text-white/70 mr-1">Floor Price:</span>
              <span>{floorPrice}</span>
            </div>
          </div>
          
          {/* Extended Details Section */}
          {showDetails && (
            <>
              <Separator className="my-2 bg-white/10" />
              
              <div className="mt-2 bg-purple-950/20 p-2 rounded-md border border-purple-500/20">
                <div className="grid grid-cols-1 gap-y-2">
                  <div className="flex items-center text-xs">
                    <Scan className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
                    <span className="text-white/70 mr-1">Transaction Hash:</span>
                    <span className="font-mono text-xs truncate">{transactionHash}</span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <Users className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
                    <span className="text-white/70 mr-1">Current Owner:</span>
                    <span>{uniqueHolder}</span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <Clock className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
                    <span className="text-white/70 mr-1">Last Transferred:</span>
                    <span>{lastTransferred}</span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <Sparkles className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
                    <span className="text-white/70 mr-1">Network:</span>
                    <span>{network}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between gap-2">
          <Button
            variant="outline"
            className="border border-white/20 hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border border-white/20 hover:bg-white/10"
              onClick={() => {
                // This would normally share the collectible URL
                navigator.clipboard.writeText(window.location.origin + '/?collectible=' + nft.id);
                alert('Digital collectible link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Link href="/">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                View Collection
              </Button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}