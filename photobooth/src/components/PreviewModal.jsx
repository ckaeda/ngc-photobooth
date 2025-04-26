import { Modal, Button } from 'react-bootstrap';

function PreviewModal({ image, onConfirm, onRetake }) {
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
