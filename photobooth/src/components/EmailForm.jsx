import { useState } from 'react';
import { Button, Container, Row, Col, Modal } from 'react-bootstrap';

function EmailForm({ composedImages }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);

  const confirmAndDownload = (image, key) => {
    setPendingImage({ image, key });
    setShowConfirm(true);
  };

  const handleUserChoice = async (consent) => {
    if (!pendingImage) return;

    const { image, key } = pendingImage;
    setShowConfirm(false);

    // If consented, send to Vercel
    if (consent) {
      try {
        const filename = new Date().valueOf();
        const res = await fetch('/api/vercelPut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: image, filename }),
        });

        const data = await res.json();
        if (res.ok) {
          console.log('Uploaded to Vercel:', data.url);
        } else {
          console.error('Upload failed:', data.error);
        }
      } catch (e) {
        console.error('Unexpected upload error:', e);
      } finally {
        // Proceed with download
        const a = document.createElement('a');
        a.href = image;
        a.download = `${key}.png`;
        a.click();

        // Reset state
        setPendingImage(null);
      }
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
              <Button
                variant="primary"
                size="sm"
                onClick={() => confirmAndDownload(image, key)}
              >
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

      {/* Modal Confirmation */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Allow Sharing?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Would you like to allow this photo to be sent to NGC's social media
            committee for possible posting?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleUserChoice(false)}>
            No, just download
          </Button>
          <Button variant="primary" onClick={() => handleUserChoice(true)}>
            Yes, you may share
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default EmailForm;
