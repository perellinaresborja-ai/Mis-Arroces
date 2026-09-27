/**
 * Detects whether a video file or HTMLVideoElement has an audio track.
 * Combines ISO BMFF box scan (for MP4/MOV files), MediaStream captureStream,
 * and media element properties with zero false negatives.
 */
export async function detectVideoHasAudio(
  videoEl: HTMLVideoElement | null,
  file?: File | null
): Promise<boolean> {
  // 1. Binary check for MP4/MOV: Scan header for 'soun' (Sound Media Information / Handler)
  if (file) {
    try {
      const sliceSize = Math.min(file.size, 2 * 1024 * 1024); // First 2MB
      const buffer = await file.slice(0, sliceSize).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length - 4; i++) {
        if (
          bytes[i] === 0x73 &&     // 's'
          bytes[i + 1] === 0x6f && // 'o'
          bytes[i + 2] === 0x75 && // 'u'
          bytes[i + 3] === 0x6e    // 'n'
        ) {
          return true;
        }
      }
    } catch (e) {
      console.warn("Binary audio check error:", e);
    }
  }

  // 2. HTMLVideoElement inspection
  if (videoEl) {
    const v = videoEl as any;

    // Check modern MediaStream tracks
    try {
      const stream = v.captureStream ? v.captureStream() : (v.mozCaptureStream ? v.mozCaptureStream() : null);
      if (stream) {
        const audioTracks = stream.getAudioTracks ? stream.getAudioTracks() : [];
        if (audioTracks.length > 0) return true;
        const videoTracks = stream.getVideoTracks ? stream.getVideoTracks() : [];
        // Only if video tracks are active and audio tracks are explicitly empty, mark as false
        if (videoTracks.length > 0 && audioTracks.length === 0) return false;
      }
    } catch (e) {}

    // Check webkit/moz properties
    if (typeof v.webkitAudioDecodedByteCount === 'number' && v.webkitAudioDecodedByteCount > 0) {
      return true;
    }
    if (v.mozHasAudio === true) return true;
    if (v.audioTracks && v.audioTracks.length > 0) return true;
  }

  // 3. By default for any video file uploaded by the user, assume it has audio
  // to avoid erroneously hiding the audio controller on false negatives.
  return true;
}
