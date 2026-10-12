export const getCurrentLocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ latitude: null, longitude: null,accuracy: null,available: false });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    available: true
                });
            },
            (error) => {
                console.warn(`Error getting location: ${error.message}`);
                resolve({ latitude: null, longitude: null,accuracy: null,available: false });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    });
};
    
