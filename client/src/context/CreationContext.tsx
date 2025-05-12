import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Nft } from '@shared/schema';

// Types
type TemplateSelection = {
  template: string;
  message: string;
  vibes: string[];
};

interface CreationContextType {
  photos: string[];
  selectedPhotos: string[];
  templateSelection: TemplateSelection;
  editionCount: number;
  mintedNfts: Nft[];
  addPhoto: (photoData: string) => void;
  removePhoto: (photoData: string) => void;
  selectPhoto: (photoData: string) => void;
  unselectPhoto: (photoData: string) => void;
  setTemplateSelection: (selection: TemplateSelection) => void;
  setEditionCount: (count: number) => void;
  setMintedNfts: (nfts: Nft[]) => void;
  resetCreationState: () => void;
}

// Default values
const defaultTemplateSelection: TemplateSelection = {
  template: 'classic',
  message: '',
  vibes: []
};

// Create context
const CreationContext = createContext<CreationContextType | undefined>(undefined);

// Provider component
export const CreationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [templateSelection, setTemplateSelection] = useState<TemplateSelection>(defaultTemplateSelection);
  const [editionCount, setEditionCount] = useState<number>(3); // Default to 3 editions
  const [mintedNfts, setMintedNfts] = useState<Nft[]>([]);

  // Add a new photo
  const addPhoto = useCallback((photoData: string) => {
    setPhotos(prev => [...prev, photoData]);
  }, []);

  // Remove a photo
  const removePhoto = useCallback((photoData: string) => {
    setPhotos(prev => prev.filter(photo => photo !== photoData));
    // Also remove from selected photos if selected
    setSelectedPhotos(prev => prev.filter(photo => photo !== photoData));
  }, []);

  // Select a photo for NFT creation
  const selectPhoto = useCallback((photoData: string) => {
    setSelectedPhotos(prev => [...prev, photoData]);
  }, []);

  // Unselect a photo
  const unselectPhoto = useCallback((photoData: string) => {
    setSelectedPhotos(prev => prev.filter(photo => photo !== photoData));
  }, []);

  // Reset the creation state
  const resetCreationState = useCallback(() => {
    setPhotos([]);
    setSelectedPhotos([]);
    setTemplateSelection(defaultTemplateSelection);
    setEditionCount(3); // Reset to default
    setMintedNfts([]);
  }, []);

  const value = {
    photos,
    selectedPhotos,
    templateSelection,
    editionCount,
    mintedNfts,
    addPhoto,
    removePhoto,
    selectPhoto,
    unselectPhoto,
    setTemplateSelection,
    setEditionCount,
    setMintedNfts,
    resetCreationState
  };

  return (
    <CreationContext.Provider value={value}>
      {children}
    </CreationContext.Provider>
  );
};

// Custom hook to use the context
export const useCreationContext = () => {
  const context = useContext(CreationContext);
  if (context === undefined) {
    throw new Error('useCreationContext must be used within a CreationProvider');
  }
  return context;
};
