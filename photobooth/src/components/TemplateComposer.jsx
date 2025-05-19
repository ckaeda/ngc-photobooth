import { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { GLOBAL } from '../../config/config';
import { TEMPLATES } from '../../config/templateConfig';

function TemplateComposer({ images, onComposeComplete }) {
  const canvasRef = useRef(null);
  const [composedImages, setComposedImages] = useState([]);

  useEffect(() => {
    if (images.length !== GLOBAL.MAX_PHOTOS) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const composedResults = [];

    const processTemplate = (templateKey, templateData, callback) => {
      const templateImg = new Image();
      templateImg.src = templateData.path;

      templateImg.onload = () => {
        canvas.width = templateImg.width;
        canvas.height = templateImg.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImg, 0, 0);

        let loadedCount = 0;

        images.forEach((imgSrc, index) => {
          const img = new Image();
          img.src = imgSrc;

          img.onload = () => {
            const pos = templateData.positions[index];
            const targetHeight = pos.width / templateData.aspectRatio;

            ctx.drawImage(img, pos.x, pos.y, pos.width, targetHeight);

            loadedCount++;
            if (loadedCount === templateData.positions.length) {
              const finalImage = canvas.toDataURL(GLOBAL.IMAGE_FORMAT);
              composedResults.push({ key: templateKey, image: finalImage });
              callback();
            }
          };
        });
      };
    };

    const templateKeys = Object.keys(TEMPLATES);
    let current = 0;

    const processNextTemplate = () => {
      if (current >= templateKeys.length) {
        setComposedImages(composedResults);
        if (onComposeComplete) {
          onComposeComplete(composedResults); // send all results if needed
        }
        return;
      }

      const key = templateKeys[current];
      const data = TEMPLATES[key];
      current++;
      processTemplate(key, data, processNextTemplate);
    };

    processNextTemplate();
  }, [images, onComposeComplete]);

  return (
    <Container className="text-center mt-5">
      <Row className="justify-content-center">
        <Col md={10}>
          {composedImages.length === 0 ? (
            <>
              <h4 className="mb-3">Composing your photo...</h4>
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </>
          ) : (
            <>
              <h4 className="mb-4">Composed Photos</h4>
              {composedImages.map(({ key, image }) => (
                <div key={key} className="mb-4">
                  <h5>{key}</h5>
                  <img
                    src={image}
                    alt={`Composed ${key}`}
                    className="img-fluid rounded shadow"
                  />
                </div>
              ))}
            </>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Col>
      </Row>
    </Container>
  );
}

export default TemplateComposer;
