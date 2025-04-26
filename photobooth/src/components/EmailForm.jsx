import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { sendEmail } from '../services/emailService';

function EmailForm({ composedImage }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      </Container>
    );
  }

  return (
    <Container className="p-4">
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
        <div className="d-grid">
          <Button type="submit" variant="primary" disabled={sending || !email}>
            {sending ? 'Sending...' : 'Send Photo'}
          </Button>
        </div>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Container>
  );
}

export default EmailForm;
