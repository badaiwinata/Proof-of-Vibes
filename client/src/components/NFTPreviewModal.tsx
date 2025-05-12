import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, X, Award, Calendar, Sparkles } from 'lucide-react';
import { Nft } from '@shared/schema';
import { Link } from 'wouter';

interface NFTPreviewModalProps {
  nft: Nft | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NFTPreviewModal({ nft, isOpen, onClose }: NFTPreviewModalProps) {
  if (!nft) return null;

  // Format date if present, or use current date
  const formattedDate = nft.eventDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Use certificate ID if present, or generate a placeholder
  const certificateId = nft.certificateId || `POV-${nft.id}-${Date.now().toString().slice(-6)}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#1A1A2E] border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Digital Collectible</DialogTitle>
          <DialogDescription className="text-white/70">
            Your exclusive event memorabilia
          </DialogDescription>
        </DialogHeader>
        
        {/* Certificate Banner */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center py-1 text-xs font-medium rounded-t-md">
          CERTIFICATE OF AUTHENTICITY
        </div>
        
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
          <img 
            src={nft.imageUrl} 
            alt="Digital Collectible" 
            className="w-full h-full object-cover" 
          />
          
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
          <div className="flex items-center mb-2">
            <Award className="h-4 w-4 mr-2 text-purple-300" />
            <p>Certificate ID: <span className="text-white font-mono text-xs">{certificateId}</span></p>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-purple-300" />
            <p>Created: {formattedDate}</p>
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
                // This would normally share the collectible URL
                navigator.clipboard.writeText(window.location.origin + '/?collectible=' + nft.id);
                alert('Digital collectible link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                View Collection
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}