import { useState, useEffect } from 'react';
import { useCreationContext } from '@/context/CreationContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SelectPhotosProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SelectPhotos({ onNext, onBack }: SelectPhotosProps) {
  const { photos, selectedPhotos, selectPhoto, unselectPhoto } = useCreationContext();
  const [selectedCount, setSelectedCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedCount(selectedPhotos.length);
  }, [selectedPhotos]);

  const toggleSelection = (index: number) => {
    const isSelected = selectedPhotos.includes(photos[index]);
    
    if (isSelected) {
      unselectPhoto(photos[index]);
    } else {
      if (selectedCount < 3) {
        selectPhoto(photos[index]);
      } else {
        toast({
          title: "Maximum selection reached",
          description: "You can only select up to 3 photos. Deselect one to continue.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNext = () => {
    if (selectedPhotos.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please select at least 1 photo to continue.",
        variant: "destructive",
      });
      return;
    }
    
    onNext();
  };

  return (
    <div className="step-content">
      <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
        <h2 className="font-heading text-2xl font-bold mb-4 text-center">Select Your Favorite Photos</h2>
        <p className="text-center mb-6 text-white/70">Choose up to 3 photos to be turned into unique NFTs!</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {photos.map((photo, index) => (
            <div 
              key={index}
              className={`aspect-[3/4] relative rounded-lg overflow-hidden group cursor-pointer`}
              onClick={() => toggleSelection(index)}
            >
              <div className={`absolute inset-0 ${selectedPhotos.includes(photo) ? 'bg-primary/40' : 'bg-primary/20 hidden group-hover:block'}`}></div>
              <img 
                src={photo} 
                alt={`Selfie ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
              
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <i className={`fas fa-check text-white ${selectedPhotos.includes(photo) ? '' : 'hidden'}`}></i>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1A2E] to-transparent p-3">
                <span className="text-sm font-medium">Photo #{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mb-6">
          <p className="text-white/70">{selectedCount}/3 photos selected</p>
          <p className="text-sm text-white/50 mt-1">Select at least 1 photo to continue (max 3)</p>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline"
            className="px-6 py-2 border border-white/20 rounded-full font-medium text-white hover:bg-white/10 transition-colors"
            onClick={onBack}
          >
            ← Back
          </Button>
          
          <Button 
            className={`px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-white ${selectedCount > 0 ? '' : 'opacity-50 cursor-not-allowed'}`}
            onClick={handleNext}
            disabled={selectedCount === 0}
          >
            Next: Choose Style →
          </Button>
        </div>
      </div>
    </div>
  );
}
