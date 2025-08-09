import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const { BackgroundLocationModule } = NativeModules;

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export class LocationService {
  private static instance: LocationService;
  private isServiceRunning = false;
  private watchId: number | null = null;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Request all necessary permissions for Android 14+
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      // First request basic location permissions
      const basicPermissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];

      const basicGranted = await PermissionsAndroid.requestMultiple(basicPermissions);

      // Then request background location permission (Android 10+)
      let backgroundGranted = true;
      if (Platform.Version >= 29) {
        const backgroundResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message: 'This app needs access to location when running in the background.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        backgroundGranted = backgroundResult === PermissionsAndroid.RESULTS.GRANTED;
      }

      // Request notification permission for Android 13+
      let notificationGranted = true;
      if (Platform.Version >= 33) {
        const notificationResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs to show notifications for location tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        notificationGranted = notificationResult === PermissionsAndroid.RESULTS.GRANTED;
      }

      const basicAllGranted = Object.values(basicGranted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      return basicAllGranted && backgroundGranted && notificationGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Start background location service
  async startBackgroundLocationService(): Promise<boolean> {
    try {
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Required permissions not granted');
      }

      if (BackgroundLocationModule) {
        await BackgroundLocationModule.startLocationService();
        this.isServiceRunning = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting background service:', error);
      return false;
    }
  }

  // Stop background location service
  async stopBackgroundLocationService(): Promise<void> {
    try {
      if (BackgroundLocationModule) {
        await BackgroundLocationModule.stopLocationService();
        this.isServiceRunning = false;
      }
    } catch (error) {
      console.error('Error stopping background service:', error);
    }
  }

  // Check if service is running
  isRunning(): boolean {
    return this.isServiceRunning;
  }

  // Get location updates (for foreground use) - improved version using watchPosition
  async getLocationUpdates(callback: (location: LocationData) => void): Promise<void> {
    // Stop any existing watch
    this.stopLocationUpdates();

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        callback(location);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000, // Fastest update every 2 seconds
      }
    );
  }

  // Stop location updates
  stopLocationUpdates(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // // Alternative method: Get location updates with interval (similar to original)
  // async getLocationUpdatesWithInterval(callback: (location: LocationData) => void): Promise<void> {
  //   const interval = setInterval(async () => {
  //     const location = await this.getCurrentLocation();
  //     if (location) {
  //       callback(location);
  //     }
  //   }, 15 * 1000); // 15 seconds interval

  //   // Store interval ID for cleanup
  //   (this as any).locationInterval = interval;
  // }

  // Stop interval-based location updates
  // stopLocationUpdatesWithInterval(): void {
  //   if ((this as any).locationInterval) {
  //     clearInterval((this as any).locationInterval);
  //     (this as any).locationInterval = null;
  //   }
  // }
}