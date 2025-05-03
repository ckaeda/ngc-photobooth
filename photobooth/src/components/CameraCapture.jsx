import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Image } from 'react-bootstrap';
import useCamera from '../hooks/useCamera';

function CameraCapture({ onCaptureComplete }) {
  const COUNTDOWN = 1;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const [photoIndex, setPhotoIndex] = useState(0);


  useCamera(videoRef); // initialize camera stream

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const previewAspectRatio = 16 / 9;
    const { videoWidth, videoHeight } = video;

    // Calculate cropping area (center crop to 16:9)
    let srcWidth = videoWidth;
    let srcHeight = videoWidth / previewAspectRatio;

    if (srcHeight > videoHeight) {
      srcHeight = videoHeight;
      srcWidth = videoHeight * previewAspectRatio;
    }

    const sx = (videoWidth - srcWidth) / 2;
    const sy = (videoHeight - srcHeight) / 2;

    // Set canvas size to cropped frame
    canvas.width = srcWidth;
    canvas.height = srcHeight;

    // Draw cropped area
    ctx.drawImage(video, sx, sy, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);

    const imageData = canvas.toDataURL('image/png');
    setPhotos((prev) => [...prev, imageData]);
  };


  const handleCapture = () => {
    setPhotos([]);
    setPhotoIndex(0);
    setCountdown(COUNTDOWN);
    setIsCapturing(true);
  };

  useEffect(() => {
    let timeoutId;

    const captureWithDelay = async (index) => {
      if (index >= 3) {
        setIsCapturing(false);
        return;
      }

      setCountdown(COUNTDOWN);

      for (let i = COUNTDOWN; i > 0; i--) {
        await new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            setCountdown((prev) => prev - 1);
            resolve();
          }, COUNTDOWN * 100);
        });
      }

      capturePhoto();
      setPhotoIndex(index + 1);
      captureWithDelay(index + 1);
    };

    if (isCapturing) {
      captureWithDelay(0);
    }

    return () => clearTimeout(timeoutId);
  }, [isCapturing]);


  useEffect(() => {
    if (photos.length === 3) {
      onCaptureComplete(photos);
    }
  }, [photos, onCaptureComplete]);

  return (
    <Container fluid className="py-4 d-flex justify-content-center">
      <div className="d-flex flex-row flex-wrap align-items-start justify-content-center w-100" style={{ maxWidth: '100%' }}>

        {/* Camera Preview Section */}
        <div className="flex-grow-1 text-center mb-4 mb-md-0 position-relative" style={{ flexBasis: '60%' }}>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="border rounded w-100"
              style={{
                maxWidth: '50rem',
                height: 'auto',
                aspectRatio: '16 / 9',
                objectFit: 'cover',
              }}
            />
            {isCapturing && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '8rem',
                  fontWeight: 'bold',
                  color: 'white',
                  opacity: countdown/10,
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                  pointerEvents: 'none',
                }}
              >
                {countdown > 0 ? countdown : ''}
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Controls (Button + Thumbnails) */}
        <div className="d-flex flex-column align-items-center" style={{ flexBasis: '35%', minWidth: '250px' }}>
          <Button
            variant="primary"
            onClick={handleCapture}
            disabled={isCapturing}
            className="mb-3"
          >
            {isCapturing ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{' '}
                Capturing...
              </>
            ) : (
              'Start Capturing'
            )}
          </Button>

          <div className="d-flex flex-column align-items-center gap-2 flex-grow-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="mb-2">
                {photos[index] ? (
                  <Image
                    src={photos[index]}
                    thumbnail
                    style={{
                      width: '12rem',
                      height: 'auto',
                      aspectRatio: '16 / 9',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '12rem',
                      height: 'auto',
                      aspectRatio: '16 / 9',
                      border: '2px dashed #ccc',
                      borderRadius: '5px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default CameraCapture;
