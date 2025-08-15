import React, { useState, useEffect, useCallback } from 'react';
import DisasterMap from '../components/DisasterMap';
import { fetchShelters } from '../redux/shelterSlice';
import { fetchLatestIncidents } from '../redux/incidentSlice';
import { useDispatch, useSelector } from 'react-redux';
import { checkAndRequestLocationPermission } from '../services/permissions/locationPermissionService';
import { 
  Image, 
  View, 
  ActivityIndicator, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer';
import { LocationService } from '../services/LocationService';
// import colors from '../constants/colors';
import {useTheme} from '../hooks/useThem';
import CustomLoader from '../components/CustomLoader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MapScreen() {
  const { colors, isDarkMode } = useTheme(); 
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blueGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: colors.darkerBlueGray,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.orange,
    maxWidth: 350,
    width: '100%',
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textColor,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  tryAgainButton: {
    backgroundColor: colors.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
  },
  buttonIcon: {
    marginRight: 8,
  },
  tryAgainText: {
    color: colors.textColor,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waitingCard: {
    backgroundColor: colors.darkerBlueGray,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  waitingText: {
    fontSize: 16,
    color: colors.textColor,
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  
  const role = useSelector(state => state.user.role);
  if (role !== undefined && role !== null && role !== 1) {
    const drawerStatus = useDrawerStatus();

    useEffect(() => {
      if (drawerStatus === 'closed') {
        // Drawer just closed, refresh the map
        setMapKey(prev => prev + 1);
      }
    }, [drawerStatus]);
  }
  const shelters = useSelector(state => state.shelter.shelters);
  const incidents = useSelector(state => state.incident.incidents);
  const userLocations = useSelector(state => state.user.locations);
  const dispatch = useDispatch();

  // Function to fetch location (extracted for reuse)
  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    setError(null);

    try {
      const hasPermission = await checkAndRequestLocationPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        setLocationLoading(false);
        return;
      }
      const locationService = LocationService.getInstance();
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        setLocation(loc);
        console.log('Location fetched:', loc);
      } else {
        setError('Failed to fetch location');
      }
    } catch (err) {
      console.error('Location error:', err);
      setError('Failed to fetch location');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Fetch location on component mount
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]); // Include fetchLocation in dependencies

  // Fetch Redux data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        await Promise.all([
          dispatch(fetchShelters()),
          dispatch(fetchLatestIncidents()),
        ]);
        console.log('Redux data fetch completed');
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Log data when it changes (for debugging)
  useEffect(() => {
    console.log('Shelters updated:', shelters);
  }, [shelters]);

  useEffect(() => {
    console.log('Incidents updated:', incidents);
  }, [incidents]);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused — resetting map key');
      setMapKey(prev => prev + 1);
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 100);

      return () => {
        clearTimeout(timer);
        setIsMapReady(false);
      };
    }, []),
  );

  // Determine overall loading state
  const isLoading = locationLoading || dataLoading;

  // Get appropriate loading text
  const getLoadingText = () => {
    if (locationLoading) return 'Getting your location...';
    if (!isMapReady) return 'Preparing map...';
    return 'Loading disaster data...';
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <CustomLoader
          visible={true}
          text={getLoadingText()}
        />
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <MaterialCommunityIcons
              name="map-marker-off"
              size={60}
              color={colors.orange}
              style={styles.errorIcon}
            />
            <Text style={styles.errorTitle}>Location Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity 
              style={styles.tryAgainButton}
              onPress={fetchLocation}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color={colors.textColor}
                style={styles.buttonIcon}
              />
              <Text style={styles.tryAgainText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : location ? (
        <DisasterMap
          key={mapKey} // 🔁 forces re-render only when mapKey changes
          shelters={shelters || []}
          incidents={incidents || []}
          userLocations={userLocations || []}
          latitude={location.latitude}
          longitude={location.longitude}
          setLocation={setLocation}
        />
      ) : (
        <View style={styles.waitingContainer}>
          <View style={styles.waitingCard}>
            <ActivityIndicator size="large" color={colors.orange} />
            <Text style={styles.waitingText}>Waiting for location...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

