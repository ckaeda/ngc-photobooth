import { useState, useRef, useEffect } from 'react';
import useCamera from '../hooks/useCamera'; // custom hook to manage camera

function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useCamera(videoRef); // hook to initialize camera stream

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const video = videoRef.current;

    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageData = canvasRef.current.toDataURL('image/png');
    setPhotos((prev) => [...prev, imageData]);
  };

  const handleCapture = () => {
    if (photos.length < 3) {
      capturePhoto();
    }
  };

  useEffect(() => {
    if (photos.length === 3) {
      onCaptureComplete(photos); // pass the 3 captured images to parent
    }
  }, [photos, onCaptureComplete]);

  return (
    <div className="camera-capture-container">
      <video ref={videoRef} autoPlay playsInline className="camera-view" />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="controls">
        <button onClick={handleCapture} disabled={isCapturing || photos.length >= 3}>
          {photos.length < 3 ? `Capture Photo ${photos.length + 1}` : 'Done'}
        </button>
      </div>

      <div className="preview-thumbnails">
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`Captured ${index + 1}`} className="thumbnail" />
        ))}
      </div>
    </div>
  );
}

export default CameraCapture;
