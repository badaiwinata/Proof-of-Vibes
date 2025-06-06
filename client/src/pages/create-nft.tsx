import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressIndicator from '../components/CreationFlow/ProgressIndicator';
import TakePhotos from '../components/CreationFlow/TakePhotos';
import SelectPhotos from '../components/CreationFlow/SelectPhotos';
import ChooseTemplate from '../components/CreationFlow/ChooseTemplate';
import EditionSelection from '../components/CreationFlow/EditionSelection';
import MintNFTs from '../components/CreationFlow/MintNFTs';
import ClaimNFTs from '../components/CreationFlow/ClaimNFTs';
import { useCreationContext } from '../context/CreationContext';
import { useToast } from '@/hooks/use-toast';

type Step = 'take-photos' | 'select-photos' | 'choose-template' | 'mint-nfts' | 'claim-nfts';

export default function CreateNFT() {
  const [currentStep, setCurrentStep] = useState<Step>('take-photos');
  const [showEditionSelection, setShowEditionSelection] = useState(false);
  const [, navigate] = useLocation();
  const { 
    resetCreationState, 
    selectedPhotos, 
    photos, 
    setEditionCount, 
    editionCount 
  } = useCreationContext();
  const { toast } = useToast();

  // Reset creation state when component unmounts
  useEffect(() => {
    return () => {
      resetCreationState();
    };
  }, [resetCreationState]);

  const handleNext = (step: Step) => {
    console.log(`Navigating to next step: ${step}, current photos:`, photos.length, 'selected photos:', selectedPhotos.length);
    
    // Validate steps before proceeding
    if (step === 'select-photos' && photos.length === 0) {
      console.log('Cannot proceed - no photos taken');
      toast({
        title: "No photos taken",
        description: "Please take at least one photo before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Setting current step to: ${step}`);
    setCurrentStep(step);
  };

  const handleBack = (step: Step) => {
    setCurrentStep(step);
  };

  const handleFinish = () => {
    resetCreationState();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header onCreateClick={() => {}} hideCreateButton />
      
      <main>
        <div>
          <ProgressIndicator currentStep={currentStep} />
          
          {/* Debug info - currentStep value */}
          <div className="fixed top-2 right-2 bg-black/50 text-xs text-white px-2 py-1 rounded z-50">
            Current step: {currentStep} | Photos: {photos.length} | Selected: {selectedPhotos.length} | Editions: {editionCount}
          </div>
          
          {/* Edition Selection Popup */}
          <EditionSelection 
            isOpen={showEditionSelection}
            onCancel={() => setShowEditionSelection(false)}
            onConfirm={(count) => {
              setEditionCount(count);
              setShowEditionSelection(false);
              handleNext('mint-nfts');
            }}
          />
          
          {currentStep === 'take-photos' && (
            <TakePhotos 
              onNext={() => {
                console.log('TakePhotos onNext called, navigating to select-photos');
                handleNext('select-photos');
              }} 
            />
          )}
          
          {currentStep === 'select-photos' && (
            <SelectPhotos 
              onNext={() => handleNext('choose-template')} 
              onBack={() => handleBack('take-photos')} 
            />
          )}
          
          {currentStep === 'choose-template' && (
            <ChooseTemplate 
              onNext={() => {
                // Show edition selection popup instead of going directly to mint
                console.log("ChooseTemplate onNext called, showing edition selection dialog");
                setShowEditionSelection(true);
              }} 
              onBack={() => handleBack('select-photos')} 
            />
          )}
          
          {currentStep === 'mint-nfts' && (
            <MintNFTs 
              onNext={() => handleNext('claim-nfts')} 
              onBack={() => handleBack('choose-template')} 
            />
          )}
          
          {currentStep === 'claim-nfts' && (
            <ClaimNFTs onFinish={handleFinish} />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
