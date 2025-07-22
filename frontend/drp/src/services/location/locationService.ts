import GetLocation from 'react-native-get-location';

export async function getCurrentLocation(): Promise<any | null> {
  try {
    const location = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    return location;
  } catch (error) {
    return null;
  }
} 