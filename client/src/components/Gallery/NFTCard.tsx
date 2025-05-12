import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { Award, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { Nft } from '@shared/schema';

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
  
  return (
    <div className="nft-card rounded-xl overflow-hidden glassmorphism relative">
      {/* Status Banner - Show either claimed or certificate */}
      {nft.claimed ? (
        <div className="absolute top-2 right-2 z-10 bg-emerald-500/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center shadow-lg">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Claimed
        </div>
      ) : nft.certificateId && (
        <div className="absolute top-2 right-2 z-10 bg-indigo-500/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center shadow-lg">
          <Award className="h-3 w-3 mr-1" />
          Certified
        </div>
      )}
      
      <div className="relative photo-frame overflow-hidden">
        <img 
          src={nft.imageUrl} 
          alt={`Collectible: ${nft.message}`} 
          className="w-full h-full object-cover" 
        />
        
        {/* Event Branding Watermark */}
        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1 rounded-md text-xs flex items-center">
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
        
        {/* Time and Certificate Info */}
        <div className="flex items-center mt-2 text-xs text-white/60">
          <Clock className="h-3 w-3 mr-1" />
          <span>{timeAgo}</span>
        </div>
        
        {/* Recipient if claimed */}
        {nft.claimed && nft.recipientName && (
          <div className="mt-1 text-xs text-white/80">
            <span className="font-medium">Owner: </span>
            <span>{nft.recipientName}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          {nft.certificateId && (
            <div className="text-xs text-white/60 truncate max-w-[120px]">
              <span className="font-mono">ID: {nft.certificateId.slice(-8)}</span>
            </div>
          )}
          
          <Link href={`/nft/${nft.id}`}>
            <a className="text-xs text-primary hover:text-accent transition-colors">
              View Details
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
