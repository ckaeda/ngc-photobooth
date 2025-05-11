import { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import TemplateComposer from './components/TemplateComposer';
import EmailForm from './components/EmailForm';
import PreviewModal from './components/PreviewModal'; // optional
import { Container, Row, Col } from 'react-bootstrap';

function App() {
  const [capturedImages, setCapturedImages] = useState([]); // array of 3 images
  const [composedImage, setComposedImage] = useState(null); // final image after adding template
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div className="w-100" style={{ maxWidth: '100%' }}>
        {!capturedImages.length ? (
          <CameraCapture onCaptureComplete={setCapturedImages} />
        ) : !composedImage ? (
          <TemplateComposer
            images={capturedImages}
            onComposeComplete={(image) => {
              setComposedImage(image);
              setIsPreviewOpen(true);
            }}
          />
        ) : (
          <>
            {/* {isPreviewOpen && (
              <PreviewModal
                image={composedImage}
                onConfirm={() => setIsPreviewOpen(false)}
                onRetake={() => {
                  setCapturedImages([]);
                  setComposedImage(null);
                  setIsPreviewOpen(false);
                }}
              />
            )} */}
            {/* {!isPreviewOpen && <EmailForm composedImage={composedImage} />} */}
            <EmailForm composedImage={composedImage} />
          </>
        )}
      </div>
    </Container>

  );
}

export default App;
