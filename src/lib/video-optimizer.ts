export async function optimizeStoryVideo(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.pause();
      video.src = '';
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("No se pudo cargar el vídeo. Formato no soportado por el dispositivo."));
    };

    video.onloadedmetadata = async () => {
      try {
        if (video.videoWidth === 0) {
          throw new Error("El vídeo no contiene dimensiones válidas o no está soportado.");
        }

        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 1280;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Fallo al crear contexto de canvas 2D");

        const srcRatio = video.videoWidth / video.videoHeight;
        const targetRatio = canvas.width / canvas.height;
        let drawW = canvas.width;
        let drawH = canvas.height;
        let offX = 0;
        let offY = 0;

        if (!isNaN(srcRatio) && srcRatio > 0) {
          if (srcRatio > targetRatio) {
            drawW = canvas.height * srcRatio;
            offX = (canvas.width - drawW) / 2;
          } else {
            drawH = canvas.width / srcRatio;
            offY = (canvas.height - drawH) / 2;
          }
        }

        // Play the video to allow capturing stream correctly
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise.catch(e => {
            throw new Error("No se pudo iniciar el vídeo: " + e.message);
          });
        }

        // Get Audio
        let audioTracks: MediaStreamTrack[] = [];
        const anyVid = video as any;
        const sourceStream = anyVid.captureStream ? anyVid.captureStream() : (anyVid.mozCaptureStream ? anyVid.mozCaptureStream() : null);
        if (sourceStream) {
          audioTracks = sourceStream.getAudioTracks();
        }

        // Get Video
        const canvasStream = canvas.captureStream ? canvas.captureStream(30) : (canvas as any).mozCaptureStream(30);
        const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);

        // Mime Type Fallback
        let selectedMime = '';
        const types = [
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4;codecs=avc1',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm'
        ];
        for (const t of types) {
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
            selectedMime = t;
            break;
          }
        }
        
        if (!selectedMime) {
          throw new Error("Este dispositivo no soporta compresión nativa.");
        }

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = e => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          resolve(new Blob(chunks, { type: selectedMime }));
        };

        recorder.start();

        // Draw loop
        let drawInterval: ReturnType<typeof setInterval>;
        const drawFrame = () => {
          if (video.readyState >= 2 && !video.paused && !video.ended) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            try {
              ctx.drawImage(video, offX, offY, drawW, drawH);
            } catch (e) {}
          }
        };
        // Use setInterval (33ms = ~30fps) instead of requestAnimationFrame for off-DOM canvas rendering
        drawInterval = setInterval(drawFrame, 33);

        // Maximum 15 seconds logic
        const maxDurationMs = 15000;
        let recordingDuration = video.duration && !isNaN(video.duration) && video.duration !== Infinity 
            ? Math.min(video.duration * 1000, maxDurationMs) 
            : maxDurationMs;

        let stopped = false;
        const finish = () => {
          if (stopped) return;
          stopped = true;
          clearInterval(drawInterval);
          if (recorder.state !== 'inactive') recorder.stop();
        };

        video.onended = finish;
        setTimeout(finish, recordingDuration + 500); // 500ms grace period

      } catch (err) {
        cleanup();
        reject(err);
      }
    };
  });
}

export async function optimizePostVideo(file: File): Promise<File> {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.pause();
      video.src = '';
    };

    const fallback = () => {
      cleanup();
      resolve(file);
    };

    video.onerror = () => {
      fallback();
    };

    const timeoutTimer = setTimeout(() => {
      fallback();
    }, 6000);

    video.onloadedmetadata = async () => {
      clearTimeout(timeoutTimer);
      try {
        if (!video.videoWidth || !video.videoHeight) {
          return fallback();
        }

        // Limit maximum dimension to 1080p for compatibility & fast loading
        const maxDim = 1080;
        let targetWidth = video.videoWidth;
        let targetHeight = video.videoHeight;
        if (targetWidth > maxDim || targetHeight > maxDim) {
          if (targetWidth >= targetHeight) {
            targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
            targetHeight = maxDim;
          }
        }
        targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
        targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return fallback();

        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise.catch(() => fallback());
        }

        let audioTracks: MediaStreamTrack[] = [];
        const anyVid = video as any;
        const sourceStream = anyVid.captureStream ? anyVid.captureStream() : (anyVid.mozCaptureStream ? anyVid.mozCaptureStream() : null);
        if (sourceStream) {
          audioTracks = sourceStream.getAudioTracks();
        }

        const canvasStream = canvas.captureStream ? canvas.captureStream(30) : (canvas as any).mozCaptureStream(30);
        const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);

        const types = [
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4;codecs=avc1',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm'
        ];
        const selectedMime = types.find(t => MediaRecorder.isTypeSupported(t));
        if (!selectedMime) return fallback();

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: 3500000
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          const ext = selectedMime.includes('webm') ? '.webm' : '.mp4';
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${nameWithoutExt}-optimized${ext}`;
          const optimizedBlob = new Blob(chunks, { type: selectedMime });
          const optimizedFile = new File([optimizedBlob], newFileName, { type: selectedMime });
          resolve(optimizedFile);
        };

        recorder.start();

        const drawInterval = setInterval(() => {
          if (video.readyState >= 2 && !video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          }
        }, 33);

        const durationMs = video.duration && !isNaN(video.duration) && video.duration !== Infinity
          ? video.duration * 1000
          : 60000;

        let stopped = false;
        const finish = () => {
          if (stopped) return;
          stopped = true;
          clearInterval(drawInterval);
          if (recorder.state !== 'inactive') recorder.stop();
        };

        video.onended = finish;
        setTimeout(finish, durationMs + 400);

      } catch (err) {
        fallback();
      }
    };
  });
}

/**
 * Generates a lightweight static WebP thumbnail (max 480px) from a video file at upload time.
 */
export async function generateVideoThumbnailFile(file: File | Blob, baseName: string = "video"): Promise<File> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error("Window not available"));
    }

    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    let finished = false;
    const cleanup = () => {
      try {
        URL.revokeObjectURL(url);
        video.removeAttribute('src');
        video.load();
        video.remove();
      } catch {}
    };

    video.onerror = () => {
      if (!finished) {
        finished = true;
        cleanup();
        reject(new Error("Failed to load video for thumbnail generation"));
      }
    };

    const capture = () => {
      if (finished) return;
      try {
        const maxDim = 480;
        let w = video.videoWidth || 480;
        let h = video.videoHeight || 480;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finished = true;
          cleanup();
          return reject(new Error("Canvas context failed"));
        }

        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            finished = true;
            cleanup();
            if (blob) {
              const cleanBase = baseName.replace(/\.[^/.]+$/, '');
              const thumbFile = new File([blob], `${cleanBase}.thumb.webp`, { type: 'image/webp' });
              resolve(thumbFile);
            } else {
              reject(new Error("Canvas blob export failed"));
            }
          },
          'image/webp',
          0.82
        );
      } catch (err) {
        if (!finished) {
          finished = true;
          cleanup();
          reject(err);
        }
      }
    };

    video.onloadeddata = () => {
      try {
        video.currentTime = 0.001;
      } catch {
        capture();
      }
    };

    video.onseeked = () => {
      capture();
    };

    setTimeout(() => {
      if (!finished) {
        capture();
      }
    }, 3000);
  });
}


