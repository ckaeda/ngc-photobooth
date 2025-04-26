import { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import TemplateComposer from './components/TemplateComposer';
import EmailForm from './components/EmailForm';
import PreviewModal from './components/PreviewModal'; // optional

function App() {
  const [capturedImages, setCapturedImages] = useState([]); // array of 3 images
  const [composedImage, setComposedImage] = useState(null); // final image after adding template
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="app-container">
      {!capturedImages.length ? (
        <CameraCapture onCaptureComplete={setCapturedImages} />
      ) : !composedImage ? (
        <TemplateComposer
          images={capturedImages}
          onComposeComplete={(image) => {
            setComposedImage(image);
            setIsPreviewOpen(true); // open preview after composing
          }}
        />
      ) : (
        <>
          {isPreviewOpen && (
            <PreviewModal
              image={composedImage}
              onConfirm={() => setIsPreviewOpen(false)}
              onRetake={() => {
                setCapturedImages([]);
                setComposedImage(null);
                setIsPreviewOpen(false);
              }}
            />
          )}
          {!isPreviewOpen && <EmailForm composedImage={composedImage} />}
        </>
      )}
    </div>
  );
}

export default App;
