import { useState, useRef, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useCreationContext } from '@/context/CreationContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TakePhotosProps {
  onNext: () => void;
}

export default function TakePhotos({ onNext }: TakePhotosProps) {
  const { addPhoto, photos } = useCreationContext();
  const { 
    videoRef, 
    photoTaken, 
    isInitialized,
    isCameraReady,
    initializeCamera, 
    takePhoto,
    stopCamera
  } = useCamera();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [tries, setTries] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const sessionId = useRef<string>(crypto.randomUUID());

  // Save photo to backend
  const savePhotoMutation = useMutation({
    mutationFn: async (photoData: string) => {
      return apiRequest('POST', '/api/photos', {
        sessionId: sessionId.current,
        imageData: photoData
      });
    },
    onSuccess: () => {
      toast({
        title: "Photo saved",
        description: "Your photo has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving photo",
        description: error.message || "Failed to save your photo. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStartCamera = useCallback(async () => {
    try {
      await initializeCamera();
    } catch (error) {
      toast({
        title: "Camera error",
        description: "Failed to access your camera. Please check your permissions.",
        variant: "destructive",
      });
    }
  }, [initializeCamera, toast]);

  const startCountdown = useCallback(() => {
    setCountdown(3);
    
    countdownRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount === null || prevCount <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          // Take the photo when countdown reaches 0
          capturePhoto();
          return null;
        }
        return prevCount - 1;
      });
    }, 1000);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!isCameraReady) return;
    
    // Activate flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);
    
    // Take photo
    const photoData = await takePhoto();
    
    if (photoData) {
      // Add to context
      addPhoto(photoData);
      
      // Save to backend
      savePhotoMutation.mutate(photoData);
      
      // Decrease tries
      setTries((prev) => prev - 1);
    }
  }, [isCameraReady, takePhoto, addPhoto, savePhotoMutation]);

  const handleTakePhoto = useCallback(() => {
    if (tries <= 0) {
      toast({
        title: "No tries left",
        description: "You've used all your photo attempts.",
        variant: "destructive",
      });
      return;
    }
    
    startCountdown();
  }, [tries, startCountdown, toast]);

  // Clean up on unmount
  const cleanupCamera = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    stopCamera();
  }, [stopCamera]);

  return (
    <div className="step-content">
      <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
        <h2 className="font-heading text-2xl font-bold mb-4 text-center">Capture Your Event Vibes</h2>
        <p className="text-center mb-6 text-white/70">Take up to 5 photos to choose from. Make sure you're in good lighting!</p>
        
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-[#1A1A2E] rounded-xl overflow-hidden camera-frame mb-6">
          {/* Camera View */}
          {!isInitialized && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <i className="fas fa-camera text-4xl mb-3 text-white/50"></i>
              <p className="text-white/50">Camera access required</p>
            </div>
          )}
          
          <video 
            ref={videoRef}
            className={`w-full h-full object-cover ${isInitialized ? '' : 'hidden'}`} 
            autoPlay 
            playsInline
          ></video>
          
          {/* Camera Overlay Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-4 bg-[#1A1A2E]/70 p-2 rounded-full">
              <span className="text-sm font-bold">{photos.length}/5</span>
            </div>
            
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-6xl font-bold text-white">{countdown}</span>
              </div>
            )}
            
            {flashActive && (
              <div className="absolute inset-0 bg-white animate-flash"></div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          {!isInitialized ? (
            <Button 
              className="mb-4 px-6 py-3 bg-primary rounded-full font-bold text-white btn-glow flex items-center"
              onClick={handleStartCamera}
            >
              <i className="fas fa-camera-retro mr-2"></i>
              Start Camera
            </Button>
          ) : (
            <Button 
              className="mb-4 px-6 py-3 bg-accent rounded-full font-bold text-white btn-glow"
              onClick={handleTakePhoto}
              disabled={tries <= 0 || countdown !== null}
            >
              Take Photo
              <span className="ml-2 text-sm opacity-70">({tries} left)</span>
            </Button>
          )}
          
          <p className="text-sm text-white/60 text-center max-w-md">
            By taking a photo, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
        
        {/* Thumbnail Preview Grid */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {[...Array(5)].map((_, index) => (
            <div 
              key={index}
              className="aspect-square rounded bg-white/10 flex items-center justify-center overflow-hidden"
            >
              {index < photos.length ? (
                <img 
                  src={photos[index]} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-white/50">Empty</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          {photos.length > 0 && (
            <Button 
              className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-white"
              onClick={onNext}
            >
              Next: Select Photos <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
