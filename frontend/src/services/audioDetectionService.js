// Audio Detection Service for detecting screams in real-time.

let audioContext = null;
let mediaStream = null;
let animationFrameId = null;
let analyser = null;

export const startScreamDetection = async ({
  onScreamDetected,
  onError,
}) => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Microphone access is not supported."
      );
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error(
        "Audio processing is not supported."
      );
    }

    audioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.2;

    const microphone =
      audioContext.createMediaStreamSource(mediaStream);

    microphone.connect(analyser);

    const timeData = new Float32Array(
      analyser.fftSize
    );

    const frequencyData = new Uint8Array(
      analyser.frequencyBinCount
    );

    // Initial heuristic thresholds; tune on your device.
    const VOLUME_THRESHOLD = 0.10;
    const FREQUENCY_MIN = 400;
    const FREQUENCY_MAX = 3500;
    const SCREAM_DURATION = 500;
    const DETECTION_COOLDOWN = 5000;

    let screamStartTime = null;
    let lastDetectionTime = 0;
    let stopped = false;

    const detectScream = () => {
      if (stopped || !analyser || !audioContext) {
        return;
      }

      analyser.getFloatTimeDomainData(timeData);
      analyser.getByteFrequencyData(frequencyData);

      // Calculate RMS volume.
      let sum = 0;

      for (let i = 0; i < timeData.length; i++) {
        sum += timeData[i] * timeData[i];
      }

      const rms = Math.sqrt(sum / timeData.length);

      // Find the strongest frequency in the target range.
      let dominantFrequency = 0;
      let maxMagnitude = 0;

      for (let i = 0; i < frequencyData.length; i++) {
        const frequency =
          (i * audioContext.sampleRate) /
          analyser.fftSize;

        if (
          frequency >= FREQUENCY_MIN &&
          frequency <= FREQUENCY_MAX &&
          frequencyData[i] > maxMagnitude
        ) {
          maxMagnitude = frequencyData[i];
          dominantFrequency = frequency;
        }
      }

      const possibleScream =
        rms >= VOLUME_THRESHOLD &&
        dominantFrequency >= FREQUENCY_MIN &&
        dominantFrequency <= FREQUENCY_MAX;

      const now = Date.now();

      if (possibleScream) {
        if (screamStartTime === null) {
          screamStartTime = now;
        }

        const duration = now - screamStartTime;

        if (
          duration >= SCREAM_DURATION &&
          now - lastDetectionTime >= DETECTION_COOLDOWN
        ) {
          lastDetectionTime = now;
          screamStartTime = null;

          console.log("Possible high scream detected.");

          onScreamDetected?.({
            timestamp: now,
            volume: rms,
            frequency: dominantFrequency,
          });
        }
      } else {
        screamStartTime = null;
      }

      animationFrameId =
        requestAnimationFrame(detectScream);
    };

    detectScream();

    // Return cleanup function.
    return () => {
      stopped = true;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      mediaStream?.getTracks().forEach((track) => {
        track.stop();
      });

      if (
        audioContext &&
        audioContext.state !== "closed"
      ) {
        audioContext.close();
      }

      audioContext = null;
      mediaStream = null;
      analyser = null;
      animationFrameId = null;
    };
  } catch (error) {
    mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });

    if (audioContext && audioContext.state !== "closed") {
      await audioContext.close();
    }

    audioContext = null;
    mediaStream = null;
    analyser = null;

    console.error("Scream detection error:", error);
    onError?.(error);

    throw error;
  }
};