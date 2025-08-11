import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer';
import Feather from 'react-native-vector-icons/Feather';

import { checkAndRequestLocationPermission } from "../services/permissions/locationPermissionService";
import { getCurrentLocation } from "../services/location/locationService";
import { getCountryNameFromCoords } from "../services/geocoding/geocodingService";
import LocationMap from "../services/map/mapService";
import { inHitArea, getIncident } from "../services/hitArea/inHitArea";
import Colors from '../constants/colors';
import { useSelector } from 'react-redux';

export default function Home() {
  const defaultTips = [
    "Safety doesn't happen by accident.",
    "Stay alert. Stay alive.",
    "Safety first is safety always.",
    "Your safety is our priority.",
  ];

  const [randomQuote, setRandomQuote] = useState('');
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hitAreas, setHitAreas] = useState([]);
  const [isSafe, setIsSafe] = useState(null);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [safetyTips, setSafetyTips] = useState([]);
  const [mapKey, setMapKey] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);

  const userRole = useSelector(state => state.user.role);

  if (userRole !== undefined && userRole !== null && userRole !== 1) {
    const drawerStatus = useDrawerStatus();

    useEffect(() => {
      if (drawerStatus === 'closed') {
        setMapKey(prev => prev + 1);
      }
    }, [drawerStatus]);
  }
  useEffect(() => {
    if (safetyTips.length > 0) {
      setRandomQuote(
        safetyTips[Math.floor(Math.random() * safetyTips.length)]
      );
    } else {
      setRandomQuote(
        defaultTips[Math.floor(Math.random() * defaultTips.length)]
      );
    }
  }, [safetyTips]);

  //  refresh every 10 min
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing location...');
      setRefreshTrigger(prev => prev + 1);
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Main data fetching logic with hit area check
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchLocationData() {
        try {
          setLoading(true);
          setError(null);

          const hasPermission = await checkAndRequestLocationPermission();
          if (!hasPermission) {
            if (isActive) {
              setError('Location permission denied');
              setLoading(false);
            }
            return;
          }

          const loc = await getCurrentLocation();
          if (!loc) {
            if (isActive) {
              setError('Failed to fetch location');
              setLoading(false);
            }
            return;
          }

          if (!isActive) return;

          setLocation(loc);
          const name = await getCountryNameFromCoords(loc.latitude, loc.longitude);
          if (isActive) setLocationName(name);

          const isInHitArea = await inHitArea(loc.longitude, loc.latitude);
          if (!isActive) return;

          setIsSafe(!isInHitArea);

          if (isInHitArea) {
            const incidents = await getIncident(loc.longitude, loc.latitude);
            if (isActive && Array.isArray(incidents) && incidents.length > 0) {
              setHitAreas(incidents);
              const types = incidents.map(i => i.typeId?.name).filter(Boolean);
              const tips = incidents.flatMap(i => i.typeId?.safetyTips || []);
              setIncidentTypes([...new Set(types)]);
              setSafetyTips([...new Set(tips)]);
            } else if (isActive) {
              setHitAreas([]);
              setIncidentTypes([]);
              setSafetyTips(defaultTips);
            }
          } else if (isActive) {
            setHitAreas([]);
            setIncidentTypes([]);
            setSafetyTips(defaultTips);
          }

          if (isActive) {
            setLoading(false);
            setMapKey(prev => prev + 1);
          }
        } catch (err) {
          console.error('Error fetching location data:', err);
          if (isActive) {
            setError('Failed to load location data. Please try again.');
            setLoading(false);
          }
        }
      }

      fetchLocationData();

      return () => {
        isActive = false;
      };
    }, [refreshTrigger])
  );

  useFocusEffect(
    useCallback(() => {
      console.log('Home focused — refreshing map');
      setMapKey(prev => prev + 1);

      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 100);

      return () => {
        clearTimeout(timer);
        setIsMapReady(false);
      };
    }, [])
  );

  const refreshLocationData = useCallback(() => {
    console.log('Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkerBlueGray} />
      <View style={styles.container}>
        <HeaderIcon />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.orange} />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color={Colors.red} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText} onPress={refreshLocationData}>
              Tap to retry
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationTitle}>Current Location</Text>
              </View>
              <Text style={styles.locationName}>{locationName}</Text>
            </View>

            {location?.latitude && location?.longitude && isMapReady && (
              <View style={styles.mapCard}>
                <View style={styles.mapHeader}>
                  <Feather name="map" size={24} color={Colors.orange} />
                  <Text style={styles.mapTitle}>Area Map</Text>
                </View>
                <LocationMap
                  key={mapKey}
                  latitude={location.latitude}
                  longitude={location.longitude}
                  height={250}
                  width={'100%'}
                  regionName={locationName}
                  hitAreas={hitAreas}
                />
              </View>
            )}

            <Status isSafe={isSafe} types={incidentTypes} />

            <Text style={styles.simpleTipText}>{randomQuote}</Text>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const HeaderIcon = () => (
  <View style={styles.headerIconContainer}>
    <Feather name="map-pin" size={50} color={Colors.orange} />
    <Text style={styles.headerIconText}>Your spot, your safety.</Text>
  </View>
);

const Status = ({ isSafe, types }) => {
  if (isSafe === null) {
    return (
      <View style={styles.statusCard}>
        <ActivityIndicator size="small" color={Colors.orange} />
        <Text style={styles.statusLoadingText}>Checking area status...</Text>
      </View>
    );
  }

  const statusColor = isSafe ? Colors.green : Colors.red;
  const statusIcon = isSafe ? 'check-circle' : 'alert-triangle';
  const statusText = isSafe
    ? 'You are in a safe area.'
    : `You're in an affected area: ${types.join(', ')}. Stay safe.`;

  return (
    <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
      <View style={styles.statusHeader}>
        <Feather name={statusIcon} size={24} color={statusColor} />
        <Text style={[styles.statusTitle, { color: statusColor }]}>
          {isSafe ? 'Safe Area' : 'Affected Area'}
        </Text>
      </View>
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.darkerBlueGray,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.darkerBlueGray,
  },
  content: {
    flex: 1,
    padding: 0,
  },
  headerIconContainer: {
    alignSelf: 'center',
    marginVertical: 0,
    backgroundColor: Colors.darkestBlueGray,
    padding: 12,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  headerIconText: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '300',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.red,
    textAlign: 'center',
  },
  retryText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.orange,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  locationCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textColor,
    marginLeft: 8,
  },
  locationName: {
    fontSize: 26,
    fontWeight: '200',
    color: Colors.orange,
    textAlign: 'center',
  },
  mapCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textColor,
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 16,
    color: Colors.textColor,
    lineHeight: 22,
  },
  statusLoadingText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  simpleTipText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
});