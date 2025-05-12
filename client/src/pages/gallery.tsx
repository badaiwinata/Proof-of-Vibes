import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NFTCard from '../components/Gallery/NFTCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown } from 'lucide-react';
import type { Nft } from '@shared/schema';

export default function Gallery() {
  const [, navigate] = useLocation();
  const [sortBy, setSortBy] = useState('latest');
  
  const { data, isLoading, error } = useQuery<{ nfts: Nft[] }>({
    queryKey: ['/api/nfts'],
  });

  const handleCreateClick = () => {
    navigate('/create');
  };

  // Sorting logic
  const sortNfts = (nfts: Nft[]) => {
    if (!nfts) return [];
    
    const sortedNfts = [...nfts];
    
    switch (sortBy) {
      case 'latest':
        return sortedNfts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return sortedNfts.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return sortedNfts;
    }
  };

  const sortedNfts = data ? sortNfts(data.nfts) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header onCreateClick={handleCreateClick} />
      
      <main>
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading text-2xl font-bold">Event Memories</h2>
            <div className="flex items-center space-x-2 text-sm">
              <span>Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-[#1A1A2E] border border-white/20 rounded-md w-32">
                  <SelectValue placeholder="Latest" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border border-white/20">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="rounded-xl overflow-hidden glassmorphism">
                  <div className="photo-frame">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="p-3">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Failed to load NFTs. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {sortedNfts.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
              
              {sortedNfts.length > 8 && (
                <div className="flex justify-center mt-6">
                  <Button 
                    variant="outline" 
                    className="border border-white/20 hover:bg-white/10"
                  >
                    Load more <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
