import { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import TemplateComposer from './components/TemplateComposer';
import EmailForm from './components/EmailForm';
import { Container } from 'react-bootstrap';
import './css/index.css';

function App() {
  const [capturedImages, setCapturedImages] = useState([]);
  const [composedImages, setComposedImage] = useState(null); // final image after adding template

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundImage: 'url("/assets/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-100" style={{ maxWidth: '100%' }}>
        {!capturedImages.length ? (
          <CameraCapture onCaptureComplete={setCapturedImages} />
        ) : !composedImages ? (
          <TemplateComposer
            images={capturedImages}
            onComposeComplete={(image) => {
              setComposedImage(image);
            }}
          />
        ) : (
          <>
            <EmailForm composedImages={composedImages} />
          </>
        )}
      </div>
    </Container>

  );
}

export default App;
