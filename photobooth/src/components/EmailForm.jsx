import { Modal, Form, Button, Container, Alert, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { useState } from 'react';
import { sendEmail } from '../services/emailService';

function EmailForm({ composedImages }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState(() =>
    composedImages.map(({ key }) => key)
  );
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [showToast, setShowToast] = useState(false);


  const handleDownload = (image, key) => {
    const a = document.createElement('a');
    a.href = image;
    a.download = `${key}.png`;
    a.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const filteredImages = composedImages.filter(({ key }) =>
      selectedImages.includes(key)
    );

    setShowModal(false); // Hide modal immediately

    // Fire-and-forget send
    sendEmail(email, filteredImages)
      .then(() => {
        setToastVariant('success');
        setToastMessage(`Photos successfully sent to ${email} 🎉`);
      })
      .catch(() => {
        setToastVariant('danger');
        setToastMessage('Failed to send email. Please try again.');
      })
      .finally(() => {
        setShowToast(true);
      });
  };


  if (success) {
    return (
      <Container className="text-center p-4">
        <h2>Thank you!</h2>
        <p>Your photo(s) have been sent to {email} 🎉</p>
        <Button onClick={() => window.location.reload()}>Take another picture?</Button>
      </Container>
    );
  }

  return (
    <Container className="p-4" style={{ maxWidth: '50rem' }}>
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Container className="text-center mb-4">
        <Row className="g-3">
          {composedImages.map(({ key, image }) => (
            <Col
              md={6}
              key={key}
              className="d-flex flex-column justify-content-start align-items-center mb-4"
            >
              <img
                src={image}
                alt={`Preview ${key}`}
                className="img-fluid rounded mb-2"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
                  borderRadius: '1rem',
                }}
              />
              <Button variant="secondary" size="sm" onClick={() => handleDownload(image, key)}>
                Download
              </Button>
            </Col>
          ))}
        </Row>
        <div className="mt-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => setShowModal(true)}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Photos To Email'}
          </Button>
        </div>
        <Button
          variant="danger"
          className="mt-3"
          onClick={() => {
            if (window.confirm('Are you sure you want to retake the pictures? Your current photos will be lost.')) {
              window.location.reload();
            }
          }}
        >
          Retake Picture
        </Button>
      </Container>
      {/* Modal for selecting photos + entering email */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Photos to Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmailModal">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Row className="g-2 mb-3">
              {composedImages.map(({ key, image }) => (
                <Col xs={6} key={key} className="text-center">
                  <img
                    src={image}
                    alt={`Thumb ${key}`}
                    className="img-thumbnail mb-1"
                    style={{ height: '100px', objectFit: 'cover' }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Include"
                    id={`modal-select-${key}`}
                    checked={selectedImages.includes(key)}
                    onChange={() =>
                      setSelectedImages((prev) =>
                        prev.includes(key)
                          ? prev.filter((k) => k !== key)
                          : [...prev, key]
                      )
                    }
                  />
                </Col>
              ))}
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={sending || !email || selectedImages.length === 0}>
                {sending ? 'Sending...' : 'Email Selected Photos'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default EmailForm;
