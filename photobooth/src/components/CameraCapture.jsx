import { useState, useRef, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import useCamera from '../hooks/useCamera';
import { GLOBAL } from '../../config/config';

function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(GLOBAL.IMAGE_COUNTDOWN);
  const [isMirrored, setIsMirrored] = useState(false);
  const [flash, setFlash] = useState(false);

  useCamera(videoRef); // initialize camera stream

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const previewAspectRatio = GLOBAL.ASPECT_RATIO;
    const { videoWidth, videoHeight } = video;

    let srcWidth = videoWidth;
    let srcHeight = videoWidth / previewAspectRatio;

    if (srcHeight > videoHeight) {
      srcHeight = videoHeight;
      srcWidth = videoHeight * previewAspectRatio;
    }

    const sx = (videoWidth - srcWidth) / 2;
    const sy = (videoHeight - srcHeight) / 2;

    canvas.width = srcWidth;
    canvas.height = srcHeight;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
    if (isMirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const imageData = canvas.toDataURL(GLOBAL.IMAGE_FORMAT);
    setPhotos((prev) => [...prev, imageData]);
  };

  const handleCapture = () => {
    setPhotos([]);
    setCountdown(GLOBAL.IMAGE_COUNTDOWN);
    setIsCapturing(true);
  };

  useEffect(() => {
    let timeoutId;

    const captureWithDelay = async (index) => {
      if (index >= GLOBAL.MAX_PHOTOS) {
        setIsCapturing(false);
        return;
      }

      setCountdown(GLOBAL.IMAGE_COUNTDOWN);

      for (let i = GLOBAL.IMAGE_COUNTDOWN; i > 0; i--) {
        await new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            setCountdown((prev) => prev - 1);
            resolve();
          }, 1000); // 2 second per countdown tick
        });
      }

      capturePhoto();

      // Pause the preview for 1 second
      if (videoRef.current) videoRef.current.pause();

      await new Promise((resolve) => setTimeout(resolve, GLOBAL.CAPTURE_COUNTDOWN*1000));

      if (videoRef.current) videoRef.current.play();

      captureWithDelay(index + 1);
    };

    if (isCapturing) {
      captureWithDelay(0);
    }

    return () => clearTimeout(timeoutId);
  }, [isCapturing]);

  useEffect(() => {
    if (photos.length === GLOBAL.MAX_PHOTOS) {
      onCaptureComplete(photos);
    }
  }, [photos, onCaptureComplete]);

  return (
    <Container fluid className="py-4 d-flex flex-column align-items-center">
      <div className="position-relative w-100" style={{ maxWidth: '70rem' }}>
        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="border rounded w-100"
          style={{
            aspectRatio: GLOBAL.ASPECT_RATIO_STR,
            objectFit: 'cover',
            transform: isMirrored ? 'scaleX(-1)' : 'none',
          }}
        />
        {flash && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 3,
              background: 'radial-gradient(circle, rgba(255,255,255,0) 40%, rgba(255,255,255,0.6) 100%)',
              // opacity: 0.8,
              transition: 'opacity 0.3s ease-out',
            }}
          />
        )}

        {/* Countdown Overlay */}
        {isCapturing && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '10rem',
              fontWeight: 'bold',
              color: 'white',
              opacity: countdown / 10,
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
            }}
          >
            {countdown > 0 ? countdown : ''}
          </div>
        )}

        {/* Start Capture Button */}
        {!isCapturing && (
          <Button
            variant="light"
            onClick={handleCapture}
            className="position-absolute"
            style={{
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255,255,255,0.7)',
              border: 'none',
              padding: '0.6rem 1.2rem',
              fontWeight: 'bold',
              zIndex: 2,
            }}
          >
            Start Capturing
          </Button>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Mirror Camera Button Below Preview */}
      {!isCapturing && (
        <div className="mt-3">
          <Button
            variant="secondary"
            onClick={() => setIsMirrored((prev) => !prev)}
            size="sm"
          >
            Mirror Camera
          </Button>
        </div>
      )}
    </Container>

  );
}

export default CameraCapture;
