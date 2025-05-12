import { useState, useRef, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Create canvas for photo capture if it doesn't exist
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);
  
  // Helper function to check if camera is truly ready
  const checkCameraReady = useCallback(() => {
    return !!(
      videoRef.current && 
      videoRef.current.srcObject && 
      videoRef.current.videoWidth > 0 && 
      videoRef.current.videoHeight > 0
    );
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    console.log('Initializing camera...');
    try {
      // Reset error state
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = "Browser doesn't support camera access";
        console.error(errorMsg);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Clean up any existing stream before requesting a new one
      if (streamRef.current) {
        console.log('Cleaning up existing stream');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }

      console.log('Requesting camera access...');
      // Request camera access with fallback options
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }).catch(async (err) => {
        console.warn('Failed with ideal resolution, trying with default', err);
        // Fallback to default settings if ideal fails
        return navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      });

      console.log('Camera access granted:', stream);
      // Store the stream reference for cleanup
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        console.log('Attaching stream to video element');
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }
          
          // Listen for metadata loaded event
          videoRef.current.onloadedmetadata = () => {
            if (!videoRef.current) {
              reject(new Error('Video element not found after metadata loaded'));
              return;
            }
            
            console.log('Video metadata loaded, playing video...');
            videoRef.current.play()
              .then(() => {
                console.log('Video playing successfully');
                setIsInitialized(true);
                setIsCameraReady(true);
                // Add a short delay to ensure state updates are processed
                setTimeout(() => {
                  resolve();
                }, 500);
              })
              .catch(error => {
                console.error("Error playing video:", error);
                setError(`Error playing video: ${error.message}`);
                reject(error);
              });
          };
          
          // Also listen for errors
          videoRef.current.onerror = (event) => {
            const errorEvent = event as Event;
            const errorMsg = `Video error: ${errorEvent.type || 'unknown'}`;
            console.error(errorMsg, errorEvent);
            setError(errorMsg);
            reject(new Error(errorMsg));
          };
          
          // Set a timeout to prevent hanging if something goes wrong
          setTimeout(() => {
            if (!isCameraReady) {
              const errorMsg = 'Camera initialization timeout';
              console.error(errorMsg);
              setError(errorMsg);
              reject(new Error(errorMsg));
            }
          }, 10000);
        });
        
        return true;
      } else {
        const errorMsg = 'Video element not available';
        console.error(errorMsg);
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Camera initialization error:", errorMsg);
      setError(`Camera initialization error: ${errorMsg}`);
      setIsInitialized(false);
      setIsCameraReady(false);
      throw error;
    }
  }, []);

  // Take photo
  const takePhoto = useCallback(async (): Promise<string | null> => {
    console.log('Taking photo, camera ready check:', checkCameraReady());
    setError(null);
    
    try {
      // Check camera readiness and get video element
      if (!videoRef.current || !videoRef.current.srcObject) {
        const errorMsg = 'Camera not ready or no video stream';
        console.error(errorMsg);
        setError(errorMsg);
        return null;
      }
      
      const video = videoRef.current;
      
      // Get video dimensions - sometimes these might be 0 even if the stream is active
      let videoWidth = video.videoWidth;
      let videoHeight = video.videoHeight;
      
      if (!videoWidth || !videoHeight) {
        console.warn('Video dimensions unavailable, using fixed dimensions');
        videoWidth = 640;
        videoHeight = 480;
      }
      
      console.log('Using dimensions for capture:', videoWidth, 'x', videoHeight);
      
      // Use the persistent canvas reference
      const canvas = canvasRef.current!;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Get context and draw the frame
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const errorMsg = 'Could not get canvas context';
        console.error(errorMsg);
        setError(errorMsg);
        return null;
      }
      
      // Clear the canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the current video frame
      console.log('Drawing video to canvas');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      console.log('Converting to data URL');
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      if (!dataUrl || dataUrl === 'data:,') {
        const errorMsg = 'Failed to capture image - empty data URL';
        console.error(errorMsg);
        setError(errorMsg);
        return null;
      }
      
      console.log('Photo taken successfully, data URL length:', dataUrl.length);
      setPhotoTaken(dataUrl);
      return dataUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error taking photo:", errorMsg);
      setError(`Error taking photo: ${errorMsg}`);
      return null;
    }
  }, [checkCameraReady]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.id);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsInitialized(false);
    setIsCameraReady(false);
    setPhotoTaken(null);
    setError(null);
  }, []);

  // Check camera status periodically
  useEffect(() => {
    // Only run check if camera is initialized
    if (isInitialized) {
      // Set isCameraReady based on actual camera state
      const isReady = checkCameraReady();
      if (isReady !== isCameraReady) {
        console.log('Camera ready state changed:', isReady);
        setIsCameraReady(isReady);
      }
      
      // Set up periodic check for camera status
      const statusCheckInterval = setInterval(() => {
        const ready = checkCameraReady();
        if (ready !== isCameraReady) {
          console.log('Camera status updated:', ready);
          setIsCameraReady(ready);
        }
      }, 1000);
      
      return () => {
        clearInterval(statusCheckInterval);
      };
    }
  }, [isInitialized, isCameraReady, checkCameraReady]);
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    photoTaken,
    isInitialized,
    isCameraReady,
    error,
    initializeCamera,
    takePhoto,
    stopCamera
  };
}
