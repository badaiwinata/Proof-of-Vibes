import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NFTCard from '../components/Gallery/NFTCard';
import NFTDetailModal from '../components/NFTDetailModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, RefreshCw, LayoutGrid, ChevronRight, LayoutList } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Nft } from '@shared/schema';

export default function Gallery() {
  const [, navigate] = useLocation();
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState<'all' | 'collections'>('all');
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data, isLoading, error, refetch, isFetching } = useQuery<{ nfts: Nft[] }>({
    queryKey: ['/api/nfts'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 10000, // Only consider data stale after 10 seconds
  });
  
  // Check URL for collectible parameter to auto-open modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collectibleId = params.get('collectible');
    
    if (collectibleId && data?.nfts) {
      const nft = data.nfts.find(n => n.id.toString() === collectibleId);
      if (nft) {
        setSelectedNft(nft);
        setDetailModalOpen(true);
      }
    }
    
    // Check for collection parameter
    const collectionId = params.get('collection');
    if (collectionId) {
      setSelectedCollection(collectionId);
      setViewMode('collections');
    }
  }, [data?.nfts]);

  const handleCreateClick = () => {
    navigate('/create');
  };
  
  const handleRefresh = () => {
    refetch().then(() => {
      toast({
        title: "Gallery refreshed",
        description: "The latest collectibles have been loaded",
        variant: "default",
        duration: 2000
      });
    });
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
  
  // Group NFTs by collection ID for the collections view
  const groupedByCollection = () => {
    if (!sortedNfts?.length) return {};
    
    const groups: Record<string, Nft[]> = {};
    
    sortedNfts.forEach(nft => {
      const collectionId = nft.collectionId || 'uncategorized';
      
      if (!groups[collectionId]) {
        groups[collectionId] = [];
      }
      
      groups[collectionId].push(nft);
    });
    
    return groups;
  };
  
  const collections = groupedByCollection();
  
  // Handle opening the detail modal for an NFT
  const handleNftClick = (nft: Nft) => {
    setSelectedNft(nft);
    setDetailModalOpen(true);
    
    // Update URL with collectible ID for sharing without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('collectible', nft.id.toString());
    window.history.pushState({}, '', url);
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setDetailModalOpen(false);
    
    // Remove the collectible parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('collectible');
    window.history.pushState({}, '', url);
  };
  
  // Handle viewing a specific collection
  const handleViewCollection = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setViewMode('collections');
    
    // Update URL with collection ID for sharing
    const url = new URL(window.location.href);
    url.searchParams.set('collection', collectionId);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header onCreateClick={handleCreateClick} />
      
      <main>
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-2xl font-bold">Event Memories</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 p-0 ${isFetching ? 'bg-white/10' : ''}`}
                onClick={handleRefresh}
                title={isFetching ? "Refreshing..." : "Refresh gallery"}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-purple-400' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-black/30 rounded-md p-1">
                <Button 
                  variant={viewMode === 'all' ? 'default' : 'ghost'} 
                  size="sm"
                  className={`rounded-md h-8 ${viewMode === 'all' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  onClick={() => setViewMode('all')}
                >
                  <LayoutList className="h-4 w-4 mr-2" />
                  All Items
                </Button>
                <Button 
                  variant={viewMode === 'collections' ? 'default' : 'ghost'} 
                  size="sm"
                  className={`rounded-md h-8 ${viewMode === 'collections' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  onClick={() => setViewMode('collections')}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Collections
                </Button>
              </div>
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
              <Button onClick={handleRefresh}>Retry</Button>
            </div>
          ) : (
            <>
              {viewMode === 'all' ? (
                // All Items View
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {sortedNfts.map((nft) => (
                    <div key={nft.id} onClick={() => handleNftClick(nft)}>
                      <NFTCard nft={nft} />
                    </div>
                  ))}
                </div>
              ) : (
                // Collections View 
                <div className="space-y-8">
                  {Object.entries(collections).map(([collectionId, nfts]) => (
                    <div key={collectionId} className="glassmorphism rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <LayoutGrid className="h-5 w-5 mr-2 text-purple-400" />
                          <h3 className="text-lg font-bold">{collectionId}</h3>
                          <span className="ml-2 text-sm text-white/70">({nfts.length} items)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white/70 hover:text-white"
                          onClick={() => handleViewCollection(collectionId)}
                        >
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {nfts.slice(0, 4).map((nft) => (
                          <div key={nft.id} onClick={() => handleNftClick(nft)} className="cursor-pointer">
                            <NFTCard nft={nft} />
                          </div>
                        ))}
                        
                        {nfts.length > 4 && (
                          <div 
                            className="relative rounded-xl overflow-hidden glassmorphism flex items-center justify-center cursor-pointer"
                            onClick={() => handleViewCollection(collectionId)}
                          >
                            {/* Show the first image that's not displayed yet */}
                            <img 
                              src={nfts[4]?.imageUrl} 
                              alt="More items in collection" 
                              className="w-full h-full object-cover opacity-30" 
                            />
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <span className="text-xl font-bold text-white">+{nfts.length - 4}</span>
                              <span className="text-sm text-white/70">more items</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {viewMode === 'all' && sortedNfts.length > 8 && (
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
      
      {/* NFT Detail Modal */}
      {selectedNft && (
        <NFTDetailModal
          nft={selectedNft}
          isOpen={detailModalOpen}
          onClose={handleCloseModal}
          onViewCollection={(collId) => handleViewCollection(collId)}
        />
      )}
    </div>
  );
}