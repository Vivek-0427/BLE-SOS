import { Timestamp } from "firebase/firestore";

export const startMotionSensors = ({onAcceleration, onRotation, onFallDetected, fallDetectionEnabled = true, onError}) => {

    if (!window.DeviceMotionEvent) {
        onError?.('DeviceMotionEvent is not supported in this browser.');
        return () => {};
    }

    let impactDetected = false;
    let impactTime = 0;
    let stillessStart = null;

    const FALL_THRESHOLD = 14; // m/s²
    const STILLNESS_MIN = 7.5;
    const STILLNESS_MAX = 12.5;
    const GYRO_THRESHOLD = 25;

    const STILLNESS_DURATION = 1000; // 1 second

    const handleMotionEvent = (event) => {
        const acceleration = event.accelerationIncludingGravity;
        const rotationRate = event.rotationRate;

        if (!acceleration) return;
        
        const x = acceleration.x ?? 0;
        const y = acceleration.y ?? 0;
        const z = acceleration.z ?? 0;
        
        const accelMagnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        
        let gyroMagnitude = 0;

        if (rotationRate) {
            const alpha = rotationRate.alpha ?? 0;
            const beta = rotationRate.beta ?? 0;
            const gamma = rotationRate.gamma ?? 0;
            gyroMagnitude = Math.sqrt(alpha ** 2 + beta ** 2 + gamma ** 2);
        } 

        // Send live sensor data to the callback functions
        onAcceleration?.({ x, y, z, magnitude: accelMagnitude });

        onRotation?.({ alpha: rotationRate?.alpha ?? 0, beta: rotationRate?.beta ?? 0, gamma: rotationRate?.gamma ?? 0, magnitude: gyroMagnitude });

        // Fall detection logic
        if(!fallDetectionEnabled){
            impactDetected = false;
            stillessStart = null;
            return;
        }

        // Detect High Impact
        if(!impactDetected && accelMagnitude > FALL_THRESHOLD){
            impactDetected = true;
            impactTime = Date.now();
            stillessStart = null;

            console.log("High impact detected. Accel:", accelMagnitude.toFixed(2), "Gyro:", gyroMagnitude.toFixed(2));
            return;
        }
        
        // After impact, check for stillness
        if(impactDetected){
            const timeSinceImpact = Date.now() - impactTime;

            // ignore movement for the first 500ms after impact
            if(timeSinceImpact < 500){
                return;
            }

            const isStill = accelMagnitude >= STILLNESS_MIN && accelMagnitude <= STILLNESS_MAX && gyroMagnitude < GYRO_THRESHOLD;

            if(isStill){
                if(!stillessStart){
                    stillessStart = Date.now();
                }
                const stillnessDuration = Date.now() - stillessStart;

                // Still for 1 sec
                if(stillnessDuration >= STILLNESS_DURATION){
                    console.log("Fall detected!");
                    onFallDetected?.({ acceleration: accelMagnitude, gyroscope: gyroMagnitude, timestamp: Date.now() });

                    // Reset detection state
                    impactDetected = false;
                    stillessStart = null;
                }
            }else{
                // Reset stillness timer if movement is detected
                stillessStart = null;
            }
            // Cancel if too much time passes
            if(timeSinceImpact > 3000){
                impactDetected = false;
                stillessStart = null;
            }
        }
    };

    window.addEventListener('devicemotion', handleMotionEvent);

    // Cleanup function to remove the event listener when no longer needed
    return () => {
        window.removeEventListener('devicemotion', handleMotionEvent);
    };
};