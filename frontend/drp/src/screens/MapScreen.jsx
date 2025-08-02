import React, { useState, useEffect, useCallback } from 'react';
import DisasterMap from '../components/DisasterMap';
import { fetchShelters } from '../redux/shelterSlice';
import { fetchLatestIncidents } from '../redux/incidentSlice';
import { useDispatch, useSelector } from 'react-redux';
// import { getCurrentLocation } from '../services/location/locationService';
import { checkAndRequestLocationPermission } from '../services/permissions/locationPermissionService';
// import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';
import { Image, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer';
import { LocationService } from '../services/LocationService';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  // const [locationName, setLocationName] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const role = useSelector(state => state.user.role);
  if (role && role !== 1) {
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
  const dispatch = useDispatch();

  // Fetch location on component mount
  useEffect(() => {
    async function fetchLocation() {
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
          // const name = await getCountryNameFromCoords(
          //   loc.latitude,
          //   loc.longitude,
          // );
          // setLocationName(name);
        } else {
          setError('Failed to fetch location');
        }
      } catch (err) {
        console.error('Location error:', err);
        setError('Failed to fetch location');
      } finally {
        setLocationLoading(false);
      }
    }

    fetchLocation();
  }, []); // Empty dependency array - only run on mount

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

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="green" />
          <Text style={styles.loadingText}>
            {locationLoading
              ? 'Getting your location...'
              : !isMapReady
              ? 'Preparing map...'
              : 'Loading disaster data...'}
          </Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : location ? (
        <DisasterMap
          key={mapKey} // 🔁 forces re-render only when mapKey changes
          shelters={shelters || []}
          incidents={incidents || []}
          latitude={location.latitude}
          longitude={location.longitude}
        />
      ) : (
        <Text style={styles.waitingText}>Waiting for location...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontSize: 18,
    marginVertical: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  waitingText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
});
