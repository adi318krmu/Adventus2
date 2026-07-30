import { useState, useRef, useEffect } from "react";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, RefreshCw, Check, X, Move } from "lucide-react";

const ImageCropperModal = ({ imageSrc, onCropComplete, onClose }) => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw preview canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background fill
    ctx.fillStyle = "#0c131d";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Move origin to center of canvas
    ctx.translate(width / 2, height / 2);

    // Apply user panning
    ctx.translate(position.x, position.y);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply zoom
    ctx.scale(zoom, zoom);

    // Calculate base scale to fit crop circle (crop size is 240px diameter)
    const cropDiameter = 240;
    const minSide = Math.min(image.width, image.height);
    const fitScale = cropDiameter / minSide;

    const drawW = image.width * fitScale;
    const drawH = image.height * fitScale;

    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Overlay mask (darken outside circle)
    ctx.fillStyle = "rgba(10, 15, 26, 0.75)";
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(width / 2, height / 2, cropDiameter / 2, 0, Math.PI * 2, true);
    ctx.fill();

    // Circular crop border ring
    ctx.strokeStyle = "#00f2fe";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, cropDiameter / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Inner guide grid
    ctx.strokeStyle = "rgba(0, 242, 254, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Grid lines inside circle
    const r = cropDiameter / 2;
    const cx = width / 2;
    const cy = height / 2;

    ctx.moveTo(cx - r / 1.5, cy);
    ctx.lineTo(cx + r / 1.5, cy);
    ctx.moveTo(cx, cy - r / 1.5);
    ctx.lineTo(cx, cy + r / 1.5);
    ctx.stroke();

  }, [image, zoom, rotation, position]);

  // Mouse / Touch handlers for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleApplyCrop = () => {
    if (!image) return;

    // Create high-res offscreen canvas (400x400)
    const outCanvas = document.createElement("canvas");
    const outSize = 400;
    outCanvas.width = outSize;
    outCanvas.height = outSize;

    const ctx = outCanvas.getContext("2d");

    // Clip to circle for avatar output
    ctx.beginPath();
    ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.save();
    ctx.translate(outSize / 2, outSize / 2);

    // Scale position offset from preview canvas (300px canvas with 240px crop = 400/240 ratio)
    const scaleRatio = outSize / 240;
    ctx.translate(position.x * scaleRatio, position.y * scaleRatio);

    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const minSide = Math.min(image.width, image.height);
    const fitScale = outSize / minSide;

    const drawW = image.width * fitScale;
    const drawH = image.height * fitScale;

    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Export blob as File
    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], "cropped-profile.jpg", { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(blob);
      onCropComplete(croppedFile, previewUrl);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="card w-full max-w-lg overflow-hidden border border-mint/30 shadow-2xl bg-panelSoft/95 flex flex-col gap-5 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Crop & Rotate Photo
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Drag to reposition, rotate, or zoom before saving</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Canvas Workspace */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl bg-ink p-3 border border-line select-none overflow-hidden">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className="cursor-move rounded-xl touch-none shadow-inner"
          />
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[11px] text-mint/80 bg-ink/80 px-3 py-1.5 rounded-full border border-mint/20 backdrop-blur-sm pointer-events-none">
            <span className="flex items-center gap-1"><Move size={12} /> Drag to adjust position</span>
            <span>{rotation}° | {Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="btn-outline !p-2 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-mint cursor-pointer h-2 rounded-lg bg-line"
            />
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="btn-outline !p-2 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Rotate & Reset Action Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRotateLeft}
                className="btn-outline flex items-center gap-1.5 text-xs !py-2 !px-3"
              >
                <RotateCcw size={14} /> Rotate Left
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                className="btn-outline flex items-center gap-1.5 text-xs !py-2 !px-3"
              >
                <RotateCw size={14} /> Rotate Right
              </button>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="btn-outline text-slate-400 hover:text-white flex items-center gap-1.5 text-xs !py-2 !px-3"
              title="Reset Zoom & Rotation"
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-line pt-4 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline !py-2.5 !px-5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="btn-primary flex items-center gap-2 !py-2.5 !px-6 text-sm"
          >
            <Check size={18} /> Apply Crop
          </button>
        </div>

      </div>
    </div>
  );
};

export default ImageCropperModal;
