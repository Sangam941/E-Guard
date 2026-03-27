'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function SilentModeManager() {
  const { isSilentModeActive, addEvidence } = useStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSilentModeActive) {
      // Simulate capturing evidence every 15 seconds
      interval = setInterval(() => {
        const types: ('photo' | 'video' | 'audio')[] = ['photo', 'audio'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Create a mock blob for silent evidence capture
        const mockBlob = new Blob(['mock-data'], { type: 'application/octet-stream' });
        addEvidence(mockBlob, randomType);
        
        // In a real app, this would also fetch location and upload to Cloudinary silently
      }, 15000);
    }

    return () => clearInterval(interval);
  }, [isSilentModeActive, addEvidence]);

  return null;
}
