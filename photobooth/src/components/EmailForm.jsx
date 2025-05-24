import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { sendEmail } from '../services/emailService';
import { GLOBAL } from '../../config/config';

function EmailForm({ composedImages }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState(() =>
    composedImages.map(({ key }) => key)
  );

  const toggleSelection = (key) => {
    setSelectedImages((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  const handleDownloadAll = () => {
    composedImages.forEach(({ key, image }) => {
      if (!selectedImages.includes(key)) return;

      const link = document.createElement('a');
      link.href = image;
      link.download = `photobooth-picture-${key}.${GLOBAL.IMAGE_FORMAT.slice(-3).toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      await sendEmail(email, composedImages); // send all images
      setSuccess(true);
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
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
      <Container className="text-center mb-4">
        <Row className="g-3">
          {composedImages.map(({ key, image }) => (
            <Col
              md={6}
              key={key}
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ height: '45vh' }}
            >
              <img
                src={image}
                alt={`Preview ${key}`}
                className="img-fluid rounded mb-2"
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
                  borderRadius: '1rem', // optional for a soft rounded look
                }}
              />

              <Form.Check
                type="checkbox"
                id={`select-${key}`}
                label="Include"
                checked={selectedImages.includes(key)}
                onChange={() => toggleSelection(key)}
              />
            </Col>
          ))}
        </Row>
        <Button variant="danger" className="mt-3" onClick={() => window.location.reload()}>
          Retake Picture
        </Button>
      </Container>
      <h2 className="text-center mb-4">Send Your Photos</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Control
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
            required
          />
        </Form.Group>
        <div className="d-grid gap-2">
          <Button type="submit" variant="primary" disabled={sending || !email}>
            {sending ? 'Sending...' : 'Send Photos'}
          </Button>
          <Button variant="info" onClick={handleDownloadAll}>
            Save All to Device
          </Button>
        </div>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Container>
  );
}

export default EmailForm;
