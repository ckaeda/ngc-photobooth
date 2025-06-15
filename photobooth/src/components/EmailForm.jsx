import { Button, Container, Row, Col } from 'react-bootstrap';
import { put } from "@vercel/blob";

function EmailForm({ composedImages }) {
  const handleDownload = async (image, key) => {
    const a = document.createElement('a');
    a.href = image;
    a.download = `${key}.png`;
    a.click();

    try {
      const filename = new Date().valueOf();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: image, filename }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Uploaded to:', data.url);
      } else {
        console.error('Upload failed:', data.error);
      }
    } catch (e) {
      console.error('Unexpected error:', e);
    }
  };

  return (
    <Container className="p-4" style={{ maxWidth: '50rem' }}>
      <Container className="text-center mb-4">
        <Row className="g-3">
          {composedImages.map(({ key, image }) => (
            <Col
              md={6}
              key={key}
              className="d-flex flex-column justify-content-start align-items-center mb-3 mx-auto d-block"
            >
              <img
                src={image}
                alt={`Preview ${key}`}
                className="img-fluid rounded mb-2 mx-auto d-block"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
                  borderRadius: '1rem',
                }}
              />

              <Button variant="primary" size="sm" onClick={() => handleDownload(image, key)}>
                Download
              </Button>
            </Col>
          ))}
        </Row>
        <Button
          variant="danger"
          className="mt-3"
          onClick={() => {
            if (window.confirm('Are you sure you want to retake the pictures? Your current photos will be lost.')) {
              window.location.reload();
            }
          }}
        >
          Retake Pictures
        </Button>
      </Container>
    </Container>
  );
}

export default EmailForm;
