import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useCreationContext } from '@/context/CreationContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle } from 'lucide-react';

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
    stopCamera,
    error
  } = useCamera();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [tries, setTries] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const sessionId = useRef<string>(crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      console.log('Initializing camera...');
      await initializeCamera();
      console.log('Camera initialized successfully');
    } catch (err) {
      console.error('Camera initialization error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast({
        title: "Camera error",
        description: `Failed to access your camera: ${errorMessage}. Please check your permissions.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initializeCamera, toast]);

  // Define takePicture function before it's used
  const takePicture = async () => {
    console.log('Taking picture, camera ready:', isCameraReady);
    
    // Check for camera readiness
    if (!isCameraReady) {
      console.log('Camera not ready, aborting photo capture');
      toast({
        title: "Camera not ready",
        description: "Please make sure camera is initialized before taking a photo.",
        variant: "destructive",
      });
      return;
    }
    
    // Activate flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);
    
    try {
      // Take photo
      console.log('Taking photo with camera');
      const photoData = await takePhoto();
      console.log('Photo taken:', photoData ? 'success' : 'failed');
      
      if (photoData) {
        // Add to context
        console.log('Adding photo to context');
        addPhoto(photoData);
        
        // Save to backend
        console.log('Saving photo to backend');
        savePhotoMutation.mutate(photoData);
        
        // Decrease tries
        setTries((prev) => prev - 1);
        console.log('Decreased tries');
      } else {
        console.log('No photo data returned');
        toast({
          title: "Failed to capture photo",
          description: "Camera returned no data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in takePicture:', error);
      toast({
        title: "Photo error",
        description: "An error occurred while taking the photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Start countdown and take photo when it reaches zero
  const startCountdown = useCallback(() => {
    console.log('Starting countdown');
    setCountdown(3);
    
    countdownRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        console.log('Countdown:', prevCount);
        if (prevCount === null || prevCount <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          console.log('Countdown finished, taking photo');
          // Take the photo when countdown reaches 0
          setTimeout(() => takePicture(), 0);
          return null;
        }
        return prevCount - 1;
      });
    }, 1000);
  }, []); // No dependencies since takePicture is not wrapped in useCallback

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
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);

  return (
    <div className="step-content">
      <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
        <h2 className="font-heading text-2xl font-bold mb-4 text-center">Capture Your Event Vibes</h2>
        <p className="text-center mb-6 text-white/70">Take up to 5 photos to choose from. Make sure you're in good lighting!</p>
        
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-[#1A1A2E] rounded-xl overflow-hidden camera-frame mb-6">
          {/* Camera View */}
          {!isInitialized && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
                  <p className="text-white/70">Initializing camera...</p>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <p className="text-white/90 font-medium">Camera error</p>
                  <p className="text-white/60 text-sm mt-2">{error}</p>
                  <Button 
                    className="mt-4 px-4 py-2 bg-primary/80 rounded-full text-white text-sm"
                    onClick={handleStartCamera}
                    disabled={isLoading}
                  >
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-white/50 mb-3" />
                  <p className="text-white/70">Camera access required</p>
                </>
              )}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Initializing...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Start Camera
                </>
              )}
            </Button>
          ) : (
            <Button 
              className="mb-4 px-6 py-3 bg-accent rounded-full font-bold text-white btn-glow"
              onClick={handleTakePhoto}
              disabled={tries <= 0 || countdown !== null || !isCameraReady}
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
