import { Modal, Button } from 'react-bootstrap';

function PreviewModal({ image, onConfirm, onRetake }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image;
    link.download = 'photobooth-picture.png'; // or jpg if your base64 is jpg
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show={true} onHide={onRetake} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Preview Your Photo</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <img
          src={image}
          alt="Preview"
          className="img-fluid rounded"
          style={{ maxHeight: '500px', objectFit: 'contain' }}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="info" onClick={handleDownload}>
          Save to Device
        </Button>
        <Button variant="danger" onClick={onRetake}>
          Retake
        </Button>
        <Button variant="success" onClick={onConfirm}>
          Looks Good!
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PreviewModal;
