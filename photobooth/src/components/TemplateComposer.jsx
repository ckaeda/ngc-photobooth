import { useEffect, useRef } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import templateImage from '/assets/templates/ngc-fake-template.png'; // adjust path if needed

function TemplateComposer({ images, onComposeComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (images.length !== 3) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const template = new Image();
    template.src = templateImage;

    template.onload = () => {
      canvas.width = template.width;
      canvas.height = template.height;

      ctx.drawImage(template, 0, 0);

      const photoPositions = [
        { x: 16, y: 358, width: 1256, height: 1256*9/16 },
        { x: 1290, y: 359, width: 614, height: 614*9/16 },
        { x: 1290, y: 720, width: 614, height: 614*9/16 },
      ];

      let loadedCount = 0;

      images.forEach((imgSrc, index) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
          const pos = photoPositions[index];
          ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);

          loadedCount++;
          if (loadedCount === images.length) {
            setTimeout(() => {
              const finalImage = canvas.toDataURL('image/png');
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
