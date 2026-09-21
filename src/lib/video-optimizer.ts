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
