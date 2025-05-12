import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import type { Nft } from '@shared/schema';

interface NFTCardProps {
  nft: Nft;
}

export default function NFTCard({ nft }: NFTCardProps) {
  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(nft.createdAt), { addSuffix: true });
  
  return (
    <div className="nft-card rounded-xl overflow-hidden glassmorphism">
      <div className="relative photo-frame overflow-hidden">
        <img 
          src={nft.imageUrl} 
          alt={`NFT with message: ${nft.message}`} 
          className="w-full h-full object-cover" 
        />
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
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-white/60">{timeAgo}</span>
          <Link href={`/nft/${nft.id}`}>
            <a className="text-xs text-primary hover:text-accent transition-colors">View</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
