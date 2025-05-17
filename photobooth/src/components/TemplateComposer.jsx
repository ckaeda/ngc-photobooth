import { useEffect, useRef } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { GLOBAL } from '../../config/config';
import templateImage from '/assets/templates/ngc-fake-template.png'; // adjust path if needed

function TemplateComposer({ images, onComposeComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (images.length !== GLOBAL.MAX_PHOTOS) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const template = new Image();
    template.src = templateImage;

    template.onload = () => {
      canvas.width = template.width;
      canvas.height = template.height;

      ctx.drawImage(template, 0, 0);

      let loadedCount = 0;

      images.forEach((imgSrc, index) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
          const pos = GLOBAL.PHOTO_POSITIONS[index];
          ctx.drawImage(img, pos.x, pos.y, pos.width, pos.width / GLOBAL.ASPECT_RATIO);

          loadedCount++;
          if (loadedCount === images.length) {
            setTimeout(() => {
              const finalImage = canvas.toDataURL(GLOBAL.IMAGE_FORMAT);
              onComposeComplete(finalImage);
            }, 300); // small delay
          }
        };
      });
    };
  }, [images, onComposeComplete]);

  return (
    <Container className="text-center mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h4 className="mb-3">Composing your photo...</h4>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Col>
      </Row>
    </Container>
  );
}

export default TemplateComposer;
