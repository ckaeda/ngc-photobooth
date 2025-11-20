import { useState } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';

function EmailForm({ composedImages }) {
  const [isAllowShare, setAllowShare] = useState(true);

  const handleDownload = async (image, key) => {
    const a = document.createElement('a');
    a.href = image;
    a.download = `${key}.png`;
    a.click();

    if (isAllowShare) {
      try {
        const filename = new Date().valueOf();
        const res = await fetch('/api/vercelPut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: image, filename }),
        });

        const data = await res.json();

        if (res.ok) {
          console.log(data.url);
        } else {
          console.error('Upload failed:', data.error);
        }
      } catch (e) {
        console.error('Unexpected error:', e);
      }
    }
  };

  return (
    <Container className="p-4" style={{ maxWidth: '50rem', overflowY: "hidden" }}>
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
                  height: '65vh',
                  objectFit: 'contain',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
                  borderRadius: '1rem',
                }}
              />

              <div
                style={{
                  background: "rgba(156, 156, 156, 0.7)",  // transparent gray
                  padding: "0.6rem 0.8rem",
                  borderRadius: "5px",
                  width: "100%",
                  maxWidth: "20rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "0.5rem"
                }}
              >
                <Form.Check
                  type="checkbox"
                  id={`share-${key}`}
                  checked={isAllowShare}
                  onChange={() => setAllowShare(!isAllowShare)}
                  style={{ margin: 0 }}
                />

                <label
                  htmlFor={`share-${key}`}
                  style={{
                    fontSize: "0.9rem",
                    color: "white",
                    margin: 0,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  Allow this photo to be shared with NGC’s social media team?
                </label>
              </div>

              <Button variant="primary" size="sm" onClick={() => handleDownload(image, key)}>
                Download
              </Button>
            </Col>
          ))}
        </Row>
        <Button
          variant="danger"
          // className="mt-3"
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
