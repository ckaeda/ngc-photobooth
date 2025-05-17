// useCamera.js
import { useEffect, useState } from 'react';

export default function useCamera(videoRef) {
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let activeStream;

    const enableStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        activeStream = mediaStream;
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };

    enableStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef]);

  return stream;
}
