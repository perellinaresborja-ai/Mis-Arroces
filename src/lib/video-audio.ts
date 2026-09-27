/**
 * Detects whether a video file or HTMLVideoElement has an audio track.
 * Combines ISO BMFF box scan (scanning both start and end chunks for 'soun', 'mp4a', 'alac', 'ac-3', 'ec-3'),
 * WebM/Matroska EBML track headers, and browser media properties with zero false negatives.
 */
export async function detectVideoHasAudio(
  videoEl: HTMLVideoElement | null,
  file?: File | null
): Promise<boolean> {
  // 1. Binary check for video container files (MP4, MOV, WebM, etc.)
  if (file) {
    try {
      const sliceSize = Math.min(file.size, 3 * 1024 * 1024); // 3MB chunk
      const startBuffer = await file.slice(0, sliceSize).arrayBuffer();
      const startBytes = new Uint8Array(startBuffer);

      const hasAudioSignature = (bytes: Uint8Array): boolean => {
        for (let i = 0; i < bytes.length - 4; i++) {
          const b0 = bytes[i];
          const b1 = bytes[i + 1];
          const b2 = bytes[i + 2];
          const b3 = bytes[i + 3];

          // 'soun' (Sound Media Information / Handler)
          if (b0 === 0x73 && b1 === 0x6f && b2 === 0x75 && b3 === 0x6e) return true;
          // 'mp4a' (AAC / MPEG-4 Audio)
          if (b0 === 0x6d && b1 === 0x70 && b2 === 0x34 && b3 === 0x61) return true;
          // 'alac' (Apple Lossless)
          if (b0 === 0x61 && b1 === 0x6c && b2 === 0x61 && b3 === 0x63) return true;
          // 'ac-3'
          if (b0 === 0x61 && b1 === 0x63 && b2 === 0x2d && b3 === 0x33) return true;
          // 'ec-3'
          if (b0 === 0x65 && b1 === 0x63 && b2 === 0x2d && b3 === 0x33) return true;
          // WebM / Matroska: Audio track type tag (0x83 followed by 0x02)
          if (b0 === 0x83 && b1 === 0x02) return true;
        }
        return false;
      };

      if (hasAudioSignature(startBytes)) {
        return true;
      }

      // In smartphone recordings (iOS Camera, Android Camera), the 'moov' atom is written at the END of the file
      if (file.size > sliceSize) {
        const endBuffer = await file.slice(file.size - sliceSize).arrayBuffer();
        const endBytes = new Uint8Array(endBuffer);
        if (hasAudioSignature(endBytes)) {
          return true;
        }
      }
    } catch (e) {
      console.warn("Binary audio check error:", e);
    }
  }

  // 2. HTMLVideoElement properties
  if (videoEl) {
    const v = videoEl as any;

    // Safari / WebKit native audioTracks check
    if (v.audioTracks) {
      if (v.audioTracks.length > 0) return true;
      if (v.audioTracks.length === 0 && v.readyState >= 1) return false;
    }

    // Firefox native property
    if (typeof v.mozHasAudio === 'boolean') {
      return v.mozHasAudio;
    }

    // WebKit decoded audio bytes count
    if (typeof v.webkitAudioDecodedByteCount === 'number' && v.webkitAudioDecodedByteCount > 0) {
      return true;
    }
  }

  // 3. By default for any video file uploaded by the user, assume it has audio
  // so the volume control is never erroneously hidden on false negatives.
  return true;
}
