import Geolocation from '@react-native-community/geolocation';

let watchId: number | null = null;
let locationCallback: ((location: any) => void) | null = null;

/**
 * Starts location tracking.
 * @param {function} callback - Callback function to handle location updates.
 * @returns {number} Watch ID.
 */
export const startLocationTracking = (callback: (location: any) => void) => {
  if (watchId) {
    stopLocationTracking();
  }

  locationCallback = callback;

  watchId = Geolocation.watchPosition(
    (location) => {
      if (locationCallback) {
        locationCallback(location);
      }
    },
    (error) => {
      console.error('Location tracking error:', error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 2000, // Update every 2 seconds
      fastestInterval: 1000, // Fastest update every 1 second
    }
  );

  return watchId;
};

/**
 * Stops location tracking.
 */
export const stopLocationTracking = () => {
  if (watchId) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
  locationCallback = null;
};
