import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { Award, CheckCircle2, Clock, Sparkles, Diamond, Hash, User, CreditCard, Eye, LayoutGrid } from 'lucide-react';
import type { Nft } from '@shared/schema';
import { Badge } from '@/components/ui/badge';

interface NFTCardProps {
  nft: Nft;
}

export default function NFTCard({ nft }: NFTCardProps) {
  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(nft.createdAt), { addSuffix: true });
  
  // Format claim time if available
  const claimTimeAgo = nft.claimedAt 
    ? formatDistanceToNow(new Date(nft.claimedAt), { addSuffix: true })
    : null;
  
  // Set rarity level based on template
  const rarityMap = {
    'classic': 'Common',
    'neon': 'Rare',
    'retro': 'Uncommon',
    'minimal': 'Epic'
  };
  
  const rarity = rarityMap[nft.template as keyof typeof rarityMap] || 'Rare';
  
  // Floor price based on rarity
  const floorPriceMap = {
    'Common': '0.01 SOL',
    'Uncommon': '0.05 SOL',
    'Rare': '0.15 SOL',
    'Epic': '0.5 SOL'
  };
  
  const floorPrice = floorPriceMap[rarity as keyof typeof floorPriceMap];
  
  // Certificate ID or generate a placeholder
  const certificateId = nft.certificateId || `POV-${nft.id}-${Date.now().toString().slice(-6)}`;
  
  // Creator name from event info or default
  const creatorName = "Proof of Vibes";
  
  // The parent will handle the click event, this is now just for display

  return (
    <div 
      className="nft-card rounded-xl overflow-hidden glassmorphism relative cursor-pointer transform hover:scale-[1.02] transition-all duration-200"
    >
      {/* Status Banner - Show claimed status */}
      {nft.claimed ? (
        <div className="absolute top-2 right-2 z-10 bg-emerald-500/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center shadow-lg">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Claimed
        </div>
      ) : (
        <div className="absolute top-2 right-2 z-10 bg-indigo-500/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center shadow-lg">
          <Award className="h-3 w-3 mr-1" />
          Certified
        </div>
      )}
      
      {/* Collection ID - Show if this NFT is part of a batch */}
      {nft.collectionId && (
        <div className="absolute top-12 right-2 z-10 bg-purple-600/70 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center shadow-sm backdrop-blur-sm">
          <LayoutGrid className="h-2.5 w-2.5 mr-1" />
          Collection #{nft.collectionId}
        </div>
      )}
      
      {/* Edition Badge - Show if this NFT is part of a limited edition */}
      {nft.editionNumber && nft.editionCount && (
        <div className="absolute top-24 right-2 z-10 bg-indigo-600/70 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center shadow-sm backdrop-blur-sm">
          <Award className="h-2.5 w-2.5 mr-1" />
          Edition {nft.editionNumber}/{nft.editionCount}
        </div>
      )}
      
      {/* Rarity Badge */}
      <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-2 py-0.5 rounded-br-md font-medium">
        {rarity.toUpperCase()}
      </div>
      
      <div className="relative photo-frame overflow-hidden">
        <img 
          src={nft.imageUrl} 
          alt={`Collectible: ${nft.message}`} 
          className="w-full h-full object-cover" 
        />
        
        {/* Event Branding Watermark */}
        <div className="absolute top-8 left-2 bg-black/40 backdrop-blur-sm p-1 rounded-md text-xs flex items-center">
          <Sparkles className="h-3 w-3 mr-1 text-purple-300" />
          <span className="font-medium">{nft.eventName || "Proof of Vibes"}</span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#1A1A2E]/90 to-transparent">
          <div className="flex flex-wrap gap-1">
            {nft.vibes.map((vibe, index) => (
              <span key={index} className="vibe-tag text-xs px-2 py-1 rounded-full">#{vibe}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-sm font-medium truncate">"{nft.message || 'No message'}"</p>
        
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
          {/* Time Info */}
          <div className="flex items-center text-xs text-white/60">
            <Clock className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
            <span className="truncate">{timeAgo}</span>
          </div>
          
          {/* Creator Info */}
          <div className="flex items-center text-xs text-white/60">
            <User className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
            <span className="truncate">{creatorName}</span>
          </div>
          
          {/* Certificate ID */}
          <div className="flex items-center text-xs text-white/60">
            <Hash className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
            <span className="font-mono truncate">{certificateId.slice(-8)}</span>
          </div>
          
          {/* Floor Price */}
          <div className="flex items-center text-xs text-white/60">
            <CreditCard className="h-3 w-3 mr-1 text-purple-300 flex-shrink-0" />
            <span className="truncate">{floorPrice}</span>
          </div>
        </div>
        
        {/* Recipient if claimed */}
        {nft.claimed && nft.recipientName && (
          <div className="mt-2 text-xs text-white/80 bg-purple-500/10 px-2 py-1 rounded-md">
            <span className="font-medium">Owner: </span>
            <span>{nft.recipientName}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <Badge variant="outline" className="text-[10px] h-5 border-purple-500/30 text-purple-300">
            <Diamond className="h-2.5 w-2.5 mr-1" />
            {rarity}
          </Badge>
          
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              // Now handled by parent component
            }} 
            className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-1 rounded-full text-white hover:from-indigo-600 hover:to-purple-700 transition-colors"
          >
            View Certificate
          </button>
        </div>
      </div>
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium flex items-center">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </div>
      </div>
    </div>
  );
}
