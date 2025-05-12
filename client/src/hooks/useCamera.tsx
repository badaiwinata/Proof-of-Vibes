import { useState, useRef, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
                setIsCameraReady(true);
                setIsInitialized(true);
                resolve();
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
  }, [isCameraReady]);

  // Take photo
  const takePhoto = useCallback(async (): Promise<string | null> => {
    console.log('Taking photo, camera ready:', isCameraReady, 'video ref:', !!videoRef.current);
    setError(null);
    
    if (!isCameraReady) {
      setError('Camera not ready');
      return null;
    }
    
    if (!videoRef.current) {
      setError('Video element not found');
      return null;
    }

    try {
      // Make sure video has dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      if (!videoWidth || !videoHeight) {
        console.error('Video dimensions not available', { videoWidth, videoHeight });
        setError('Video dimensions not available');
        return null;
      }
      
      console.log('Creating canvas with dimensions:', videoWidth, 'x', videoHeight);
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        setError('Could not get canvas context');
        return null;
      }

      console.log('Drawing video to canvas');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      console.log('Converting to data URL');
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Photo taken successfully, data URL length:', dataUrl.length);
      setPhotoTaken(dataUrl);
      return dataUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error taking photo:", errorMsg);
      setError(`Error taking photo: ${errorMsg}`);
      return null;
    }
  }, [isCameraReady]);

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
