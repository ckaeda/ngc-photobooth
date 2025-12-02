import { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import TemplateComposer from './components/TemplateComposer';
import EmailForm from './components/EmailForm';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import './css/index.css';

function App() {
  const [capturedImages, setCapturedImages] = useState([]);
  const [composedImages, setComposedImage] = useState(null);
  const [captureFilename, setCaptureFilename] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center app-background"
    >
      <ToastContainer position="top-end" className="p-3">
        {errorMessage && (
          <Toast bg="danger" delay={10000} autohide={true} onClose={() => setErrorMessage('')}>
            <Toast.Header>
              <strong className="me-auto">NGC Photobooth - Error</strong>
            </Toast.Header>
            <Toast.Body style={{ color: 'white' }}>
              {errorMessage}
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>

      <div className="w-100" style={{ maxWidth: '100%' }}>
        {!capturedImages.length ? (
          <CameraCapture onCaptureComplete={setCapturedImages} />
        ) : !composedImages ? (
          <TemplateComposer
            images={capturedImages}
            onComposeComplete={(image) => {
              setComposedImage(image);
              setCaptureFilename(`${Date.now().valueOf()}`);
            }}
          />
        ) : (
          <>
            <EmailForm composedImages={composedImages} filename={captureFilename} setErrorMessage={setErrorMessage} />
          </>
        )}
      </div>
    </Container>

  );
}

export default App;
