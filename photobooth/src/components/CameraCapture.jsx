import { useState, useRef, useEffect } from 'react';
import useCamera from '../hooks/useCamera';
import { Container, Row, Col, Button, Spinner, Image } from 'react-bootstrap';

function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useCamera(videoRef);

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
      setIsCapturing(true);
      capturePhoto();
      setTimeout(() => setIsCapturing(false), 400);
    }
  };

  useEffect(() => {
    if (photos.length === 3) {
      onCaptureComplete(photos);
    }
  }, [photos, onCaptureComplete]);

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center py-4">
      <Row className="justify-content-center">
        <Col md="auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="border rounded"
            style={{ width: '480px', height: '360px', objectFit: 'cover' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col className="text-center">
          <Button
            variant="primary"
            onClick={handleCapture}
            disabled={isCapturing || photos.length >= 3}
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
              `Capture Photo ${photos.length + 1}`
            )}
          </Button>
        </Col>
      </Row>

      <Row className="mt-4 justify-content-center">
        {Array.from({ length: 3 }).map((_, index) => (
          <Col key={index} xs={4} md={3} className="d-flex justify-content-center">
            {photos[index] ? (
              <Image
                src={photos[index]}
                thumbnail
                style={{ width: '160px', height: '90px', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '160px',
                  height: '90px',
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
