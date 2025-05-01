import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Image } from 'react-bootstrap';
import useCamera from '../hooks/useCamera';

function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [photoIndex, setPhotoIndex] = useState(0);
  const intervalRef = useRef(null);

  useCamera(videoRef); // initialize camera stream

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageData = canvas.toDataURL('image/png');
    setPhotos((prev) => [...prev, imageData]);
  };

  const handleCapture = () => {
    setPhotos([]);
    setPhotoIndex(0);
    setCountdown(10);
    setIsCapturing(true);
  };

  useEffect(() => {
    let timeoutId;

    const captureWithDelay = async (index) => {
      if (index >= 3) {
        setIsCapturing(false);
        return;
      }

      setCountdown(10);

      for (let i = 10; i > 0; i--) {
        await new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            setCountdown((prev) => prev - 1);
            resolve();
          }, 1000);
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
    <Container className="d-flex flex-column align-items-center justify-content-center py-4">
      <Row className="justify-content-center">
        <Col md="auto" className="text-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="border rounded w-100"
            style={{
              maxWidth: '100%',
              height: 'auto',
              aspectRatio: '16 / 9',
              objectFit: 'cover'
            }}
          />
          {isCapturing && (
            <div className="mt-2 text-muted">
              Taking photo {photoIndex + 1} in {countdown}s...
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col className="text-center">
          <Button
            variant="primary"
            onClick={handleCapture}
            disabled={isCapturing}
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
              `Start Capturing`
            )}
          </Button>
        </Col>
      </Row>

      <Row className="mt-4 justify-content-center">
        {Array.from({ length: 3 }).map((_, index) => (
          <Col key={index} xs={6} sm={4} className="d-flex justify-content-center">
            {photos[index] ? (
              <Image
                src={photos[index]}
                thumbnail
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  height: 'auto',
                  aspectRatio: '16 / 9',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  maxWidth: '140px',
                  aspectRatio: '16 / 9',
                  border: '2px dashed #ccc',
                  borderRadius: '5px',
                }}
              />
            )}
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default CameraCapture;
