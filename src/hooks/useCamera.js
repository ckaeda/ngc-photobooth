import { useEffect, useState } from 'react';

function useCamera(videoRef, deviceId) {
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let activeStream;

    const enableStream = async () => {
      try {
        // Stop previous stream before requesting new one
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        };

        activeStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }

        setStream(activeStream);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    enableStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef, deviceId]);

  return stream;
}

export default useCamera;
