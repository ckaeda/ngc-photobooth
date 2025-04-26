import { useEffect, useRef } from 'react';
import templateImage from '/assets/templates/default-template.png'; // adjust path if needed

function TemplateComposer({ images, onComposeComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (images.length !== 3) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const template = new Image();
    template.src = templateImage;

    template.onload = () => {
      // Set canvas size to match the template size
      canvas.width = template.width;
      canvas.height = template.height;

      // Draw the template first
      ctx.drawImage(template, 0, 0);

      // Load and draw the 3 captured images onto specific spots
      const photoPositions = [
        { x: 50, y: 100, width: 200, height: 200 }, // position for photo 1
        { x: 300, y: 100, width: 200, height: 200 }, // position for photo 2
        { x: 550, y: 100, width: 200, height: 200 }, // position for photo 3
      ];

      images.forEach((imgSrc, index) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
          const pos = photoPositions[index];
          ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);

          // After all 3 images are drawn, send the composed image back
          if (index === images.length - 1) {
            setTimeout(() => {
              const finalImage = canvas.toDataURL('image/png');
              onComposeComplete(finalImage);
            }, 500); // slight delay to ensure all images are rendered
          }
        };
      });
    };
  }, [images, onComposeComplete]);

  return (
    <div className="template-composer-container">
      <h2>Composing your photo...</h2>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default TemplateComposer;
