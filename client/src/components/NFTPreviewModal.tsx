import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, X } from 'lucide-react';
import { Nft } from '@shared/schema';
import { Link } from 'wouter';

interface NFTPreviewModalProps {
  nft: Nft | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NFTPreviewModal({ nft, isOpen, onClose }: NFTPreviewModalProps) {
  if (!nft) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#1A1A2E] border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">NFT Preview</DialogTitle>
          <DialogDescription className="text-white/70">
            Your NFT has been minted successfully
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mt-4">
          <img 
            src={nft.imageUrl} 
            alt="NFT Preview" 
            className="w-full h-full object-cover" 
          />
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A2E] to-transparent">
              <div className="flex gap-2 mb-2">
                {nft.vibes.map((vibe, i) => (
                  <span key={i} className="bg-white/20 text-xs px-2 py-1 rounded-full">#{vibe}</span>
                ))}
              </div>
              <p className="text-sm font-medium">"{nft.message}"</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
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
                // This would normally share the NFT URL
                navigator.clipboard.writeText(window.location.origin + '/?nft=' + nft.id);
                alert('NFT link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                View in Gallery
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}