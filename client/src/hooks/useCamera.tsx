import { useState, useRef, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser doesn't support camera access");
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      // Store the stream reference for cleanup
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => {
                  setIsCameraReady(true);
                  resolve();
                }).catch(error => {
                  console.error("Error playing video:", error);
                  throw error;
                });
              }
            };
          }
        });

        setIsInitialized(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Camera initialization error:", error);
      throw error;
    }
  }, []);

  // Take photo
  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!isCameraReady || !videoRef.current) return null;

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoTaken(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error("Error taking photo:", error);
      return null;
    }
  }, [isCameraReady]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsInitialized(false);
    setIsCameraReady(false);
    setPhotoTaken(null);
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
    initializeCamera,
    takePhoto,
    stopCamera
  };
}
