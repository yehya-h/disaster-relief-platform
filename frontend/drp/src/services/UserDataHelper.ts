// src/services/UserDataHelper.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { UserDataModule } = NativeModules;

export class UserDataHelper {
  
  // Set user ID when user logs in (this will be used by the background service)
  // static async setUserId(userId: string): Promise<void> {
  //   try {
  //     await AsyncStorage.setItem('userId', userId);
      
  //     // Also save to native SharedPreferences for background service access
  //     if (UserDataModule) {
  //       await UserDataModule.setUserId(userId);
  //     }
      
  //     console.log('User ID saved:', userId);
  //   } catch (error) {
  //     console.error('Error saving user ID:', error);
  //   }
  // }

  // Set auth token (optional, for API authentication)
  static async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('token', token);
      
      if (UserDataModule) {
        console.log('Setting auth token in native module:', token);
        await UserDataModule.setAuthToken(token);
      }
      
      console.log('Auth token saved');
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  // Get user ID
  // static async getUserId(): Promise<string | null> {
  //   try {
  //     return await AsyncStorage.getItem('userId');
  //   } catch (error) {
  //     console.error('Error getting user ID:', error);
  //     return null;
  //   }
  // }

  // Clear user data on logout
  static async clearUserData(): Promise<void> {
    try {
      // await AsyncStorage.multiRemove(['userId', 'authToken']);
      await AsyncStorage.removeItem('token');
      
      if (UserDataModule) {
        await UserDataModule.clearUserData();
      }
      
      console.log('User data cleared');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

// Usage in your login component:
/*
import { UserDataHelper } from '../services/UserDataHelper';

// After successful login
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('https://your-api.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Save user data for background service
      await UserDataHelper.setUserId(data.user.id);
      await UserDataHelper.setAuthToken(data.token);
      
      // Now you can start the location service
      const locationService = LocationService.getInstance();
      await locationService.startBackgroundLocationService();
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
*/