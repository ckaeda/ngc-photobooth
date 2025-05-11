import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { sendEmail } from '../services/emailService';

function EmailForm({ composedImage }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = composedImage;
    link.download = 'photobooth-picture.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      await sendEmail(email, composedImage);
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
        <p>Your photo has been sent to {email} 🎉</p>
        <Button onClick={() => window.location.reload()}>Take another picture?</Button>
      </Container>
    );
  }

  return (
    <Container className="p-4" style={{ maxWidth: '40rem' }}>
      <Container className="text-center mb-4">
        <img
          src={composedImage}
          alt="Preview"
          className="img-fluid rounded shadow"
          style={{
            maxHeight: '70vh',  // use more vertical space
            width: '100%',
            objectFit: 'contain',
          }}
        />
        <Button variant="danger" className="mt-3" onClick={() => window.location.reload()}>
          Retake Picture
        </Button>
      </Container>
      <h2 className="text-center mb-4">Send Your Photo</h2>
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
            {sending ? 'Sending...' : 'Send Photo'}
          </Button>
          <Button variant="info" onClick={handleDownload}>
            Save to Device
          </Button>
        </div>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Container>
  );
}

export default EmailForm;
