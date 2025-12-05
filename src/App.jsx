import { useState, useRef, useEffect } from 'react'
import './index.css'

function App() {
  const [leftImage, setLeftImage] = useState(null)
  const [rightImage, setRightImage] = useState(null)
  const [leftResolution, setLeftResolution] = useState(null)
  const [rightResolution, setRightResolution] = useState(null)
  const [processedLeftImage, setProcessedLeftImage] = useState(null)
  const [processedRightImage, setProcessedRightImage] = useState(null)
  const [copyStatus, setCopyStatus] = useState('Copy Prompt')

  const processLeftImage = (file) => {
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      setLeftResolution({ width: img.width, height: img.height });
      setLeftImage(objectUrl);

      // Extend Image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const newHeight = Math.floor(img.height * 1.1);
      canvas.width = img.width;
      canvas.height = newHeight;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Fill extension (white for now, or match bottom pixel?)
      // Let's assume white padding as it's standard for "adding space"
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, img.height, img.width, newHeight - img.height);

      setProcessedLeftImage(canvas.toDataURL('image/png', 1.0));
    };
  }

  const handleLeftUpload = (e) => {
    processLeftImage(e.target.files[0]);
  }

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleCopyPrompt = () => {
    const prompt = "Remove all watermarks from the image. Detect and restore any blurry or unclear text to ensure it is sharp and legible. Upscale and output the image in the highest possible quality.";
    navigator.clipboard.writeText(prompt).then(() => {
      setCopyStatus('Copied! 📋');
      setTimeout(() => {
        setCopyStatus('Copy Prompt');
      }, 5000);
    });
  }

  const processRightImage = (file) => {
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      // Calculate original height (reverse of 1.1x)
      // Original * 1.1 = Extended
      // Original = Extended / 1.1
      const originalHeight = Math.floor(img.height / 1.1);

      setRightResolution({ width: img.width, height: img.height, originalHeight });
      setRightImage(objectUrl);

      // Crop Image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = originalHeight;

      // Draw image, cutting off the bottom
      ctx.drawImage(img, 0, 0);

      setProcessedRightImage(canvas.toDataURL('image/png', 1.0));
    };
  }

  const handleRightUpload = (e) => {
    processRightImage(e.target.files[0]);
  }

  return (
    <div className="container">
      <div className="split-pane left-pane">
        <div className="content">
          <h1>Upload <br /><span className="highlight">Original Image</span></h1>
          <p className="description">Upload & Extend Height by 10%</p>

          <div className="upload-area">
            <input type="file" accept="image/*" id="left-upload" hidden onChange={handleLeftUpload} />
            <label htmlFor="left-upload" className="btn primary">
              Upload Image
            </label>
          </div>

          <div className="preview-area">
            {leftImage ? (
              <img src={leftImage} alt="Original" style={{ maxHeight: '100%', maxWidth: '100%' }} />
            ) : (
              <div className="placeholder">No Image Uploaded</div>
            )}
          </div>

          <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn secondary"
              disabled={!processedLeftImage}
              onClick={() => downloadImage(processedLeftImage, 'extended_image.png')}
            >
              Download Extended
            </button>
            <button
              className="btn secondary"
              onClick={handleCopyPrompt}
            >
              {copyStatus}
            </button>
          </div>

          {leftResolution && (
            <div className="stats">
              Original: {leftResolution.width}x{leftResolution.height} <br />
              Extended: {leftResolution.width}x{Math.floor(leftResolution.height * 1.1)}
            </div>
          )}
        </div>
      </div>

      <div className="split-pane right-pane">
        <div className="content">
          <h1>Upload <br /><span className="highlight pink">Watermark Removed Image</span></h1>
          <p className="description">Upload & Crop Extension</p>

          <div className="upload-area">
            <input type="file" accept="image/*" id="right-upload" hidden onChange={handleRightUpload} />
            <label htmlFor="right-upload" className="btn primary pink">
              Upload Image
            </label>
          </div>

          <div className="preview-area">
            {rightImage ? (
              <img src={rightImage} alt="Uploaded" style={{ maxHeight: '100%', maxWidth: '100%' }} />
            ) : (
              <div className="placeholder">No Image Uploaded</div>
            )}
          </div>

          <div className="actions">
            <button
              className="btn secondary pink"
              disabled={!processedRightImage}
              onClick={() => downloadImage(processedRightImage, 'restored_image.png')}
            >
              Download Cropped
            </button>
          </div>

          {rightResolution && (
            <div className="stats">
              Uploaded: {rightResolution.width}x{rightResolution.height} <br />
              Restored: {rightResolution.width}x{rightResolution.originalHeight}
            </div>
          )}
        </div>
      </div>

      <div className="branding">
        NanoBanana 🍌
      </div>
    </div>
  )
}

export default App
