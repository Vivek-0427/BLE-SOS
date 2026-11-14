// Sensors Service for handling device motion and fall detection. It listens to device motion events and detects potential falls based on acceleration and rotation data.

export const startMotionSensors = ({
  onAcceleration,
  onRotation,
  onFallDetected,
  fallDetectionEnabled = true,
  onError,
}) => {
  if (!window.DeviceMotionEvent) {
    onError?.("DeviceMotionEvent is not supported in this browser.");
    return () => {};
  }

  let impactDetected = false;
  let impactTime = 0;
  let stillnessStart = null;
  let lastFallDetectedTime = 0;

  const FALL_THRESHOLD = 18;
  const STILLNESS_MIN = 7.5;
  const STILLNESS_MAX = 12.5;
  const GYRO_THRESHOLD = 15;
  const ROTATION_THRESHOLD = 120;

  const FALL_CONFIRM_WINDOW = 3000;
  const FALL_COOLDOWN = 5000;
  const STILLNESS_DURATION = 1500;
  const IMPACT_IGNORE_TIME = 400;

  const resetDetection = () => {
    impactDetected = false;
    impactTime = 0;
    stillnessStart = null;
  };

  const handleMotionEvent = (event) => {
    const acceleration = event.accelerationIncludingGravity;
    const rotationRate = event.rotationRate;

    if (!acceleration) return;

    const x = acceleration.x ?? 0;
    const y = acceleration.y ?? 0;
    const z = acceleration.z ?? 0;

    const accelMagnitude = Math.sqrt(
      x ** 2 + y ** 2 + z ** 2
    );

    let gyroMagnitude = 0;

    if (rotationRate) {
      const alpha = rotationRate.alpha ?? 0;
      const beta = rotationRate.beta ?? 0;
      const gamma = rotationRate.gamma ?? 0;

      gyroMagnitude = Math.sqrt(
        alpha ** 2 + beta ** 2 + gamma ** 2
      );
    }

    onAcceleration?.({
      x,
      y,
      z,
      magnitude: accelMagnitude,
    });

    onRotation?.({
      alpha: rotationRate?.alpha ?? 0,
      beta: rotationRate?.beta ?? 0,
      gamma: rotationRate?.gamma ?? 0,
      magnitude: gyroMagnitude,
    });

    if (!fallDetectionEnabled) {
      resetDetection();
      return;
    }

    const now = Date.now();

    // Detect a strong impact combined with significant rotation.
    if (!impactDetected) {
      const strongImpact = accelMagnitude > FALL_THRESHOLD;
      const strongRotation =
        gyroMagnitude > ROTATION_THRESHOLD;

      if (
        strongImpact &&
        strongRotation &&
        now - lastFallDetectedTime >= FALL_COOLDOWN
      ) {
        impactDetected = true;
        impactTime = now;
        stillnessStart = null;

        console.log(
          "Potential fall:",
          "Acceleration:",
          accelMagnitude.toFixed(2),
          "Rotation:",
          gyroMagnitude.toFixed(2)
        );
      }

      return;
    }

    const timeSinceImpact = now - impactTime;

    // Allow time for the initial impact and movement to settle.
    if (timeSinceImpact < IMPACT_IGNORE_TIME) {
      return;
    }

    // Reset if a fall is not confirmed within the time window.
    if (timeSinceImpact > FALL_CONFIRM_WINDOW) {
      resetDetection();
      return;
    }

    const isStill =
      accelMagnitude >= STILLNESS_MIN &&
      accelMagnitude <= STILLNESS_MAX &&
      gyroMagnitude < GYRO_THRESHOLD;

    if (isStill) {
      if (stillnessStart === null) {
        stillnessStart = now;
      }

      const stillnessDuration = now - stillnessStart;

      if (stillnessDuration >= STILLNESS_DURATION) {
        if (now - lastFallDetectedTime >= FALL_COOLDOWN) {
          console.log("Potential fall confirmed!");

          onFallDetected?.({
            acceleration: accelMagnitude,
            gyroscope: gyroMagnitude,
            timestamp: now,
          });

          lastFallDetectedTime = now;
        }

        resetDetection();
      }
    } else {
      // Movement resets the stillness timer.
      stillnessStart = null;
    }
  };

  window.addEventListener(
    "devicemotion",
    handleMotionEvent
  );

  return () => {
    window.removeEventListener(
      "devicemotion",
      handleMotionEvent
    );
  };
};