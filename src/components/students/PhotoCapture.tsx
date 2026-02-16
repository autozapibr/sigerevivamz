import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, User, Video, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PhotoCaptureProps {
  photoPreview: string | null;
  name: string;
  onPhotoChange: (file: File | null, preview: string | null) => void;
  disabled?: boolean;
}

export function PhotoCapture({ photoPreview, name, onPhotoChange, disabled }: PhotoCaptureProps) {
  const [showWebcam, setShowWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (n: string) =>
    n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  // 3x4 aspect ratio constants
  const PHOTO_WIDTH = 300;
  const PHOTO_HEIGHT = 400; // 3:4 ratio

  const startWebcam = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      setCapturedImage(null);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      // Fallback to mobile camera capture
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'user';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileSelected(file);
      };
      input.click();
      setShowWebcam(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (showWebcam) {
      startWebcam();
    }
    return () => { stopWebcam(); };
  }, [showWebcam]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = PHOTO_WIDTH;
    canvas.height = PHOTO_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate crop to get 3:4 center crop from video
    const videoAspect = video.videoWidth / video.videoHeight;
    const targetAspect = PHOTO_WIDTH / PHOTO_HEIGHT; // 0.75

    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
    if (videoAspect > targetAspect) {
      // Video is wider, crop sides
      sw = video.videoHeight * targetAspect;
      sx = (video.videoWidth - sw) / 2;
    } else {
      // Video is taller, crop top/bottom
      sh = video.videoWidth / targetAspect;
      sy = (video.videoHeight - sh) / 2;
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopWebcam();
  };

  const confirmCapture = () => {
    if (!capturedImage) return;
    // Convert data URL to File
    fetch(capturedImage)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onPhotoChange(file, capturedImage);
        setShowWebcam(false);
        setCapturedImage(null);
      });
  };

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Create 3x4 cropped version
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = PHOTO_WIDTH;
        canvas.height = PHOTO_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imgAspect = img.width / img.height;
        const targetAspect = PHOTO_WIDTH / PHOTO_HEIGHT;

        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (imgAspect > targetAspect) {
          sw = img.height * targetAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / targetAspect;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
            onPhotoChange(croppedFile, dataUrl);
          }
        }, 'image/jpeg', 0.9);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const removePhoto = () => {
    onPhotoChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          {/* 3x4 frame */}
          <div className="w-[90px] h-[120px] rounded-lg border-2 border-primary/20 overflow-hidden bg-muted flex items-center justify-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          {photoPreview && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={removePhoto}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Fotografia 3x4</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              Ficheiro
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowWebcam(true)}
              disabled={disabled}
            >
              <Camera className="w-4 h-4 mr-2" />
              Webcam
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A foto será enquadrada automaticamente no formato 3x4
          </p>
        </div>
      </div>

      {/* Webcam Dialog */}
      <Dialog open={showWebcam} onOpenChange={(open) => {
        if (!open) {
          stopWebcam();
          setCapturedImage(null);
        }
        setShowWebcam(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capturar Fotografia</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {/* Guide overlay */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ width: 320, height: 320 }}>
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captura"
                  className="absolute inset-0 m-auto"
                  style={{ width: PHOTO_WIDTH * 0.7, height: PHOTO_HEIGHT * 0.7, objectFit: 'cover' }}
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {/* 3x4 guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="border-2 border-dashed border-white/60 rounded-lg"
                      style={{ width: PHOTO_WIDTH * 0.7, height: PHOTO_HEIGHT * 0.7 }}
                    />
                  </div>
                  <p className="absolute bottom-2 left-0 right-0 text-center text-white/70 text-xs">
                    Posicione o rosto dentro da moldura
                  </p>
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2">
              {capturedImage ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCapturedImage(null);
                      startWebcam();
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Repetir
                  </Button>
                  <Button onClick={confirmCapture}>
                    Usar esta foto
                  </Button>
                </>
              ) : (
                <Button onClick={capturePhoto} disabled={!stream}>
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
